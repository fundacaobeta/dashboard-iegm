<template>
  <div class="dimension-analysis bg-white rounded-lg shadow-sm border p-6 mb-6">
    <h3 class="text-xl font-bold text-gray-900 mb-4">Análise por Dimensões</h3>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Gráfico de Radar -->
      <div>
        <h4 class="text-lg font-semibold text-gray-800 mb-3">Performance por Dimensão</h4>
        <div class="relative h-80">
          <canvas ref="radarChart" class="w-full h-full"></canvas>
        </div>
      </div>

      <!-- Tabela de Dimensões -->
      <div>
        <h4 class="text-lg font-semibold text-gray-800 mb-3">Detalhamento</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-2 font-medium text-gray-700">Dimensão</th>
                <th class="text-center py-2 font-medium text-gray-700">Score</th>
                <th class="text-center py-2 font-medium text-gray-700">Classificação</th>
                <th class="text-center py-2 font-medium text-gray-700">Ranking</th>
                <th class="text-center py-2 font-medium text-gray-700">vs Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="dimension in dimensionDetails"
                :key="dimension.key"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-3">
                  <div class="flex items-center">
                    <span class="text-lg mr-2">{{ dimension.icon }}</span>
                    <span class="font-medium">{{ dimension.name }}</span>
                  </div>
                </td>
                <td class="text-center py-3">
                  <span class="font-bold" :class="getScoreClass(dimension.score)">
                    {{ (dimension.score * 100).toFixed(1) }}%
                  </span>
                </td>
                <td class="text-center py-3">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="getGradeClass(dimension.grade)"
                  >
                    {{ dimension.grade }}
                  </span>
                </td>
                <td class="text-center py-3">
                  <span class="text-gray-600">{{ dimension.ranking }}º</span>
                </td>
                <td class="text-center py-3">
                  <span :class="getDifferentialClass(dimension.differential)">
                    {{ dimension.differential > 0 ? '+' : '' }}{{ (dimension.differential * 100).toFixed(1) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Análise de Pontos Fortes e Fracos -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Pontos Fortes -->
      <div class="bg-green-50 rounded-lg p-4 border border-green-200">
        <h4 class="text-lg font-semibold text-green-800 mb-3 flex items-center">
          <span class="mr-2">✅</span>
          Pontos Fortes
        </h4>
        <ul class="space-y-2">
          <li
            v-for="strength in strengths"
            :key="strength.dimension"
            class="flex items-start"
          >
            <span class="text-green-600 mr-2">•</span>
            <div>
              <span class="font-medium text-green-800">{{ strength.dimension }}</span>
              <p class="text-sm text-green-700">{{ strength.description }}</p>
            </div>
          </li>
        </ul>
      </div>

      <!-- Pontos de Melhoria -->
      <div class="bg-red-50 rounded-lg p-4 border border-red-200">
        <h4 class="text-lg font-semibold text-red-800 mb-3 flex items-center">
          <span class="mr-2">⚠️</span>
          Pontos de Melhoria
        </h4>
        <ul class="space-y-2">
          <li
            v-for="weakness in weaknesses"
            :key="weakness.dimension"
            class="flex items-start"
          >
            <span class="text-red-600 mr-2">•</span>
            <div>
              <span class="font-medium text-red-800">{{ weakness.dimension }}</span>
              <p class="text-sm text-red-700">{{ weakness.description }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useIEGMStore } from '@/stores/iegmStore'
import Chart from 'chart.js/auto'

const iegmStore = useIEGMStore()

// Refs
const radarChart = ref<HTMLCanvasElement>()
let chart: Chart | null = null

// Computed properties
const betimData = computed(() => iegmStore.municipioAtual)
const stateAverage = computed(() => iegmStore.stateAverage)
const currentYearData = computed(() => iegmStore.currentYearData)

const dimensionDetails = computed(() => {
  if (!betimData.value) return []

  const dimensions = [
    { key: 'percentualIeduc', name: 'Educação', icon: '🎓' },
    { key: 'percentualIsaude', name: 'Saúde', icon: '🏥' },
    { key: 'percentualIfiscal', name: 'Gestão Fiscal', icon: '💰' },
    { key: 'percentualIamb', name: 'Meio Ambiente', icon: '🌱' },
    { key: 'percentualIcidade', name: 'Cidades', icon: '🏙️' },
    { key: 'percentualIplan', name: 'Planejamento', icon: '📋' },
    { key: 'percentualIgovTi', name: 'Governança TI', icon: '💻' }
  ]

  return dimensions.map(dim => {
    const score = iegmStore.getDimensionScore(betimData.value!, dim.key)
    const grade = iegmStore.getDimensionGrade(betimData.value!, dim.key)

    // Calcular ranking
    const allScores = currentYearData.value
      .map(item => iegmStore.getDimensionScore(item, dim.key))
      .filter(s => s > 0)
      .sort((a, b) => b - a)

    const ranking = allScores.findIndex(s => s <= score) + 1

    // Calcular média estadual para a dimensão específica
    const currentYearMunicipios = iegmStore.municipios.filter(m => m.anoRef === iegmStore.filters.ano)
    let stateScore = 0

    switch (dim.key) {
      case 'percentualIeduc':
        stateScore = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIeduc || 0), 0) / currentYearMunicipios.length
        break
      case 'percentualIsaude':
        stateScore = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIsaude || 0), 0) / currentYearMunicipios.length
        break
      case 'percentualIfiscal':
        stateScore = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIfiscal || 0), 0) / currentYearMunicipios.length
        break
      case 'percentualIamb':
        stateScore = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIamb || 0), 0) / currentYearMunicipios.length
        break
      case 'percentualIcidade':
        stateScore = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIcidade || 0), 0) / currentYearMunicipios.length
        break
      case 'percentualIplan':
        stateScore = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIplan || 0), 0) / currentYearMunicipios.length
        break
      case 'percentualIgovTi':
        stateScore = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIgovTi || 0), 0) / currentYearMunicipios.length
        break
    }

    const differential = score - stateScore

    return {
      ...dim,
      score,
      grade,
      ranking,
      differential,
      stateScore
    }
  })
})

