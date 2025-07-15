<template>
  <div class="advanced-analysis bg-white rounded-lg shadow-sm border p-6 mb-6">
    <h3 class="text-xl font-bold text-gray-900 mb-4">Análise Avançada - Pontos de Melhoria</h3>

    <!-- Resumo Executivo -->
    <div class="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
      <h4 class="text-lg font-semibold text-blue-800 mb-2">📊 Resumo Executivo</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p class="text-sm text-blue-700">Total de Questões Analisadas</p>
          <p class="text-2xl font-bold text-blue-600">{{ totalQuestionsAnalyzed }}</p>
        </div>
        <div>
          <p class="text-sm text-blue-700">Questões Críticas</p>
          <p class="text-2xl font-bold text-red-600">{{ criticalQuestions }}</p>
        </div>
        <div>
          <p class="text-sm text-blue-700">Impacto Total</p>
          <p class="text-2xl font-bold text-orange-600">{{ totalImpact.toFixed(1) }}%</p>
        </div>
      </div>
    </div>

    <!-- Análise por Dimensão -->
    <div class="mb-6">
      <h4 class="text-lg font-semibold text-gray-800 mb-4">🎯 Análise por Dimensão</h4>
      <div class="space-y-4">
        <div
          v-for="dimension in dimensionsAnalysis"
          :key="dimension.key"
          class="border rounded-lg p-4 hover:bg-gray-50"
        >
          <div class="flex justify-between items-center mb-3">
            <h5 class="font-medium text-gray-900">{{ dimension.icon }} {{ dimension.name }}</h5>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">Score atual: {{ dimension.currentScore.toFixed(2) }}%</span>
              <span class="text-sm text-gray-600">Meta: {{ dimension.targetScore }}%</span>
              <span class="text-sm font-medium text-red-600">
                Melhoria necessária: {{ dimension.improvement.toFixed(2) }}%
              </span>
            </div>
          </div>

          <!-- Barra de progresso -->
          <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(dimension.currentScore, 100)}%` }"
            ></div>
          </div>

          <!-- Questões críticas da dimensão -->
          <div v-if="dimension.improvement > 0" class="mt-3">
            <p class="text-sm font-medium text-red-700 mb-2">⚠️ Questões Críticas:</p>
            <div class="space-y-2">
              <div
                class="bg-red-50 border border-red-200 rounded p-3"
              >
                <p class="text-sm text-red-800 font-medium">Melhorar infraestrutura de saúde e gestão de recursos</p>
                <p class="text-xs text-red-600 mt-1">
                  <strong>Resposta atual:</strong> Análise baseada em scores dimensionais
                </p>
                <p class="text-xs text-red-600">
                  <strong>Pontuação:</strong> {{ Math.round(dimension.currentScore) }}/1000
                  <span class="text-red-500">(Impacto: {{ dimension.improvement.toFixed(2) }}%)</span>
                </p>
                <div class="mt-2">
                  <p class="text-xs text-blue-700 font-medium">💡 Recomendação:</p>
                  <p class="text-xs text-blue-600">{{ getRecommendation(dimension.name) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Questões Mais Críticas -->
    <div class="mb-6">
      <h4 class="text-lg font-semibold text-gray-800 mb-4">🚨 Top 10 Questões Mais Críticas</h4>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 font-medium text-gray-700">Rank</th>
              <th class="text-left py-3 font-medium text-gray-700">Dimensão</th>
              <th class="text-left py-3 font-medium text-gray-700">Questão</th>
              <th class="text-center py-3 font-medium text-gray-700">Score</th>
              <th class="text-center py-3 font-medium text-gray-700">Impacto</th>
              <th class="text-left py-3 font-medium text-gray-700">Recomendação</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="question in topCriticalQuestions"
              :key="question.rank"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="py-3">
                <span class="font-bold text-red-600">#{{ question.rank }}</span>
              </td>
              <td class="py-3">
                <span class="font-medium">{{ question.dimension }}</span>
              </td>
              <td class="py-3">
                <p class="text-sm">{{ question.question }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  <strong>Resposta:</strong> {{ question.response }}
                </p>
              </td>
              <td class="text-center py-3">
                <span class="font-bold text-red-600">{{ question.score*10 }}/1000</span>
              </td>
              <td class="text-center py-3">
                <span class="font-medium text-orange-600">{{ question.impact }}%</span>
              </td>
              <td class="py-3">
                <p class="text-sm text-blue-700">{{ question.recommendation }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Plano de Ação -->
    <div class="bg-green-50 rounded-lg p-4 border border-green-200">
      <h4 class="text-lg font-semibold text-green-800 mb-3">📋 Plano de Ação Prioritário</h4>
      <div class="space-y-3">
        <div
          v-for="action in actionPlan"
          :key="action.priority"
          class="flex items-start space-x-3"
        >
          <span class="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
            {{ action.priority }}
          </span>
          <div>
            <p class="font-medium text-green-800">{{ action.title }}</p>
            <p class="text-sm text-green-700">{{ action.description }}</p>
            <p class="text-xs text-green-600 mt-1">
              <strong>Impacto esperado:</strong> {{ action.expectedImpact }}
            </p>
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

const dimensionsAnalysis = computed(() => {
  if (!municipioData.value) return []

  return [
    {
      key: 'i-Educ',
      name: 'Educação',
      icon: '🎓',
      currentScore: (municipioData.value.percentualIeduc || 0) * 100,
      targetScore: 80,
      improvement: Math.max(0, 80 - (municipioData.value.percentualIeduc || 0) * 100)
    },
    {
      key: 'i-Saude',
      name: 'Saúde',
      icon: '🏥',
      currentScore: (municipioData.value.percentualIsaude || 0) * 100,
      targetScore: 80,
      improvement: Math.max(0, 80 - (municipioData.value.percentualIsaude || 0) * 100)
    },
    {
      key: 'i-Fiscal',
      name: 'Gestão Fiscal',
      icon: '💰',
      currentScore: (municipioData.value.percentualIfiscal || 0) * 100,
      targetScore: 80,
      improvement: Math.max(0, 80 - (municipioData.value.percentualIfiscal || 0) * 100)
    },
    {
      key: 'i-Amb',
      name: 'Meio Ambiente',
      icon: '🌱',
      currentScore: (municipioData.value.percentualIamb || 0) * 100,
      targetScore: 80,
      improvement: Math.max(0, 80 - (municipioData.value.percentualIamb || 0) * 100)
    },
    {
      key: 'i-Cidade',
      name: 'Cidades',
      icon: '🏙️',
      currentScore: (municipioData.value.percentualIcidade || 0) * 100,
      targetScore: 80,
      improvement: Math.max(0, 80 - (municipioData.value.percentualIcidade || 0) * 100)
    },
    {
      key: 'i-Plan',
      name: 'Planejamento',
      icon: '📋',
      currentScore: (municipioData.value.percentualIplan || 0) * 100,
      targetScore: 80,
      improvement: Math.max(0, 80 - (municipioData.value.percentualIplan || 0) * 100)
    },
    {
      key: 'i-Gov TI',
      name: 'Governança TI',
      icon: '💻',
      currentScore: (municipioData.value.percentualIgovTi || 0) * 100,
      targetScore: 80,
      improvement: Math.max(0, 80 - (municipioData.value.percentualIgovTi || 0) * 100)
    }
  ]
})

const totalQuestionsAnalyzed = computed(() => {
  return dimensionsAnalysis.value.reduce((sum, dim) => {
    // Estimar número de questões baseado no score (se tem score > 0, tem questões)
    return sum + (dim.currentScore > 0 ? Math.round(dim.currentScore / 2) : 0)
  }, 0)
})

const criticalQuestions = computed(() => {
  return dimensionsAnalysis.value.filter(dim => dim.currentScore < 80).length
})

const totalImpact = computed(() => {
  return dimensionsAnalysis.value.reduce((sum, dim) => sum + dim.improvement, 0)
})

const topCriticalQuestions = computed(() => {
  return dimensionsAnalysis.value
    .filter(dim => dim.improvement > 0)
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 10)
    .map((dim, index) => ({
      rank: index + 1,
      dimension: dim.key,
      question: `Melhoria geral em ${dim.name}`,
      response: 'Análise baseada em scores dimensionais',
      score: Math.round(dim.currentScore),
      maxScore: 1000,
      impact: dim.improvement.toFixed(2),
      recommendation: getRecommendation(dim.name)
    }))
})

const actionPlan = computed(() => {
  const priorities = dimensionsAnalysis.value
    .filter(dim => dim.improvement > 0)
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 5)

  return priorities.map((dim, index) => ({
    priority: index + 1,
    title: `Melhorar ${dim.name}`,
    description: `Implementar ações específicas para elevar o score de ${dim.currentScore.toFixed(2)}% para ${dim.targetScore}%`,
    expectedImpact: `${dim.improvement.toFixed(2)}% de melhoria no IEGM geral`
  }))
})

const getRecommendation = (dimensionName: string): string => {
  const recommendations: Record<string, string> = {
    'Educação': 'Implementar políticas educacionais estruturadas e monitoramento de resultados',
    'Saúde': 'Melhorar infraestrutura de saúde e gestão de recursos',
    'Gestão Fiscal': 'Aprimorar transparência fiscal e controle interno',
    'Meio Ambiente': 'Desenvolver políticas ambientais e gestão de resíduos',
    'Cidades': 'Investir em mobilidade urbana e planejamento territorial',
    'Planejamento': 'Estabelecer planejamento estratégico e monitoramento de indicadores',
    'Governança TI': 'Modernizar sistemas de TI e transparência digital'
  }

  return recommendations[dimensionName] || 'Implementar melhorias específicas nesta área'
}
</script>
