/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    dump(): Promise<ArrayBuffer>;
    batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
    exec(query: string): Promise<D1Result>;
  }

  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    first<T = any>(colName?: string): Promise<T | null>;
    run(): Promise<D1Result>;
    all<T = any>(): Promise<D1Result<T>>;
    raw<T = any>(): Promise<T[]>;
  }

  interface D1Result<T = any> {
    lastRowId: number | null;
    changes: number;
    duration: number;
    results?: T[];
    success: boolean;
    meta: {
      duration: number;
      size_after: number;
      rows_read: number;
      rows_written: number;
    };
  }
}

export {};
