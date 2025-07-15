import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDatabase } from '../hooks/useDatabase';
import { useMunicipios } from '../hooks/useMunicipios';
import { useAnalise } from '../hooks/useAnalise';
import type { IEGMFilters } from '../services/iegm';
import { DEFAULT_MUNICIPIO_CONFIG } from '@/config/municipioConfig';

export interface Municipio {
  id: number;
  tribunalId: number;
  tribunal: string;
  municipioId: number;
  codigoIbge: string;
  municipio: string;
  anoRef: number;
  percentualIamb: number | null;
  percentualIcidade: number | null;
  percentualIeduc: number | null;
  percentualIfiscal: number | null;
  percentualIgovTi: number | null;
  percentualIsaude: number | null;
  percentualIplan: number | null;
  percentualIegmMunicipio: number | null;
  faixaIamb: string | null;
  faixaIcidade: string | null;
  faixaIeduc: string | null;
  faixaIfiscal: string | null;
  faixaIgovTi: string | null;
  faixaIsaude: string | null;
  faixaIplan: string | null;
  faixaIegmMunicipio: string | null;
}

export interface EstatisticasGerais {
  totalMunicipios: number;
  mediaIegm: number;
  minIegm: number;
  maxIegm: number;
  mediaIamb: number;
  mediaIcidade: number;
  mediaIeduc: number;
  mediaIfiscal: number;
  mediaIgovTi: number;
  mediaIsaude: number;
  mediaIplan: number;
}

export interface RankingItem {
  codigoIbge: string;
  municipio: string;
  percentualIegmMunicipio: number | null;
  indIegmMunicipio: string | null;
  ranking: number;
}

export interface FaixaDistribuicao {
  faixa: string | null;
  quantidade: number;
}

export interface RespostaDetalhada {
  id: number;
  tribunal: string;
  codigoIbge: string;
  municipio: string;
  indicador: string;
  questao: string;
  resposta: string | null;
  pontuacao: number | null;
  peso: number | null;
  nota: number | null;
  anoRef: number;
}

export interface AnaliseMelhoria {
  indicador: string;
  questao: string;
  respostaAtual: string;
  pontuacaoAtual: number;
  pontuacaoMaxima: number;
  impacto: number;
  recomendacao: string;
}

