import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Para produção no Cloudflare Workers
export function createD1DB(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Factory para criar o banco baseado no ambiente
export function createDB(d1Database?: D1Database) {
  if (d1Database) {
    return createD1DB(d1Database);
  }

  // Em desenvolvimento, retornar null para usar dados mock
  if (process.env.NODE_ENV === 'development' || !d1Database) {
    return null;
  }

  return null;
}

// Tipos exportados
export type DB = ReturnType<typeof createD1DB> | null;
export { schema };
