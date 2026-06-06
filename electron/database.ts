import fs from "node:fs";
import path from "node:path";
import initSqlJs, { type Database as SqlDatabase, type SqlValue } from "sql.js";
import type { FolderIconRecord, Settings, SettingValue } from "./types.js";

const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  autoRefreshExplorer: true,
  lastColor: "#22c55e",
  iconStyle: "classic",
  keepIconCopy: true,
  autoApply: false
};

export class AppDatabase {
  private db: SqlDatabase;
  private dbPath: string;

  private constructor(userDataPath: string, db: SqlDatabase, defaultWatchPaths: string[]) {
    fs.mkdirSync(userDataPath, { recursive: true });
    this.dbPath = path.join(userDataPath, "tintd-pro.sqlite");
    this.db = db;
    this.migrate();
    this.ensureDefaults();
    this.ensureWatcherDefaults(defaultWatchPaths);
  }

  static async open(userDataPath: string, defaultWatchPaths: string[] = []) {
    fs.mkdirSync(userDataPath, { recursive: true });
    const dbPath = path.join(userDataPath, "tintd-pro.sqlite");
    const SQL = await initSqlJs();
    const db = fs.existsSync(dbPath)
      ? new SQL.Database(fs.readFileSync(dbPath))
      : new SQL.Database();

    return new AppDatabase(userDataPath, db, defaultWatchPaths);
  }

  getSettings(): Settings {
    const rows = this.all<{ key: keyof Settings; value: string }>(
      "SELECT key, value FROM settings"
    );

    return rows.reduce<Settings>((settings, row) => {
      return {
        ...settings,
        [row.key]: JSON.parse(row.value) as SettingValue
      };
    }, { ...DEFAULT_SETTINGS });
  }

  setSetting(key: keyof Settings, value: SettingValue): Settings {
    this.run(
      "INSERT INTO settings (key, value) VALUES (:key, :value) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      { ":key": key, ":value": JSON.stringify(value) }
    );
    this.persist();

    return this.getSettings();
  }

  upsertIconRecord(record: Omit<FolderIconRecord, "id">): FolderIconRecord {
    const existing = this.get<{ id: number }>(
      "SELECT id FROM icon_jobs WHERE folderPath = :folderPath",
      { ":folderPath": record.folderPath }
    );

    if (existing) {
      this.run(
        `UPDATE icon_jobs
           SET color = @color,
               iconPath = @iconPath,
               status = @status,
               updatedAt = @updatedAt,
               message = @message
           WHERE id = @id`,
        this.recordParams({ ...record, id: existing.id })
      );
      this.persist();

      return { ...record, id: existing.id };
    }

    this.run(
      `INSERT INTO icon_jobs (folderPath, color, iconPath, status, updatedAt, message)
       VALUES (@folderPath, @color, @iconPath, @status, @updatedAt, @message)`,
      this.recordParams(record)
    );
    const id = Number(this.db.exec("SELECT last_insert_rowid() AS id")[0].values[0][0]);
    this.persist();

    return { ...record, id };
  }

  getIconHistory(): FolderIconRecord[] {
    return this.all<FolderIconRecord>(
      `SELECT id, folderPath, color, iconPath, status, updatedAt, message
         FROM icon_jobs
         ORDER BY datetime(updatedAt) DESC
         LIMIT 50`
    );
  }

  saveFolderCustomization(data: {
    folderPath: string;
    icoPath: string;
    selectedIcon: string;
    selectedColor: string;
    appliedDate: string;
  }) {
    this.run(
      `INSERT INTO folder_customizations (folderPath, icoPath, selectedIcon, selectedColor, appliedDate)
       VALUES (:folderPath, :icoPath, :selectedIcon, :selectedColor, :appliedDate)
       ON CONFLICT(folderPath) DO UPDATE SET
         icoPath = excluded.icoPath,
         selectedIcon = excluded.selectedIcon,
         selectedColor = excluded.selectedColor,
         appliedDate = excluded.appliedDate`,
      {
        ":folderPath": data.folderPath,
        ":icoPath": data.icoPath,
        ":selectedIcon": data.selectedIcon,
        ":selectedColor": data.selectedColor,
        ":appliedDate": data.appliedDate
      }
    );
    this.persist();
  }

  getFolderCustomization(folderPath: string) {
    return this.get<{
      id: number;
      folderPath: string;
      icoPath: string;
      selectedIcon: string;
      selectedColor: string;
      appliedDate: string;
    }>("SELECT * FROM folder_customizations WHERE folderPath = :folderPath", {
      ":folderPath": folderPath
    });
  }

  removeFolderCustomization(folderPath: string) {
    this.run("DELETE FROM folder_customizations WHERE folderPath = :folderPath", {
      ":folderPath": folderPath
    });
    this.persist();
  }

  getCustomizationHistory() {
    return this.all<{
      id: number;
      folderPath: string;
      icoPath: string;
      selectedIcon: string;
      selectedColor: string;
      appliedDate: string;
    }>("SELECT id, folderPath, icoPath, selectedIcon, selectedColor, appliedDate FROM folder_customizations ORDER BY datetime(appliedDate) DESC LIMIT 50");
  }

