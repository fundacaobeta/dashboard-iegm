<template>
  <div class="dimension-details">
    <div class="card p-6 mb-6">
      <h3 class="text-xl font-semibold text-primary mb-6">Análise por Dimensões</h3>

      <!-- Seletor de Dimensão -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Selecione uma Dimensão</label>
        <select
          v-model="selectedDimension"
          class="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione uma dimensão</option>
          <option v-for="dim in dimensions" :key="dim.key" :value="dim.key">
            {{ dim.name }}
          </option>
        </select>
      </div>

      <!-- Detalhes da Dimensão Selecionada -->
      <div v-if="selectedDimension && selectedDimensionData" class="space-y-6">
        <!-- Resumo da Dimensão -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h4 class="font-semibold text-blue-800 mb-2">Score Betim</h4>
            <p class="text-2xl font-bold text-blue-600">
              {{ (selectedDimensionData.betimScore * 100).toFixed(1) }}%
            </p>
            <p class="text-sm text-blue-600 mt-1">
              Classificação: {{ selectedDimensionData.betimGrade }}
            </p>
          </div>

          <div class="bg-green-50 p-4 rounded-lg">
            <h4 class="font-semibold text-green-800 mb-2">Média MG</h4>
            <p class="text-2xl font-bold text-green-600">
              {{ (selectedDimensionData.averageScore * 100).toFixed(1) }}%
            </p>
            <p class="text-sm text-green-600 mt-1">
              {{ selectedDimensionData.totalMunicipios }} municípios
            </p>
          </div>

          <div class="bg-purple-50 p-4 rounded-lg">
            <h4 class="font-semibold text-purple-800 mb-2">Ranking Betim</h4>
            <p class="text-2xl font-bold text-purple-600">
              #{{ selectedDimensionData.betimRanking }}
            </p>
            <p class="text-sm text-purple-600 mt-1">
              de {{ selectedDimensionData.totalMunicipios }} municípios
            </p>
          </div>
        </div>

        <!-- Gráfico de Distribuição -->
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <h4 class="font-semibold text-gray-800 mb-4">Distribuição por Classificação</h4>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div v-for="grade in gradeDistribution" :key="grade.grade"
                 class="text-center p-3 rounded-lg"
                 :class="grade.bgColor">
              <div class="text-2xl font-bold text-white mb-1">{{ grade.count }}</div>
              <div class="text-sm text-white font-medium">{{ grade.grade }}</div>
              <div class="text-xs text-white opacity-90">{{ grade.percentage }}%</div>
            </div>
          </div>
        </div>

        <!-- Top 10 Municípios -->
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <h4 class="font-semibold text-gray-800 mb-4">Top 10 Municípios - {{ getDimensionName(selectedDimension) }}</h4>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-2 px-3 font-medium text-gray-700">Ranking</th>
                  <th class="text-left py-2 px-3 font-medium text-gray-700">Município</th>
                  <th class="text-left py-2 px-3 font-medium text-gray-700">Score</th>
                  <th class="text-left py-2 px-3 font-medium text-gray-700">Classificação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(municipio, index) in topMunicipios" :key="municipio.municipio"
                    :class="['border-b border-gray-100', { 'bg-blue-50': municipio.municipio === 'BETIM' }]">
                  <td class="py-2 px-3 text-sm">{{ index + 1 }}</td>
                  <td class="py-2 px-3 text-sm font-medium" :class="{ 'text-blue-600': municipio.municipio === 'BETIM' }">
                    {{ municipio.municipio }}
                  </td>
                  <td class="py-2 px-3 text-sm">{{ (getDimensionScore(municipio, selectedDimension) * 100).toFixed(1) }}%</td>
                  <td class="py-2 px-3 text-sm">
                    <span :class="getGradeColor(getDimensionGrade(municipio, selectedDimension))">
                      {{ getDimensionGrade(municipio, selectedDimension) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Análise Comparativa -->
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <h4 class="font-semibold text-gray-800 mb-4">Análise Comparativa</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 class="font-medium text-gray-700 mb-3">Betim vs Média MG</h5>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Betim</span>
                  <div class="flex items-center gap-2">
                    <div class="w-32 bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-600 h-2 rounded-full"
                           :style="{ width: (selectedDimensionData.betimScore * 100) + '%' }"></div>
                    </div>
                    <span class="text-sm font-medium">{{ (selectedDimensionData.betimScore * 100).toFixed(1) }}%</span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Média MG</span>
                  <div class="flex items-center gap-2">
                    <div class="w-32 bg-gray-200 rounded-full h-2">
                      <div class="bg-green-600 h-2 rounded-full"
                           :style="{ width: (selectedDimensionData.averageScore * 100) + '%' }"></div>
                    </div>
                    <span class="text-sm font-medium">{{ (selectedDimensionData.averageScore * 100).toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 class="font-medium text-gray-700 mb-3">Posicionamento</h5>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Percentil:</span>
                  <span class="font-medium">{{ selectedDimensionData.percentile.toFixed(1) }}%</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Diferencial:</span>
                  <span :class="['font-medium', selectedDimensionData.differential >= 0 ? 'text-green-600' : 'text-red-600']">
                    {{ selectedDimensionData.differential >= 0 ? '+' : '' }}{{ (selectedDimensionData.differential * 100).toFixed(1) }}%
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Status:</span>
                  <span :class="['font-medium', selectedDimensionData.differential >= 0 ? 'text-green-600' : 'text-red-600']">
                    {{ selectedDimensionData.differential >= 0 ? 'Acima da média' : 'Abaixo da média' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIEGMStore, type Municipio } from '@/stores/iegmStore'

defineOptions({
  name: 'DimensionDetails'
})

const iegmStore = useIEGMStore()
const selectedDimension = ref('')

const dimensionKeys = [
  { key: 'percentualIeduc', name: 'Educação (i-Educ)' },
  { key: 'percentualIsaude', name: 'Saúde (i-Saúde)' },
  { key: 'percentualIfiscal', name: 'Gestão Fiscal (i-Fiscal)' },
  { key: 'percentualIamb', name: 'Meio Ambiente (i-Amb)' },
  { key: 'percentualIcidade', name: 'Cidades (i-Cidade)' },
  { key: 'percentualIplan', name: 'Planejamento (i-Plan)' },
  { key: 'percentualIgovTi', name: 'Governança de TI (i-GovTI)' }
]

const selectedDimensionData = computed(() => {
  if (!selectedDimension.value || !iegmStore.municipioAtual) return null

  const data = iegmStore.filteredData
  const betimScore = iegmStore.getDimensionScore(iegmStore.municipioAtual, selectedDimension.value)
  const betimGrade = iegmStore.getDimensionGrade(iegmStore.municipioAtual, selectedDimension.value)

  const scores = data
    .map(item => iegmStore.getDimensionScore(item, selectedDimension.value))
    .filter(score => score > 0)
    .sort((a, b) => b - a)

  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const betimRanking = scores.findIndex(score => score <= betimScore) + 1
  const percentile = ((scores.length - betimRanking + 1) / scores.length) * 100
  const differential = betimScore - averageScore

  return {
    betimScore,
    betimGrade,
    averageScore,
    betimRanking,
    totalMunicipios: scores.length,
    percentile,
    differential
  }
})

const topMunicipios = computed(() => {
  if (!selectedDimension.value) return []

  return iegmStore.filteredData
    .map(item => ({
      ...item,
      dimensionScore: iegmStore.getDimensionScore(item, selectedDimension.value)
    }))
    .filter(item => item.dimensionScore > 0)
    .sort((a, b) => b.dimensionScore - a.dimensionScore)
    .slice(0, 10)
})

const gradeDistribution = computed(() => {
  if (!selectedDimension.value) return []

  const data = iegmStore.filteredData
  const grades = ['A', 'B+', 'B', 'C+', 'C']
  const distribution = grades.map(grade => {
    const count = data.filter(item =>
      iegmStore.getDimensionGrade(item, selectedDimension.value) === grade
    ).length
    return {
      grade,
      count,
      percentage: data.length > 0 ? ((count / data.length) * 100).toFixed(1) : '0'
    }
  })

  const colors = ['bg-green-600', 'bg-blue-600', 'bg-indigo-600', 'bg-yellow-600', 'bg-red-600']

  return distribution.map((item, index) => ({
    ...item,
    bgColor: colors[index]
  }))
})

const getDimensionName = (key: string) => {
  return dimensionKeys.find(dim => dim.key === key)?.name || key
}

const getDimensionScore = (item: Municipio, dimension: string) => {
  return iegmStore.getDimensionScore(item, dimension)
}

const getDimensionGrade = (item: Municipio, dimension: string) => {
  return iegmStore.getDimensionGrade(item, dimension)
}

const getGradeColor = (grade: string) => {
  const colors = {
    'A': 'text-green-600 bg-green-100',
    'B+': 'text-blue-600 bg-blue-100',
    'B': 'text-indigo-600 bg-indigo-100',
    'C+': 'text-yellow-600 bg-yellow-100',
    'C': 'text-red-600 bg-red-100'
  }
  return `px-2 py-1 rounded text-xs font-medium ${colors[grade as keyof typeof colors] || 'text-gray-600 bg-gray-100'}`
}
</script>
