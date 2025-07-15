import { drizzle } from 'drizzle-orm/d1';
import { createDB } from '../../db';

export interface DatabaseConfig {
  useMockData: boolean;
  apiBaseUrl: string;
}

export class DatabaseService {
  private db: ReturnType<typeof createDB> | null = null;
  private config: DatabaseConfig;

  constructor(d1Database?: D1Database, config?: Partial<DatabaseConfig>) {
    const defaultConfig: DatabaseConfig = {
      useMockData: false,
      apiBaseUrl: 'http://localhost:3001/api'
    };

    this.config = { ...defaultConfig, ...config };

    try {
      this.db = createDB(d1Database);
      if (!this.db) {
        console.warn('Banco de dados não disponível, usando API local');
        this.config.useMockData = true;
      } else {
        console.log('Banco de dados conectado com sucesso');
        this.config.useMockData = false;
      }
    } catch (error) {
      console.error('Erro ao inicializar banco:', error);
      this.config.useMockData = true;
    }
  }

  getDb() {
    return this.db;
  }

  isMockData() {
    return this.config.useMockData;
  }

  getApiBaseUrl() {
    return this.config.apiBaseUrl;
  }

  getConfig() {
    return this.config;
  }
}

export const createDatabaseService = (d1Database?: D1Database, config?: Partial<DatabaseConfig>) => {
  return new DatabaseService(d1Database, config);
};
 