export const useIEGMStore = defineStore('iegm', () => {
  // ============================================================================
  // HOOKS E SERVIÇOS
  // ============================================================================

  const { initialize: initializeDB, isMockData } = useDatabase();
  const municipiosHook = useMunicipios();
  const analiseHook = useAnalise();

  // ============================================================================
  // ESTADO REATIVO
  // ============================================================================

  const filters = ref<IEGMFilters>({
    ano: DEFAULT_MUNICIPIO_CONFIG.ano,
    tribunal: DEFAULT_MUNICIPIO_CONFIG.tribunal,
    municipio: DEFAULT_MUNICIPIO_CONFIG.municipio
  });

  const isInitialized = ref(false);
  const municipioSelecionado = ref<Municipio | null>(null);
  const estatisticasGerais = ref<EstatisticasGerais | null>(null);
  const ranking = ref<RankingItem[]>([]);
  const faixasDistribuicao = ref<FaixaDistribuicao[]>([]);
  const respostasDetalhadas = ref<RespostaDetalhada[]>([]);
  const analiseMelhorias = ref<AnaliseMelhoria[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Indicadores disponíveis
  const indicadoresDisponiveis = ref<string[]>([
    'i-Educ',
    'i-Saude',
    'i-Fiscal',
    'i-Amb',
    'i-Cidade',
    'i-Plan',
    'i-Gov TI'
  ]);

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  // Dados dos municípios
  const municipios = computed(() => municipiosHook.municipios.value);
  const municipioAtual = computed(() => municipiosHook.municipioAtual.value);
  const rankingData = computed(() => municipiosHook.ranking.value);
  const estatisticas = computed(() => municipiosHook.estatisticas.value);
  const faixasDistribuicaoData = computed(() => municipiosHook.faixasDistribuicao.value);

  // Dados de análise
  const dimensoesAnalise = computed(() => analiseHook.dimensoesAnalise.value);
  const pontosFortes = computed(() => analiseHook.pontosFortes.value);
  const pontosMelhoria = computed(() => analiseHook.pontosMelhoria.value);
  const respostasDetalhadasData = computed(() => analiseHook.respostasDetalhadas.value);
  const analiseMelhoriasData = computed(() => analiseHook.analiseMelhorias.value);
  const comparativoAnoAnterior = computed(() => analiseHook.comparativoAnoAnterior.value);

  // Loading e erro
  const loadingState = computed(() => ({
    ...municipiosHook.loading.value,
    ...analiseHook.loading.value
  }));

  const errorState = computed(() => ({
    ...municipiosHook.error.value,
    ...analiseHook.error.value
  }));

  const isLoading = computed(() => municipiosHook.isLoading.value || analiseHook.isLoading.value);
  const hasError = computed(() => municipiosHook.hasError.value || analiseHook.hasError.value);

  // Computed específicos
  const topMunicipios = computed(() => municipiosHook.topMunicipios.value);
  const municipioRanking = computed(() => municipiosHook.municipioRanking.value);
  const melhorDimensao = computed(() => analiseHook.melhorDimensao.value);
  const piorDimensao = computed(() => analiseHook.piorDimensao.value);
  const dimensoesAcimaMedia = computed(() => analiseHook.dimensoesAcimaMedia.value);
  const dimensoesAbaixoMedia = computed(() => analiseHook.dimensoesAbaixoMedia.value);
  const totalImpactoMelhorias = computed(() => analiseHook.totalImpactoMelhorias.value);

  // Computed properties para compatibilidade
  const municipiosData = computed(() => municipios.value);
  const filteredData = computed(() => municipios.value);

  const anosDisponiveis = computed(() => {
    const years = [...new Set(municipios.value.map(m => m.anoRef))];
    return years.sort((a, b) => b - a);
  });

  const stateAverage = computed(() => {
    if (municipios.value.length === 0) return 0;
    const validScores = municipios.value
      .filter(m => m.percentualIegmMunicipio !== null && m.anoRef === filters.value.ano)
      .map(m => m.percentualIegmMunicipio!);

    if (validScores.length === 0) return 0;
    return validScores.reduce((a, b) => a + b, 0) / validScores.length;
  });

  const currentYearData = computed(() => {
    return municipios.value.filter(m => m.anoRef === filters.value.ano);
  });

  const rankingMunicipio = computed(() => {
    if (!municipioAtual.value) return null;

    // Calcular ranking real baseado no score IEGM do ano atual
    const municipiosComScore = municipios.value
      .filter(m => m.percentualIegmMunicipio !== null && m.anoRef === filters.value.ano)
      .sort((a, b) => (b.percentualIegmMunicipio || 0) - (a.percentualIegmMunicipio || 0));

    const posicao = municipiosComScore.findIndex(m => m.municipio === municipioAtual.value?.municipio) + 1;

    return {
      municipio: municipioAtual.value.municipio,
      ranking: posicao,
      totalMunicipios: municipiosComScore.length
    };
  });

  const percentilMunicipio = computed(() => {
    if (!rankingMunicipio.value) return 0;
    const posicao = rankingMunicipio.value.ranking;
    const total = rankingMunicipio.value.totalMunicipios;
    return Math.round(((total - posicao + 1) / total) * 100);
  });

  const municipiosFiltrados = computed(() => municipios.value);

  const municipioSelecionadoDadosHistoricos = computed(() => {
    if (!filters.value.municipio) return [];
    const dadosHistoricos = municipios.value.filter(m => m.municipio === filters.value.municipio).sort((a, b) => a.anoRef - b.anoRef);

    // Calcular ranking para cada ano histórico
    return dadosHistoricos.map(dado => {
      const municipiosDoAno = municipios.value
        .filter(m => m.anoRef === dado.anoRef && m.percentualIegmMunicipio !== null)
        .sort((a, b) => (b.percentualIegmMunicipio || 0) - (a.percentualIegmMunicipio || 0));

      const ranking = municipiosDoAno.findIndex(m => m.municipio === dado.municipio) + 1;

      return {
        ...dado,
        ranking: ranking > 0 ? ranking : null,
        totalMunicipios: municipiosDoAno.length
      };
    });
  });

  const estatisticasGeraisAnoAtual = computed(() => {
    if (!estatisticas.value) return null;
    return estatisticas.value;
  });

  // ============================================================================
  // MÉTODOS DE INICIALIZAÇÃO
  // ============================================================================

  const initialize = async (d1Database?: D1Database) => {
    try {
      // Initialize database service (will fallback to API if no D1Database provided)
      initializeDB(d1Database);
      isInitialized.value = true;

      // Wait a bit for services to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Carregar dados iniciais
      await loadAllData();
    } catch (error) {
      console.error('Error initializing IEGM store:', error);
    }
  };

  const loadAllData = async () => {
    if (!filters.value.ano || !filters.value.tribunal) return;

    await Promise.all([
      // Carregar dados básicos
      municipiosHook.loadMunicipios({
        ano: filters.value.ano,
        tribunal: filters.value.tribunal
      }),
      municipiosHook.loadRanking({
        ano: filters.value.ano,
        tribunal: filters.value.tribunal
      }),
      municipiosHook.loadEstatisticas({
        ano: filters.value.ano,
        tribunal: filters.value.tribunal
      }),
      municipiosHook.loadFaixasDistribuicao(filters.value.ano)
    ]);

    // Se há município selecionado, carregar análise
    if (filters.value.municipio) {
      await loadAnaliseMunicipio();
    }
  };

  const loadAnaliseMunicipio = async () => {
    if (!filters.value.municipio || !filters.value.ano) return;

    // Primeiro carregar o município atual
    await municipiosHook.loadMunicipioByNome(filters.value.municipio, filters.value.ano);

    // Depois carregar análises
    await analiseHook.analisarMunicipio(filters.value.municipio, filters.value.ano);
  };

  // ============================================================================
  // MÉTODOS DE FILTROS E SELEÇÃO
  // ============================================================================

  const updateFilters = async (newFilters: Partial<IEGMFilters>) => {
    const oldMunicipio = filters.value.municipio;
    const oldAno = filters.value.ano;

    filters.value = { ...filters.value, ...newFilters };

    // Se mudou o ano ou tribunal, recarregar todos os dados
    if (newFilters.ano !== oldAno || newFilters.tribunal !== filters.value.tribunal) {
      await loadAllData();
    }

    // Se mudou o município, carregar análise específica
    if (newFilters.municipio !== oldMunicipio && newFilters.municipio) {
      await loadAnaliseMunicipio();
    }
  };

  const selecionarMunicipio = async (municipio: string) => {
    await updateFilters({ municipio });
  };

  const aplicarFiltros = async (novosFiltros: IEGMFilters) => {
    await updateFilters(novosFiltros);
  };

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  const getDimensionScore = (municipio: any, dimension: string): number => {
    if (!municipio) return 0;

    const dimensionMap: Record<string, keyof typeof municipio> = {
      'pctIeduc': 'percentualIeduc',
      'pctIsaude': 'percentualIsaude',
      'pctIfiscal': 'percentualIfiscal',
      'pctIamb': 'percentualIamb',
      'pctIcidade': 'percentualIcidade',
      'pctIplan': 'percentualIplan',
      'pctIgovTi': 'percentualIgovTi',
      // Também aceitar os novos nomes
      'percentualIeduc': 'percentualIeduc',
      'percentualIsaude': 'percentualIsaude',
      'percentualIfiscal': 'percentualIfiscal',
      'percentualIamb': 'percentualIamb',
      'percentualIcidade': 'percentualIcidade',
      'percentualIplan': 'percentualIplan',
      'percentualIgovTi': 'percentualIgovTi'
    };

    const key = dimensionMap[dimension];
    return key ? (municipio[key] || 0) : 0;
  };

  const getDimensionGrade = (municipio: any, dimension: string): string => {
    const score = getDimensionScore(municipio, dimension);

    if (score >= 0.8) return 'A';
    if (score >= 0.6) return 'B+';
    if (score >= 0.4) return 'B';
    if (score >= 0.2) return 'C+';
    return 'C';
  };

  const getRecommendations = (municipio: any): string[] => {
    if (!municipio) return [];

    const recommendations: string[] = [];
    const scores = [
      { dimension: 'Educação', score: municipio.percentualIeduc || 0 },
      { dimension: 'Saúde', score: municipio.percentualIsaude || 0 },
      { dimension: 'Gestão Fiscal', score: municipio.percentualIfiscal || 0 },
      { dimension: 'Meio Ambiente', score: municipio.percentualIamb || 0 },
      { dimension: 'Cidades', score: municipio.percentualIcidade || 0 },
      { dimension: 'Planejamento', score: municipio.percentualIplan || 0 },
      { dimension: 'Governança TI', score: municipio.percentualIgovTi || 0 }
    ];

    scores.forEach(({ dimension, score }) => {
      if (score < 0.6) {
        recommendations.push(`Melhorar ${dimension} (score atual: ${(score * 100).toFixed(1)}%)`);
      }
    });

    return recommendations;
  };

  const getMunicipalityAnswers = (municipio: string) => {
    return respostasDetalhadasData.value.filter(resposta =>
      resposta.municipio === municipio
    );
  };

    const getIndicatorAnalysis = (municipio: string, indicador: string) => {
    const respostas = respostasDetalhadasData.value.filter(resposta =>
      resposta.municipio === municipio && resposta.indicador === indicador
    );

    if (respostas.length === 0) {
      return null;
    }

    const totalQuestions = respostas.length;
    const answeredQuestions = respostas.filter(r => r.resposta && r.resposta.trim() !== '').length;
    const scores = respostas
      .filter(r => r.nota !== null)
      .map(r => r.nota!);

    const averageScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    const weakQuestions = respostas
      .filter(r => r.nota !== null && r.nota < 300)
      .map(r => r.questao);

    return {
      averageScore,
      totalQuestions,
      answeredQuestions,
      weakQuestions
    };
  };

  const gerarAnaliseMelhorias = () => {
    if (!municipioAtual.value || !estatisticas.value) {
      analiseMelhorias.value = [];
      return;
    }

    const municipio = municipioAtual.value;
    const stats = estatisticas.value;
    const melhorias: AnaliseMelhoria[] = [];

    // Análise por dimensão
    const dimensoes = [
      { nome: 'Educação', valor: municipio.percentualIeduc, media: stats.mediaIeduc, indicador: 'i-Educ' },
      { nome: 'Saúde', valor: municipio.percentualIsaude, media: stats.mediaIsaude, indicador: 'i-Saude' },
      { nome: 'Gestão Fiscal', valor: municipio.percentualIfiscal, media: stats.mediaIfiscal, indicador: 'i-Fiscal' },
      { nome: 'Meio Ambiente', valor: municipio.percentualIamb, media: stats.mediaIamb, indicador: 'i-Amb' },
      { nome: 'Cidades', valor: municipio.percentualIcidade, media: stats.mediaIcidade, indicador: 'i-Cidade' },
      { nome: 'Planejamento', valor: municipio.percentualIplan, media: stats.mediaIplan, indicador: 'i-Plan' },
      { nome: 'Governança TI', valor: municipio.percentualIgovTi, media: stats.mediaIgovTi, indicador: 'i-Gov TI' }
    ];

    dimensoes.forEach(dimensao => {
      if (dimensao.valor !== null && dimensao.valor < 0.6) {
        const impacto = (0.6 - dimensao.valor) * 100;
        melhorias.push({
          indicador: dimensao.indicador,
          questao: `${dimensao.nome} - Melhoria Geral`,
          respostaAtual: `${(dimensao.valor * 100).toFixed(1)}%`,
          pontuacaoAtual: dimensao.valor * 100,
          pontuacaoMaxima: 100,
          impacto: Math.round(impacto),
          recomendacao: `Implementar políticas específicas para melhorar pontuação em ${dimensao.nome}. Foco em transparência, gestão eficiente e resultados mensuráveis.`
        });
      }
    });

    analiseMelhorias.value = melhorias;
  };

  const reset = () => {
    municipiosHook.reset();
    analiseHook.reset();
    filters.value = {
      ano: DEFAULT_MUNICIPIO_CONFIG.ano,
      tribunal: DEFAULT_MUNICIPIO_CONFIG.tribunal,
      municipio: DEFAULT_MUNICIPIO_CONFIG.municipio
    };
    municipioSelecionado.value = null;
    estatisticasGerais.value = null;
    ranking.value = [];
    faixasDistribuicao.value = [];
    respostasDetalhadas.value = [];
    analiseMelhorias.value = [];
    loading.value = false;
    error.value = null;
  };

  // ============================================================================
  // EXPORTAÇÕES
  // ============================================================================

  return {
    // Estado
    filters: computed(() => filters.value),
    isInitialized: computed(() => isInitialized.value),
    isMockData,
    municipioSelecionado,
    estatisticasGerais,
    ranking,
    faixasDistribuicao,
    respostasDetalhadas,
    analiseMelhorias,
    loading,
    error,
    indicadoresDisponiveis,

    // Dados dos municípios
    municipios,
    municipioAtual,
    rankingData,
    estatisticas,
    faixasDistribuicaoData,

    // Dados de análise
    dimensoesAnalise,
    pontosFortes,
    pontosMelhoria,
    respostasDetalhadasData,
    analiseMelhoriasData,
    comparativoAnoAnterior,

    // Computed específicos
    topMunicipios,
    municipioRanking,
    melhorDimensao,
    piorDimensao,
    dimensoesAcimaMedia,
    dimensoesAbaixoMedia,
    totalImpactoMelhorias,

    // Computed para compatibilidade
    municipiosData,
    filteredData,
    anosDisponiveis,
    stateAverage,
    currentYearData,
    rankingMunicipio,
    percentilMunicipio,
    municipiosFiltrados,
    municipioSelecionadoDadosHistoricos,
    estatisticasGeraisAnoAtual,

    // Loading e erro
    loadingState,
    errorState,
    isLoading,
    hasError,

    // Métodos
    initialize,
    updateFilters,
    selecionarMunicipio,
    aplicarFiltros,
    loadAllData,
    loadAnaliseMunicipio,
    getDimensionScore,
    getDimensionGrade,
    getRecommendations,
    getMunicipalityAnswers,
    getIndicatorAnalysis,
    gerarAnaliseMelhorias,
    reset
  };
});
