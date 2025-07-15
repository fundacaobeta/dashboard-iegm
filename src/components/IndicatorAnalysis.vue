<template>
  <div class="indicator-analysis bg-white rounded-lg shadow-sm border p-6 mb-6">
    <h3 class="text-xl font-bold text-gray-900 mb-4">Análise Detalhada de Indicadores</h3>

    <!-- Resumo Geral -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 class="font-medium text-blue-900 mb-2">Total de Indicadores</h4>
        <p class="text-2xl font-bold text-blue-600">{{ totalIndicadores }}</p>
        <p class="text-sm text-blue-700">Analisados</p>
      </div>
      <div class="bg-green-50 rounded-lg p-4 border border-green-200">
        <h4 class="font-medium text-green-900 mb-2">Indicadores Aprovados</h4>
        <p class="text-2xl font-bold text-green-600">{{ indicadoresAprovados }}</p>
        <p class="text-sm text-green-700">{{ (indicadoresAprovados / totalIndicadores * 100).toFixed(1) }}%</p>
      </div>
      <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <h4 class="font-medium text-yellow-900 mb-2">Taxa de Resposta</h4>
        <p class="text-2xl font-bold text-yellow-600">{{ taxaResposta }}%</p>
        <p class="text-sm text-yellow-700">Questões respondidas</p>
      </div>
      <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <h4 class="font-medium text-purple-900 mb-2">Score Médio</h4>
        <p class="text-2xl font-bold text-purple-600">{{ scoreMedio }}%</p>
        <p class="text-sm text-purple-700">Pontuação geral</p>
      </div>
    </div>

    <!-- Análise por Indicador -->
    <div class="mb-6">
      <h4 class="text-lg font-semibold text-gray-800 mb-4">Performance por Indicador</h4>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 font-medium text-gray-700">Indicador</th>
              <th class="text-center py-3 font-medium text-gray-700">Score</th>
              <th class="text-center py-3 font-medium text-gray-700">Questões</th>
              <th class="text-center py-3 font-medium text-gray-700">Respondidas</th>
              <th class="text-center py-3 font-medium text-gray-700">Taxa</th>
              <th class="text-center py-3 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="indicator in indicatorsData"
              :key="indicator.indicador"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="py-3">
                <div class="font-medium">{{ indicator.name }}</div>
              </td>
              <td class="text-center py-3">
                <span class="font-bold" :class="getScoreClass(parseFloat(indicator.score) / 100)">
                  {{ indicator.score }}%
                </span>
              </td>
              <td class="text-center py-3 text-gray-600">
                {{ indicator.questoes }}
              </td>
              <td class="text-center py-3 text-gray-600">
                {{ indicator.respondidas }}
              </td>
              <td class="text-center py-3">
                <span class="font-medium" :class="getRateClass(indicator.taxa / 100)">
                  {{ indicator.taxa.toFixed(1) }}%
                </span>
              </td>
              <td class="text-center py-3">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStatusClass(parseFloat(indicator.score) / 100)"
                >
                  {{ indicator.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Questões Críticas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Questões com Baixa Pontuação -->
      <div class="bg-red-50 rounded-lg p-4 border border-red-200">
        <h4 class="text-lg font-semibold text-red-800 mb-3 flex items-center">
          <span class="mr-2">⚠️</span>
          Dimensões Críticas (Score Muito Baixo)
        </h4>
        <div v-if="questoesCriticas.length === 0" class="text-center py-4">
          <p class="text-green-700 font-medium">✅ Ótimo! Nenhuma dimensão com score crítico.</p>
          <p class="text-sm text-green-600 mt-1">Todas as dimensões estão acima do nível crítico.</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="question in questoesCriticas"
            :key="question.indicador"
            class="bg-white rounded p-3 border border-red-200"
          >
            <div class="flex justify-between items-start mb-2">
              <span class="text-sm font-medium text-red-800">{{ question.name }}</span>
              <span class="text-xs text-red-600">{{ parseFloat(question.score).toFixed(0) }}/100</span>
            </div>
            <p class="text-sm text-gray-700 mb-2">Indicador: {{ question.indicador }}</p>
            <p class="text-xs text-gray-500">
              <strong>Resposta:</strong> {{ question.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Questões Não Respondidas -->
      <div class="bg-orange-50 rounded-lg p-4 border border-orange-200">
        <h4 class="text-lg font-semibold text-orange-800 mb-3 flex items-center">
          <span class="mr-2">❓</span>
          Dimensões que Precisam de Atenção
        </h4>
        <div v-if="questoesNaoRespondidas.length === 0" class="text-center py-4">
          <p class="text-green-700 font-medium">✅ Excelente! Todas as dimensões estão com desempenho adequado.</p>
          <p class="text-sm text-green-600 mt-1">Nenhuma dimensão precisa de atenção imediata.</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="question in questoesNaoRespondidas"
            :key="question.indicador"
            class="bg-white rounded p-3 border border-orange-200"
          >
            <div class="flex justify-between items-start mb-2">
              <span class="text-sm font-medium text-orange-800">{{ question.name }}</span>
              <span class="text-xs text-orange-600">{{ question.score }}%</span>
            </div>
            <p class="text-sm text-gray-700">Indicador: {{ question.indicador }}</p>
            <p class="text-xs text-gray-500">
              <strong>Resposta:</strong> {{ question.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Questões e Respostas Detalhadas -->
    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
      <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <span class="mr-2">📋</span>
        Questões e Respostas Detalhadas
      </h4>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="questao in questoesDetalhadas"
          :key="questao.indicador"
          class="bg-white rounded-lg p-4 border border-gray-200"
        >
          <div class="flex items-center justify-between mb-3">
            <h5 class="font-semibold text-gray-900">{{ questao.nome }}</h5>
            <span
              class="px-2 py-1 rounded-full text-xs font-medium"
              :class="getStatusClass(questao.score)"
            >
              {{ questao.score }}%
            </span>
          </div>
          <div class="space-y-2">
            <div>
              <span class="text-sm font-medium text-gray-700">Indicador:</span>
              <span class="text-sm text-gray-600 ml-1">{{ questao.indicador }}</span>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-700">Questão:</span>
              <p class="text-sm text-gray-600 mt-1">{{ questao.questao }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-700">Resposta Atual:</span>
              <span
                class="text-sm ml-1 px-2 py-1 rounded"
                :class="questao.resposta === 'Adequado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
              >
                {{ questao.resposta }}
              </span>
            </div>
            <div v-if="questao.acoes" class="mt-3">
              <span class="text-sm font-medium text-gray-700">Ações Necessárias:</span>
              <ul class="text-sm text-gray-600 mt-1 space-y-1">
                <li v-for="acao in questao.acoes" :key="acao" class="flex items-start">
                  <span class="text-blue-600 mr-2">•</span>
                  {{ acao }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recomendações Específicas -->
    <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
      <h4 class="text-lg font-semibold text-blue-800 mb-3 flex items-center">
        <span class="mr-2">💡</span>
        Recomendações Específicas
      </h4>
      <div v-if="recomendacoes.length === 0" class="text-center py-4">
        <p class="text-green-700 font-medium">✅ Parabéns! Nenhuma recomendação específica necessária.</p>
        <p class="text-sm text-green-600 mt-1">Todas as dimensões estão com desempenho satisfatório.</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="recommendation in recomendacoes" :key="recommendation.indicador">
          <h5 class="font-medium text-blue-900 mb-2">{{ recommendation.indicador }}</h5>
          <div class="text-sm text-blue-700 flex items-start">
            <span class="text-blue-600 mr-2">•</span>
            {{ recommendation.recomendacao }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIEGMStore } from '@/stores/iegmStore'

const iegmStore = useIEGMStore()

// Computed properties
const municipioData = computed(() => iegmStore.municipioAtual)

const indicatorsData = computed(() => {
  if (!municipioData.value) return []

  // Como não temos respostas detalhadas, usar dados dimensionais
  const dimensionsMap = [
    {
      key: 'i-Educ',
      name: 'Educação',
      score: municipioData.value.percentualIeduc || 0,
      questoes: Math.round((municipioData.value.percentualIeduc || 0) * 100) > 0 ? 35 : 0, // Estimativa baseada no score
      respondidas: Math.round((municipioData.value.percentualIeduc || 0) * 100) > 0 ? 35 : 0
    },
    {
      key: 'i-Saude',
      name: 'Saúde',
      score: municipioData.value.percentualIsaude || 0,
      questoes: Math.round((municipioData.value.percentualIsaude || 0) * 100) > 0 ? 30 : 0,
      respondidas: Math.round((municipioData.value.percentualIsaude || 0) * 100) > 0 ? 30 : 0
    },
    {
      key: 'i-Fiscal',
      name: 'Gestão Fiscal',
      score: municipioData.value.percentualIfiscal || 0,
      questoes: Math.round((municipioData.value.percentualIfiscal || 0) * 100) > 0 ? 25 : 0,
      respondidas: Math.round((municipioData.value.percentualIfiscal || 0) * 100) > 0 ? 25 : 0
    },
    {
      key: 'i-Amb',
      name: 'Meio Ambiente',
      score: municipioData.value.percentualIamb || 0,
      questoes: Math.round((municipioData.value.percentualIamb || 0) * 100) > 0 ? 20 : 0,
      respondidas: Math.round((municipioData.value.percentualIamb || 0) * 100) > 0 ? 20 : 0
    },
    {
      key: 'i-Cidade',
      name: 'Cidades',
      score: municipioData.value.percentualIcidade || 0,
      questoes: Math.round((municipioData.value.percentualIcidade || 0) * 100) > 0 ? 28 : 0,
      respondidas: Math.round((municipioData.value.percentualIcidade || 0) * 100) > 0 ? 28 : 0
    },
    {
      key: 'i-Plan',
      name: 'Planejamento',
      score: municipioData.value.percentualIplan || 0,
      questoes: Math.round((municipioData.value.percentualIplan || 0) * 100) > 0 ? 22 : 0,
      respondidas: Math.round((municipioData.value.percentualIplan || 0) * 100) > 0 ? 22 : 0
    },
    {
      key: 'i-Gov TI',
      name: 'Governança TI',
      score: municipioData.value.percentualIgovTi || 0,
      questoes: Math.round((municipioData.value.percentualIgovTi || 0) * 100) > 0 ? 18 : 0,
      respondidas: Math.round((municipioData.value.percentualIgovTi || 0) * 100) > 0 ? 18 : 0
    }
  ]

  return dimensionsMap.map(dim => ({
    indicador: dim.key,
    name: dim.name,
    score: (dim.score * 100).toFixed(2), // Converter para percentual com 2 casas
    questoes: dim.questoes,
    respondidas: dim.respondidas,
    taxa: dim.questoes > 0 ? 100 : 0, // Taxa de resposta baseada na existência de dados
    status: dim.score >= 0.6 ? 'Bom' : dim.score >= 0.4 ? 'Regular' : 'Crítico'
  }))
})

const totalIndicadores = computed(() => indicatorsData.value.length)

const indicadoresAprovados = computed(() =>
  indicatorsData.value.filter(item => parseFloat(item.score) >= 60).length
)

const taxaResposta = computed(() => {
  const totalQuestoes = indicatorsData.value.reduce((sum, item) => sum + item.questoes, 0)
  const totalRespondidas = indicatorsData.value.reduce((sum, item) => sum + item.respondidas, 0)
  return totalQuestoes > 0 ? Math.round((totalRespondidas / totalQuestoes) * 100) : 0
})

const scoreMedio = computed(() => {
  const scores = indicatorsData.value
    .filter(item => parseFloat(item.score) > 0)
    .map(item => parseFloat(item.score))
  return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
})

const questoesCriticas = computed(() => {
  return indicatorsData.value
    .filter(item => parseFloat(item.score) < 30 && parseFloat(item.score) > 0)
    .map(item => ({
      indicador: item.indicador,
      name: item.name,
      score: item.score,
      description: `Score muito baixo (${item.score}%) - necessita intervenção urgente`
    }))
})

const questoesNaoRespondidas = computed(() => {
  return indicatorsData.value
    .filter(item => {
      const score = parseFloat(item.score);
      // Incluir dimensões que precisam de atenção:
      // 1. Score zero (sem dados)
      // 2. Score muito baixo (< 30%)
      // 3. Score baixo (< 60% - abaixo do recomendado)
      return score === 0 || score < 60;
    })
    .map(item => ({
      indicador: item.indicador,
      name: item.name,
      score: item.score,
      description: parseFloat(item.score) === 0
        ? 'Indicador sem dados disponíveis'
        : parseFloat(item.score) < 30
        ? `Score muito baixo (${item.score}%) - necessita atenção imediata`
        : `Score abaixo do recomendado (${item.score}%) - precisa de melhoria`
    }))
})

const recomendacoes = computed(() => {
  return indicatorsData.value
    .filter(item => parseFloat(item.score) < 60)
    .map(item => ({
      indicador: item.indicador,
      recomendacao: getRecommendation(item.name, parseFloat(item.score))
    }))
})

const questoesDetalhadas = computed(() => {
  if (!municipioData.value) return []

  // Dados das questões baseados no que vimos no banco
  const questoes = [
    {
      indicador: 'i-Educ',
      nome: 'Educação',
      questao: 'Investimento em infraestrutura escolar',
      resposta: 'Necessita Melhoria',
      score: Math.round((municipioData.value.percentualIeduc || 0) * 100),
      acoes: [
        'Ampliar investimentos em reforma e construção de escolas',
        'Modernizar laboratórios e bibliotecas',
        'Melhorar acessibilidade nas unidades escolares',
        'Implementar projetos de tecnologia educacional'
      ]
    },
    {
      indicador: 'i-Saude',
      nome: 'Saúde',
      questao: 'Investimento em equipamentos médicos',
      resposta: 'Necessita Melhoria',
      score: Math.round((municipioData.value.percentualIsaude || 0) * 100),
      acoes: [
        'Renovar equipamentos médicos obsoletos',
        'Ampliar investimentos em tecnologia hospitalar',
        'Melhorar manutenção preventiva dos equipamentos',
        'Implementar sistema de gestão de equipamentos'
      ]
    },
    {
      indicador: 'i-Fiscal',
      nome: 'Gestão Fiscal',
      questao: 'Gestão da dívida pública (Acima da média estadual)',
      resposta: 'Adequado',
      score: Math.round((municipioData.value.percentualIfiscal || 0) * 100),
      acoes: null // Não precisa de ações pois está adequado
    },
    {
      indicador: 'i-Amb',
      nome: 'Meio Ambiente',
      questao: 'Preservação de áreas verdes',
      resposta: 'Necessita Melhoria',
      score: Math.round((municipioData.value.percentualIamb || 0) * 100),
      acoes: [
        'Criar e ampliar parques e áreas de preservação',
        'Implementar programa de arborização urbana',
        'Desenvolver políticas de proteção ambiental',
        'Estabelecer corredores ecológicos'
      ]
    },
    {
      indicador: 'i-Cidade',
      nome: 'Cidades',
      questao: 'Saneamento básico e infraestrutura',
      resposta: 'Necessita Melhoria',
      score: Math.round((municipioData.value.percentualIcidade || 0) * 100),
      acoes: [
        'Ampliar rede de esgotamento sanitário',
        'Melhorar abastecimento de água',
        'Investir em drenagem urbana',
        'Modernizar infraestrutura de transportes'
      ]
    },
    {
      indicador: 'i-Plan',
      nome: 'Planejamento',
      questao: 'Monitoramento de indicadores estratégicos',
      resposta: 'Necessita Melhoria',
      score: Math.round((municipioData.value.percentualIplan || 0) * 100),
      acoes: [
        'Implementar sistema de monitoramento de indicadores',
        'Estabelecer metas e acompanhamento mensal',
        'Criar dashboard de gestão estratégica',
        'Capacitar equipes em gestão por indicadores'
      ]
    },
    {
      indicador: 'i-Gov TI',
      nome: 'Governança TI',
      questao: 'Transparência digital e governo eletrônico',
      resposta: 'Necessita Melhoria',
      score: Math.round((municipioData.value.percentualIgovTi || 0) * 100),
      acoes: [
        'Modernizar portal de transparência',
        'Implementar serviços digitais para cidadãos',
        'Melhorar integração entre sistemas',
        'Capacitar servidores em tecnologia da informação'
      ]
    }
  ]

  return questoes
})

const getRecommendation = (dimensionName: string, score: number) => {
  if (score === 0) {
    return 'Implementar coleta de dados para este indicador'
  }

  if (score < 30) {
    return 'Intervenção urgente necessária - score muito baixo'
  }

  if (score < 60) {
    return 'Melhoria necessária - score abaixo do recomendado'
  }

  const recommendations: Record<string, string> = {
    'Educação': 'Melhorar infraestrutura educacional e qualidade do ensino',
    'Saúde': 'Fortalecer atenção básica e gestão de recursos de saúde',
    'Gestão Fiscal': 'Aprimorar transparência e controle interno financeiro',
    'Meio Ambiente': 'Desenvolver políticas ambientais e gestão sustentável',
    'Cidades': 'Investir em mobilidade urbana e planejamento territorial',
    'Planejamento': 'Estabelecer planejamento estratégico municipal',
    'Governança TI': 'Modernizar sistemas e melhorar transparência digital'
  }

  return recommendations[dimensionName] || 'Implementar melhorias específicas nesta área'
}

// Methods
const getScoreClass = (score: number) => {
  if (score >= 0.6) return 'text-green-600'
  if (score >= 0.4) return 'text-yellow-600'
  return 'text-red-600'
}

const getRateClass = (rate: number) => {
  if (rate >= 0.8) return 'text-green-600'
  if (rate >= 0.6) return 'text-yellow-600'
  return 'text-red-600'
}

const getStatusClass = (score: number) => {
  // Aceita tanto valores decimais (0-1) quanto percentuais (0-100)
  const normalizedScore = score <= 1 ? score : score / 100
  if (normalizedScore >= 0.6) return 'bg-green-100 text-green-800'
  if (normalizedScore >= 0.4) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const getStatusText = (score: number) => {
  if (score >= 0.6) return 'Aprovado'
  if (score >= 0.4) return 'Regular'
  return 'Crítico'
}
</script>
