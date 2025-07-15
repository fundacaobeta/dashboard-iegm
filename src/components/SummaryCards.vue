<template>
  <div class="summary-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Card IEGM Geral -->
    <div class="bg-white rounded-lg shadow-sm border p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">IEGM Geral</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ betimScore }}%
          </p>
          <p class="text-sm text-gray-500">{{ betimGrade }}</p>
        </div>
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <span class="text-blue-600 text-xl">📊</span>
        </div>
      </div>
      <div class="mt-3 flex items-center text-sm">
        <span :class="scoreChangeClass">{{ scoreChangeText }}</span>
        <span class="text-gray-500 ml-1">vs ano anterior</span>
      </div>
    </div>

    <!-- Card Ranking -->
    <div class="bg-white rounded-lg shadow-sm border p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Ranking MG</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ ranking }}{{ rankingSuffix }}
          </p>
          <p class="text-sm text-gray-500">de {{ totalMunicipios }} municípios</p>
        </div>
        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <span class="text-green-600 text-xl">🏆</span>
        </div>
      </div>
      <div class="mt-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Percentil</span>
          <span class="font-medium">{{ percentile }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            class="bg-green-500 h-2 rounded-full"
            :style="{ width: `${percentile}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Card Média Estadual -->
    <div class="bg-white rounded-lg shadow-sm border p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Média MG</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ stateAverageScore }}%
          </p>
          <p class="text-sm text-gray-500">Estado</p>
        </div>
        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <span class="text-purple-600 text-xl">📈</span>
        </div>
      </div>
      <div class="mt-3 flex items-center text-sm">
        <span :class="differentialClass">{{ differentialText }}</span>
        <span class="text-gray-500 ml-1">vs média</span>
      </div>
    </div>

    <!-- Card Melhor Dimensão -->
    <div class="bg-white rounded-lg shadow-sm border p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Melhor Dimensão</p>
          <p class="text-lg font-bold text-gray-900">
            {{ bestDimension.name }}
          </p>
          <p class="text-sm text-gray-500">{{ bestDimension.score }}%</p>
        </div>
        <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
          <span class="text-yellow-600 text-xl">{{ bestDimension.icon }}</span>
        </div>
      </div>
      <div class="mt-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Classificação</span>
          <span class="font-medium">{{ bestDimension.grade }}</span>
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
const betimScore = computed(() => {
  if (!iegmStore.municipioAtual?.percentualIegmMunicipio) return '0.00'
  return (iegmStore.municipioAtual.percentualIegmMunicipio * 100).toFixed(2)
})

const betimGrade = computed(() => {
  return iegmStore.municipioAtual?.faixaIegmMunicipio || 'N/A'
})

const ranking = computed(() => {
  return iegmStore.rankingMunicipio?.ranking || 0
})

const rankingSuffix = computed(() => {
  const rank = ranking.value
  if (rank === 1) return 'º'
  if (rank === 2) return 'º'
  if (rank === 3) return 'º'
  return 'º'
})

const totalMunicipios = computed(() => {
  return iegmStore.rankingMunicipio?.totalMunicipios || 0
})

const percentile = computed(() => {
  return iegmStore.percentilMunicipio || 0
})

const stateAverageScore = computed(() => {
  // Usar estatísticas gerais se disponível, senão calcular a partir dos dados
  if (iegmStore.estatisticasGeraisAnoAtual?.mediaIegm) {
    return (iegmStore.estatisticasGeraisAnoAtual.mediaIegm * 100).toFixed(2)
  }

  // Fallback: calcular média dos municípios do ano atual
  const currentYearMunicipios = iegmStore.municipios.filter(m => m.anoRef === iegmStore.filters.ano && m.percentualIegmMunicipio !== null)
  if (currentYearMunicipios.length === 0) return '0.00'

  const media = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIegmMunicipio || 0), 0) / currentYearMunicipios.length
  return (media * 100).toFixed(2)
})

const iegmDifference = computed(() => {
  if (!iegmStore.municipioAtual?.percentualIegmMunicipio) return 0
  if (!iegmStore.estatisticasGeraisAnoAtual?.mediaIegm) return 0

  return iegmStore.municipioAtual.percentualIegmMunicipio - iegmStore.estatisticasGeraisAnoAtual.mediaIegm
})

const differentialText = computed(() => {
  const diff = iegmDifference.value
  if (diff > 0) return `+${(diff * 100).toFixed(2)}%`
  return `${(diff * 100).toFixed(2)}%`
})

const differentialClass = computed(() => {
  const diff = iegmDifference.value
  if (diff > 0) return 'text-green-600'
  if (diff < 0) return 'text-red-600'
  return 'text-gray-600'
})

const scoreChange = computed(() => {
  return iegmStore.comparativoAnoAnterior?.variacao || 0
})

const scoreChangeText = computed(() => {
  const change = scoreChange.value
  if (change > 0) return `+${(change * 100).toFixed(2)}%`
  return `${(change * 100).toFixed(2)}%`
})

const scoreChangeClass = computed(() => {
  const change = scoreChange.value
  if (change > 0) return 'text-green-600'
  if (change < 0) return 'text-red-600'
  return 'text-gray-600'
})

const bestDimension = computed(() => {
  const melhor = iegmStore.melhorDimensao
  if (!melhor) {
    return {
      name: 'N/A',
      score: '0.00',
      grade: 'N/A',
      icon: '❓'
    }
  }

  const score = (melhor.score! * 100).toFixed(2)
  const grade = iegmStore.getDimensionGrade(iegmStore.municipioAtual!, melhor.nome === 'Educação' ? 'percentualIeduc' :
                                           melhor.nome === 'Saúde' ? 'percentualIsaude' :
                                           melhor.nome === 'Gestão Fiscal' ? 'percentualIfiscal' :
                                           melhor.nome === 'Meio Ambiente' ? 'percentualIamb' :
                                           melhor.nome === 'Cidades' ? 'percentualIcidade' :
                                           melhor.nome === 'Planejamento' ? 'percentualIplan' : 'percentualIgovTi')

  const icons = {
    'Educação': '🎓',
    'Saúde': '🏥',
    'Gestão Fiscal': '💰',
    'Meio Ambiente': '🌱',
    'Cidades': '🏙️',
    'Planejamento': '📋',
    'Governança TI': '💻'
  }

  return {
    name: melhor.nome,
    score,
    grade,
    icon: icons[melhor.nome as keyof typeof icons] || '📊'
  }
})
</script>
