<template>
  <div class="charts-container">
    <!-- Gráfico de Radar - Comparação Betim vs Top 5 -->
    <div class="card p-6 mb-6">
      <h3 class="text-lg font-semibold text-primary mb-4">Comparação Betim vs Top 5 MG</h3>
      <div class="h-80">
        <canvas ref="radarChartRef"></canvas>
      </div>
    </div>

    <!-- Gráfico de Barras - Ranking Geral -->
    <div class="card p-6 mb-6">
      <h3 class="text-lg font-semibold text-primary mb-4">Ranking IEGM - Top 15 Municípios</h3>
      <div class="h-80">
        <canvas ref="barChartRef"></canvas>
      </div>
    </div>

    <!-- Gráfico de Pizza - Distribuição por Classificação -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">Distribuição por Classificação</h3>
        <div class="h-64">
          <canvas ref="pieChartRef"></canvas>
        </div>
      </div>

      <!-- Gráfico de Linha - Evolução por Dimensão -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">Evolução Betim por Dimensão</h3>
        <div class="h-64">
          <canvas ref="lineChartRef"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useIEGMStore, type Municipio } from '@/stores/iegmStore'

Chart.register(...registerables)

const iegmStore = useIEGMStore()

const radarChartRef = ref<HTMLCanvasElement>()
const barChartRef = ref<HTMLCanvasElement>()
const pieChartRef = ref<HTMLCanvasElement>()
const lineChartRef = ref<HTMLCanvasElement>()

let radarChart: Chart | null = null
let barChart: Chart | null = null
let pieChart: Chart | null = null
let lineChart: Chart | null = null

