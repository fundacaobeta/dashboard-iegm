import { computed } from 'vue';
import { useDatabase } from './useDatabase';
import { createIEGMServices } from '../services/iegm';
import type { IEGMServices } from '../services/iegm';

export function useIEGMServices() {
  const { getDatabaseService, isMockData } = useDatabase();

  const services = computed<IEGMServices | null>(() => {
    const dbService = getDatabaseService();
    if (!dbService) {
      return null;
    }
    return createIEGMServices(dbService);
  });

  const municipioService = computed(() => services.value?.municipio || null);
  const analiseService = computed(() => services.value?.analise || null);

  return {
    services,
    municipioService,
    analiseService,
    isReady: computed(() => services.value !== null)
  };
}
 