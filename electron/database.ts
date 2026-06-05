import fs from "node:fs";
import path from "node:path";
import initSqlJs, { type Database as SqlDatabase, type SqlValue } from "sql.js";
import type { FolderIconRecord, Settings, SettingValue } from "./types.js";

const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  autoRefreshExplorer: true,
  lastColor: "#22c55e",
  iconStyle: "classic",
  keepIconCopy: true
};

export class AppDatabase {
  private db: SqlDatabase;
  private dbPath: string;

  private constructor(userDataPath: string, db: SqlDatabase) {
    fs.mkdirSync(userDataPath, { recursive: true });
    this.dbPath = path.join(userDataPath, "tintd-pro.sqlite");
    this.db = db;
    this.migrate();
    this.ensureDefaults();
  }

  static async open(userDataPath: string) {
    fs.mkdirSync(userDataPath, { recursive: true });
    const dbPath = path.join(userDataPath, "tintd-pro.sqlite");
    const SQL = await initSqlJs();
    const db = fs.existsSync(dbPath)
      ? new SQL.Database(fs.readFileSync(dbPath))
      : new SQL.Database();

    return new AppDatabase(userDataPath, db);
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
    `);
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
