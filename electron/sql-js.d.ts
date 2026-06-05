declare module "sql.js" {
  export type SqlValue = string | number | Uint8Array | null | undefined;

  export interface Statement {
    bind(values?: Record<string, SqlValue>): boolean;
    step(): boolean;
    getAsObject(): Record<string, SqlValue>;
    run(values?: Record<string, SqlValue>): void;
    free(): boolean;
  }

  export interface Database {
    exec(sql: string): Array<{
      columns: string[];
      values: SqlValue[][];
    }>;
    prepare(sql: string): Statement;
    export(): Uint8Array;
  }

  export interface SqlJsStatic {
    Database: new (data?: Uint8Array | Buffer) => Database;
  }

  export default function initSqlJs(config?: unknown): Promise<SqlJsStatic>;
}