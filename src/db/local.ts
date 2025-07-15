import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Para desenvolvimento local (apenas server-side)
export function createLocalDB() {
  try {
    const sqlite = new Database('local.db');
    return drizzle(sqlite, { schema });
  } catch (error) {
    console.error('Erro ao criar banco local:', error);
    return null;
  }
}

export type LocalDB = ReturnType<typeof createLocalDB>;
