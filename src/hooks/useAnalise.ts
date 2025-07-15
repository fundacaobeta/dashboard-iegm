import { ref, computed } from 'vue';
import { useIEGMServices } from './useIEGMServices';
import type {
  RespostaDetalhada,
  AnaliseMelhoria,
  PontoForte,
  PontoMelhoria,
  DimensaoAnalise,
  ComparativoAnoAnterior,
  RespostasQuery
} from '../services/iegm';

export function useAnalise() {
  const { analiseService, isReady } = useIEGMServices();

  // Estado reativo
  const dimensoesAnalise = ref<DimensaoAnalise[]>([]);
  const pontosFortes = ref<PontoForte[]>([]);
  const pontosMelhoria = ref<PontoMelhoria[]>([]);
  const respostasDetalhadas = ref<RespostaDetalhada[]>([]);
  const analiseMelhorias = ref<AnaliseMelhoria[]>([]);
  const comparativoAnoAnterior = ref<ComparativoAnoAnterior | null>(null);

  // Estado de loading
  const loading = ref({
    dimensoes: false,
    pontosFortes: false,
    pontosMelhoria: false,
    respostas: false,
    analiseMelhorias: false,
    comparativo: false
  });

  // Estado de erro
  const error = ref({
    dimensoes: null as string | null,
    pontosFortes: null as string | null,
    pontosMelhoria: null as string | null,
    respostas: null as string | null,
    analiseMelhorias: null as string | null,
    comparativo: null as string | null
  });

  // ============================================================================
  // MÉTODOS DE CARREGAMENTO
  // ============================================================================

  const loadDimensaoAnalise = async (municipio: string, ano: number) => {
    if (!isReady.value || !analiseService.value) {
      console.warn('Analise service not ready');
      return;
    }

    loading.value.dimensoes = true;
    error.value.dimensoes = null;

    try {
      const data = await analiseService.value.getDimensaoAnalise(municipio, ano);
      dimensoesAnalise.value = data;
    } catch (err) {
      error.value.dimensoes = err instanceof Error ? err.message : 'Failed to load dimension analysis';
      console.error('Error loading dimension analysis:', err);
    } finally {
      loading.value.dimensoes = false;
    }
  };

  const loadPontosFortes = async (municipio: string, ano: number) => {
    if (!isReady.value || !analiseService.value) {
      console.warn('Analise service not ready');
      return;
    }

    loading.value.pontosFortes = true;
    error.value.pontosFortes = null;

    try {
      const data = await analiseService.value.getPontosFortes(municipio, ano);
      pontosFortes.value = data;
    } catch (err) {
      error.value.pontosFortes = err instanceof Error ? err.message : 'Failed to load strong points';
      console.error('Error loading strong points:', err);
    } finally {
      loading.value.pontosFortes = false;
    }
  };

  const loadPontosMelhoria = async (municipio: string, ano: number) => {
    if (!isReady.value || !analiseService.value) {
      console.warn('Analise service not ready');
      return;
    }

    loading.value.pontosMelhoria = true;
    error.value.pontosMelhoria = null;

    try {
      const data = await analiseService.value.getPontosMelhoria(municipio, ano);
      pontosMelhoria.value = data;
    } catch (err) {
      error.value.pontosMelhoria = err instanceof Error ? err.message : 'Failed to load improvement points';
      console.error('Error loading improvement points:', err);
    } finally {
      loading.value.pontosMelhoria = false;
    }
  };

  const loadRespostasDetalhadas = async (query: RespostasQuery) => {
    if (!isReady.value || !analiseService.value) {
      console.warn('Analise service not ready');
      return;
    }

    loading.value.respostas = true;
    error.value.respostas = null;

    try {
      const data = await analiseService.value.getRespostasDetalhadas(query);
      respostasDetalhadas.value = data;
    } catch (err) {
      error.value.respostas = err instanceof Error ? err.message : 'Failed to load detailed responses';
      console.error('Error loading detailed responses:', err);
    } finally {
      loading.value.respostas = false;
    }
  };

  const loadAnaliseMelhorias = async (municipio: string, ano: number) => {
    if (!isReady.value || !analiseService.value) {
      console.warn('Analise service not ready');
      return;
    }

    loading.value.analiseMelhorias = true;
    error.value.analiseMelhorias = null;

    try {
      const data = await analiseService.value.getAnaliseMelhorias(municipio, ano);
      analiseMelhorias.value = data;
    } catch (err) {
      error.value.analiseMelhorias = err instanceof Error ? err.message : 'Failed to load improvement analysis';
      console.error('Error loading improvement analysis:', err);
    } finally {
      loading.value.analiseMelhorias = false;
    }
  };

  const loadComparativoAnoAnterior = async (municipio: string, anoAtual: number) => {
    if (!isReady.value || !analiseService.value) {
      console.warn('Analise service not ready');
      return;
    }

    loading.value.comparativo = true;
    error.value.comparativo = null;

    try {
      const data = await analiseService.value.getComparativoAnoAnterior(municipio, anoAtual);
      comparativoAnoAnterior.value = data;
    } catch (err) {
      error.value.comparativo = err instanceof Error ? err.message : 'Failed to load year comparison';
      console.error('Error loading year comparison:', err);
    } finally {
      loading.value.comparativo = false;
    }
  };

  // ============================================================================
  // MÉTODOS DE ANÁLISE
  // ============================================================================

  const analisarMunicipio = async (municipio: string, ano: number) => {
    await Promise.all([
      loadDimensaoAnalise(municipio, ano),
      loadPontosFortes(municipio, ano),
      loadPontosMelhoria(municipio, ano),
      loadAnaliseMelhorias(municipio, ano),
      loadComparativoAnoAnterior(municipio, ano)
    ]);
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

  const melhorDimensao = computed(() => {
    if (dimensoesAnalise.value.length === 0) return null;
    return dimensoesAnalise.value.reduce((best, current) =>
      current.score > best.score ? current : best
    );
  });

  const piorDimensao = computed(() => {
    if (dimensoesAnalise.value.length === 0) return null;
    return dimensoesAnalise.value.reduce((worst, current) =>
      current.score < worst.score ? current : worst
    );
  });

  const dimensoesAcimaMedia = computed(() => {
    return dimensoesAnalise.value.filter(dim => dim.diferencial > 0);
  });

  const dimensoesAbaixoMedia = computed(() => {
    return dimensoesAnalise.value.filter(dim => dim.diferencial < 0);
  });

  const totalImpactoMelhorias = computed(() => {
    return analiseMelhorias.value.reduce((total, analise) => total + analise.impacto, 0);
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
    dimensoesAnalise.value = [];
    pontosFortes.value = [];
    pontosMelhoria.value = [];
    respostasDetalhadas.value = [];
    analiseMelhorias.value = [];
    comparativoAnoAnterior.value = null;
    clearAllErrors();
  };

  return {
    // Estado
    dimensoesAnalise: computed(() => dimensoesAnalise.value),
    pontosFortes: computed(() => pontosFortes.value),
    pontosMelhoria: computed(() => pontosMelhoria.value),
    respostasDetalhadas: computed(() => respostasDetalhadas.value),
    analiseMelhorias: computed(() => analiseMelhorias.value),
    comparativoAnoAnterior: computed(() => comparativoAnoAnterior.value),

    // Loading
    loading: computed(() => loading.value),
    isLoading,

    // Erro
    error: computed(() => error.value),
    hasError,

    // Computed
    melhorDimensao,
    piorDimensao,
    dimensoesAcimaMedia,
    dimensoesAbaixoMedia,
    totalImpactoMelhorias,

    // Métodos
    loadDimensaoAnalise,
    loadPontosFortes,
    loadPontosMelhoria,
    loadRespostasDetalhadas,
    loadAnaliseMelhorias,
    loadComparativoAnoAnterior,
    analisarMunicipio,
    clearError,
    clearAllErrors,
    reset
  };
}
