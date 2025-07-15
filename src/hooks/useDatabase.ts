import { ref, computed } from 'vue';
import { DatabaseService, createDatabaseService } from '../services/database';

// Global state for database service
const globalDatabaseService = ref<DatabaseService | null>(null);
const globalIsMockData = ref(false);

export const useDatabase = () => {
  const initialize = (d1Database?: D1Database) => {
    try {
      globalDatabaseService.value = createDatabaseService(d1Database);
      globalIsMockData.value = globalDatabaseService.value.isMockData();

      console.log('Database initialized:', {
        isMockData: globalIsMockData.value,
        apiBaseUrl: globalDatabaseService.value.getApiBaseUrl()
      });
    } catch (error) {
      console.error('Error initializing database:', error);
      globalIsMockData.value = true;
    }
  };

  const getDatabaseService = () => globalDatabaseService.value;

  return {
    initialize,
    getDatabaseService,
    isMockData: computed(() => globalIsMockData.value)
  };
};