  private migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS icon_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folderPath TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        iconPath TEXT NOT NULL,
        status TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        message TEXT
      );

      CREATE TABLE IF NOT EXISTS folder_customizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folderPath TEXT NOT NULL UNIQUE,
        icoPath TEXT NOT NULL,
        selectedIcon TEXT NOT NULL,
        selectedColor TEXT NOT NULL,
        appliedDate TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS watcher_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        isEnabled INTEGER DEFAULT 0,
        watchPaths TEXT NOT NULL,
        autoStyleDelay INTEGER DEFAULT 3000,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS watcher_activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folderPath TEXT NOT NULL,
        folderName TEXT NOT NULL,
        suggestedIcon TEXT NOT NULL,
        appliedColor TEXT NOT NULL,
        confidence INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        status TEXT NOT NULL
      );
    `);

    try {
      this.db.exec("ALTER TABLE watcher_settings ADD COLUMN autoStyleDelay INTEGER DEFAULT 3000;");
    } catch (e) {
      // ignore if column already exists
    }
  }

  private ensureWatcherDefaults(defaultPaths: string[]) {
    const row = this.get("SELECT id FROM watcher_settings LIMIT 1");
    if (!row) {
      this.run(
        "INSERT INTO watcher_settings (isEnabled, watchPaths, autoStyleDelay) VALUES (:isEnabled, :watchPaths, :autoStyleDelay)",
        {
          ":isEnabled": 0,
          ":watchPaths": JSON.stringify(defaultPaths),
          ":autoStyleDelay": 3000
        }
      );
      this.persist();
    }
  }

  getWatcherSettings(): { isEnabled: boolean; watchPaths: string[]; autoStyleDelay: number } {
    const row = this.get<{ isEnabled: number; watchPaths: string; autoStyleDelay: number }>(
      "SELECT isEnabled, watchPaths, autoStyleDelay FROM watcher_settings LIMIT 1"
    );
    if (row) {
      return {
        isEnabled: row.isEnabled === 1,
        watchPaths: JSON.parse(row.watchPaths) as string[],
        autoStyleDelay: row.autoStyleDelay !== undefined ? row.autoStyleDelay : 3000
      };
    }
    return { isEnabled: false, watchPaths: [], autoStyleDelay: 3000 };
  }

  setWatcherEnabled(isEnabled: boolean) {
    this.run(
      "UPDATE watcher_settings SET isEnabled = :isEnabled, updatedAt = CURRENT_TIMESTAMP",
      { ":isEnabled": isEnabled ? 1 : 0 }
    );
    this.persist();
  }

  setWatcherPaths(watchPaths: string[]) {
    this.run(
      "UPDATE watcher_settings SET watchPaths = :watchPaths, updatedAt = CURRENT_TIMESTAMP",
      { ":watchPaths": JSON.stringify(watchPaths) }
    );
    this.persist();
  }

  setWatcherDelay(delayMs: number) {
    this.run(
      "UPDATE watcher_settings SET autoStyleDelay = :delayMs, updatedAt = CURRENT_TIMESTAMP",
      { ":delayMs": delayMs }
    );
    this.persist();
  }

  getWatcherActivity(limit = 10): any[] {
    return this.all<any>(
      `SELECT id, folderPath, folderName, suggestedIcon, appliedColor, confidence, timestamp, status
       FROM watcher_activity
       ORDER BY datetime(timestamp) DESC
       LIMIT :limit`,
      { ":limit": limit }
    );
  }

  addWatcherActivity(activity: {
    folderPath: string;
    folderName: string;
    suggestedIcon: string;
    appliedColor: string;
    confidence: number;
    status: string;
  }) {
    this.run(
      `INSERT INTO watcher_activity (folderPath, folderName, suggestedIcon, appliedColor, confidence, timestamp, status)
       VALUES (:folderPath, :folderName, :suggestedIcon, :appliedColor, :confidence, :timestamp, :status)`,
      {
        ":folderPath": activity.folderPath,
        ":folderName": activity.folderName,
        ":suggestedIcon": activity.suggestedIcon,
        ":appliedColor": activity.appliedColor,
        ":confidence": activity.confidence,
        ":timestamp": new Date().toISOString(),
        ":status": activity.status
      }
    );
    this.persist();
  }

  private ensureDefaults() {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      this.run("INSERT OR IGNORE INTO settings (key, value) VALUES (:key, :value)", {
        ":key": key,
        ":value": JSON.stringify(value)
      });
    }
    this.persist();
  }

  private get<T>(sql: string, params: Record<string, SqlValue> = {}): T | undefined {
    return this.all<T>(sql, params)[0];
  }

  private all<T>(sql: string, params: Record<string, SqlValue> = {}): T[] {
    const statement = this.db.prepare(sql);
    statement.bind(params);
    const rows: T[] = [];

    while (statement.step()) {
      rows.push(statement.getAsObject() as T);
    }

    statement.free();
    return rows;
  }

  private run(sql: string, params: Record<string, SqlValue> = {}) {
    const statement = this.db.prepare(sql);
    statement.run(params);
    statement.free();
  }

  private persist() {
    fs.writeFileSync(this.dbPath, Buffer.from(this.db.export()));
  }

  private recordParams(record: Omit<FolderIconRecord, "id"> & { id?: number }) {
    return {
      "@id": record.id,
      "@folderPath": record.folderPath,
      "@color": record.color,
      "@iconPath": record.iconPath,
      "@status": record.status,
      "@updatedAt": record.updatedAt,
      "@message": record.message
    };
  }
}
