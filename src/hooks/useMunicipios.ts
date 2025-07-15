import { ref, computed } from 'vue';
import { useIEGMServices } from './useIEGMServices';
import type {
  Municipio,
  MunicipioQuery,
  RankingQuery,
  EstatisticasQuery,
  RankingItem,
  EstatisticasGerais,
  FaixaDistribuicao
} from '../services/iegm';

export function useMunicipios() {
  const { municipioService, isReady } = useIEGMServices();

  // Estado reativo
  const municipios = ref<Municipio[]>([]);
  const municipioAtual = ref<Municipio | null>(null);
  const ranking = ref<RankingItem[]>([]);
  const estatisticas = ref<EstatisticasGerais | null>(null);
  const faixasDistribuicao = ref<FaixaDistribuicao[]>([]);

  // Estado de loading
  const loading = ref({
    municipios: false,
    municipioAtual: false,
    ranking: false,
    estatisticas: false,
    faixas: false
  });

  // Estado de erro
  const error = ref({
    municipios: null as string | null,
    municipioAtual: null as string | null,
    ranking: null as string | null,
    estatisticas: null as string | null,
    faixas: null as string | null
  });

  // ============================================================================
  // MÉTODOS DE CARREGAMENTO
  // ============================================================================

  const loadMunicipios = async (query: MunicipioQuery) => {
    if (!isReady.value || !municipioService.value) {
      console.warn('Municipio service not ready');
      return;
    }

    loading.value.municipios = true;
    error.value.municipios = null;

    try {
      const data = await municipioService.value.getMunicipios(query);
      municipios.value = data;
    } catch (err) {
      error.value.municipios = err instanceof Error ? err.message : 'Failed to load municipios';
      console.error('Error loading municipios:', err);
    } finally {
      loading.value.municipios = false;
    }
  };

  const loadMunicipioByNome = async (nome: string, ano: number) => {
    if (!isReady.value || !municipioService.value) {
      console.warn('Municipio service not ready');
      return;
    }

    loading.value.municipioAtual = true;
    error.value.municipioAtual = null;

    try {
      const data = await municipioService.value.getMunicipioByNome(nome, ano);
      municipioAtual.value = data;
    } catch (err) {
      error.value.municipioAtual = err instanceof Error ? err.message : 'Failed to load municipio';
      console.error('Error loading municipio:', err);
    } finally {
      loading.value.municipioAtual = false;
    }
  };

  const loadRanking = async (query: RankingQuery) => {
    if (!isReady.value || !municipioService.value) {
      console.warn('Municipio service not ready');
      return;
    }

    loading.value.ranking = true;
    error.value.ranking = null;

    try {
      const data = await municipioService.value.getRanking(query);
      ranking.value = data;
    } catch (err) {
      error.value.ranking = err instanceof Error ? err.message : 'Failed to load ranking';
      console.error('Error loading ranking:', err);
    } finally {
      loading.value.ranking = false;
    }
  };

  const loadEstatisticas = async (query: EstatisticasQuery) => {
    if (!isReady.value || !municipioService.value) {
      console.warn('Municipio service not ready');
      return;
    }

    loading.value.estatisticas = true;
    error.value.estatisticas = null;

    try {
      const data = await municipioService.value.getEstatisticas(query);
      estatisticas.value = data;
    } catch (err) {
      error.value.estatisticas = err instanceof Error ? err.message : 'Failed to load statistics';
      console.error('Error loading statistics:', err);
    } finally {
      loading.value.estatisticas = false;
    }
  };

  const loadFaixasDistribuicao = async (ano: number) => {
    if (!isReady.value || !municipioService.value) {
      console.warn('Municipio service not ready');
      return;
    }

    loading.value.faixas = true;
    error.value.faixas = null;

    try {
      const data = await municipioService.value.getFaixasDistribuicao(ano);
      faixasDistribuicao.value = data;
    } catch (err) {
      error.value.faixas = err instanceof Error ? err.message : 'Failed to load faixas distribution';
      console.error('Error loading faixas distribution:', err);
    } finally {
      loading.value.faixas = false;
    }
  };

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const isLoading = computed(() => {
    return Object.values(loading.value).some(Boolean);
  });

  const hasError = computed(() => {
    return Object.values(error.value).some(Boolean);
  });

  const topMunicipios = computed(() => {
    return ranking.value.slice(0, 10);
  });

  const municipioRanking = computed(() => {
    if (!municipioAtual.value) return null;
    return ranking.value.find(item => item.municipio === municipioAtual.value?.municipio);
  });

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  const clearError = (type: keyof typeof error.value) => {
    error.value[type] = null;
  };

  const clearAllErrors = () => {
    Object.keys(error.value).forEach(key => {
      error.value[key as keyof typeof error.value] = null;
    });
  };

  const reset = () => {
    municipios.value = [];
    municipioAtual.value = null;
    ranking.value = [];
    estatisticas.value = null;
    faixasDistribuicao.value = [];
    clearAllErrors();
  };

  return {
    // Estado
    municipios: computed(() => municipios.value),
    municipioAtual: computed(() => municipioAtual.value),
    ranking: computed(() => ranking.value),
    estatisticas: computed(() => estatisticas.value),
    faixasDistribuicao: computed(() => faixasDistribuicao.value),

    // Loading
    loading: computed(() => loading.value),
    isLoading,

    // Erro
    error: computed(() => error.value),
    hasError,

    // Computed
    topMunicipios,
    municipioRanking,

    // Métodos
    loadMunicipios,
    loadMunicipioByNome,
    loadRanking,
    loadEstatisticas,
    loadFaixasDistribuicao,
    clearError,
    clearAllErrors,
    reset
  };
}