const strengths = computed(() => {
  return dimensionDetails.value
    .filter(dim => dim.score > 0.5 && dim.differential > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(dim => ({
      dimension: dim.name,
      description: `Score de ${(dim.score * 100).toFixed(1)}% (${(dim.differential * 100).toFixed(1)}% acima da média estadual)`
    }))
})

const weaknesses = computed(() => {
  // Usar pontos de melhoria do store
  return iegmStore.pontosMelhoria.slice(0, 3).map(p => ({
    dimension: p.nome,
    description: `Score de ${(p.score * 100).toFixed(1)}% (${p.diferenca.toFixed(1)}% abaixo da média estadual)`
  }))
})

// Methods
const getScoreClass = (score: number) => {
  if (score >= 0.6) return 'text-green-600'
  if (score >= 0.4) return 'text-yellow-600'
  return 'text-red-600'
}

const getGradeClass = (grade: string) => {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-800'
    case 'B+': return 'bg-blue-100 text-blue-800'
    case 'B': return 'bg-yellow-100 text-yellow-800'
    case 'C+': return 'bg-orange-100 text-orange-800'
    case 'C': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getDifferentialClass = (differential: number) => {
  if (differential > 0.05) return 'text-green-600'
  if (differential < -0.05) return 'text-red-600'
  return 'text-gray-600'
}

const createRadarChart = () => {
  if (!radarChart.value || !betimData.value) return

  const ctx = radarChart.value.getContext('2d')
  if (!ctx) return

  // Destruir chart anterior
  if (chart) {
    chart.destroy()
  }

  const labels = dimensionDetails.value.map(d => d.name)
  const betimScores = dimensionDetails.value.map(d => d.score * 100)
  const stateScores = dimensionDetails.value.map(d => d.stateScore * 100)

  chart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: 'Betim',
          data: betimScores,
          borderColor: '#1e40af',
          backgroundColor: 'rgba(30, 64, 175, 0.2)',
          borderWidth: 2,
          pointBackgroundColor: '#1e40af',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: 'Média MG',
          data: stateScores,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderWidth: 2,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          pointLabels: {
            font: {
              size: 12
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

// Lifecycle
onMounted(() => {
  if (betimData.value) {
    createRadarChart()
  }
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})

// Watchers
watch(() => betimData.value, () => {
  if (betimData.value) {
    createRadarChart()
  }
}, { immediate: true })
</script>