const createRadarChart = () => {
  if (!radarChartRef.value) return

  const betim = iegmStore.municipioAtual
  const top5 = iegmStore.topMunicipios.slice(0, 5)

  if (!betim || top5.length === 0) return

  const dimensions = ['Educação', 'Saúde', 'Gestão Fiscal', 'Meio Ambiente', 'Cidades', 'Planejamento', 'Governança TI']
  const betimScores = [
    iegmStore.getDimensionScore(betim, 'percentualIeduc'),
    iegmStore.getDimensionScore(betim, 'percentualIsaude'),
    iegmStore.getDimensionScore(betim, 'percentualIfiscal'),
    iegmStore.getDimensionScore(betim, 'percentualIamb'),
    iegmStore.getDimensionScore(betim, 'percentualIcidade'),
    iegmStore.getDimensionScore(betim, 'percentualIplan'),
    iegmStore.getDimensionScore(betim, 'percentualIgovTi')
  ]

  const top5AvgScores = dimensions.map((_, index) => {
    const scores = top5.map(municipio => {
      const keys = ['percentualIeduc', 'percentualIsaude', 'percentualIfiscal', 'percentualIamb', 'percentualIcidade', 'percentualIplan', 'percentualIgovTi']
      return iegmStore.getDimensionScore(municipio, keys[index])
    })
    return scores.reduce((a, b) => a + b, 0) / scores.length
  })

  radarChart = new Chart(radarChartRef.value, {
    type: 'radar',
    data: {
      labels: dimensions,
      datasets: [
        {
          label: 'Betim',
          data: betimScores,
          borderColor: '#1e40af',
          backgroundColor: 'rgba(30, 64, 175, 0.2)',
          pointBackgroundColor: '#1e40af',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#1e40af'
        },
        {
          label: 'Top 5 MG (Média)',
          data: top5AvgScores,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#3b82f6'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 1,
          ticks: {
            stepSize: 0.2
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  })
}

const createBarChart = () => {
  if (!barChartRef.value) return

  const top15 = iegmStore.topMunicipios.slice(0, 15)

  if (top15.length === 0) return

  const labels = top15.map(m => m.municipio)
  const scores = top15.map(m => m.percentualIegmMunicipio || 0)
  const colors = top15.map(m => m.municipio === 'BETIM' ? '#1e40af' : '#3b82f6')

  barChart = new Chart(barChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'IEGM Score',
        data: scores,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: {
            stepSize: 0.2
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
}

const createPieChart = () => {
  if (!pieChartRef.value) return

  const data = iegmStore.filteredData
  const classifications = ['A', 'B+', 'B', 'C+', 'C']
  const counts = classifications.map(grade =>
    data.filter(item => item.indIegmMunicipio === grade).length
  )

  pieChart = new Chart(pieChartRef.value, {
    type: 'pie',
    data: {
      labels: classifications,
      datasets: [{
        data: counts,
        backgroundColor: [
          '#10b981', // A - Verde
          '#3b82f6', // B+ - Azul
          '#6366f1', // B - Índigo
          '#f59e0b', // C+ - Amarelo
          '#ef4444'  // C - Vermelho
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

const createLineChart = () => {
  if (!lineChartRef.value) return

  const betim = iegmStore.municipioAtual
  if (!betim) return

  const dimensions = ['Educação', 'Saúde', 'Gestão Fiscal', 'Meio Ambiente', 'Cidades', 'Planejamento', 'Governança TI']
  const scores = [
    iegmStore.getDimensionScore(betim, 'percentualIeduc'),
    iegmStore.getDimensionScore(betim, 'percentualIsaude'),
    iegmStore.getDimensionScore(betim, 'percentualIfiscal'),
    iegmStore.getDimensionScore(betim, 'percentualIamb'),
    iegmStore.getDimensionScore(betim, 'percentualIcidade'),
    iegmStore.getDimensionScore(betim, 'percentualIplan'),
    iegmStore.getDimensionScore(betim, 'percentualIgovTi')
  ]

  lineChart = new Chart(lineChartRef.value, {
    type: 'line',
    data: {
      labels: dimensions,
      datasets: [{
        label: 'Betim 2023',
        data: scores,
        borderColor: '#1e40af',
        backgroundColor: 'rgba(30, 64, 175, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: {
            stepSize: 0.2
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
}

const updateCharts = () => {
  // Check if data is available
  if (iegmStore.municipiosData.length === 0 || !iegmStore.municipioAtual) {
    return
  }

  // Destroy existing charts safely
  try {
    if (radarChart) {
      radarChart.destroy()
    }
    radarChart = null
  } catch (e) {
    radarChart = null
  }

  try {
    if (barChart) {
      barChart.destroy()
    }
    barChart = null
  } catch (e) {
    barChart = null
  }

  try {
    if (pieChart) {
      pieChart.destroy()
    }
    pieChart = null
  } catch (e) {
    pieChart = null
  }

  try {
    if (lineChart) {
      lineChart.destroy()
    }
    lineChart = null
  } catch (e) {
    lineChart = null
  }

  // Create new charts after a small delay
  setTimeout(() => {
    createRadarChart()
    createBarChart()
    createPieChart()
    createLineChart()
  }, 100)
}

onMounted(() => {
  // Wait for data to be loaded
  if (iegmStore.municipiosData.length > 0) {
    updateCharts()
  } else {
    // Watch for initial data load
    const unwatch = watch(() => iegmStore.municipiosData.length, (newLength) => {
      if (newLength > 0) {
        updateCharts()
        unwatch()
      }
    }, { immediate: true })
  }
})

// Watch for data changes with debounce
let updateTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedUpdateCharts = () => {
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }
  updateTimeout = setTimeout(updateCharts, 300)
}

watch(() => iegmStore.filteredData, debouncedUpdateCharts, { deep: true })
watch(() => iegmStore.municipioAtual, debouncedUpdateCharts)

// Cleanup on unmount
onUnmounted(() => {
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }

  try {
    if (radarChart) {
      radarChart.destroy()
    }
    if (barChart) {
      barChart.destroy()
    }
    if (pieChart) {
      pieChart.destroy()
    }
    if (lineChart) {
      lineChart.destroy()
    }
  } catch (e) {
    // Ignore errors during cleanup
  }
})
</script>
