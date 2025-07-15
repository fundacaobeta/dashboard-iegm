<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Dashboard IEGM - Betim</h1>
            <p class="text-gray-600">Índice de Efetividade da Gestão Municipal - Relatório Completo</p>
          </div>
          <div class="flex space-x-4">
            <button
              @click="exportData"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Exportar Dados
            </button>
            <button
              @click="printReport"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Imprimir Relatório
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="iegmStore.loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Carregando dados do IEGM...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="iegmStore.error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-800">{{ iegmStore.error }}</p>
        <button
          @click="loadData"
          class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-8">
        <!-- Filtros -->
        <FiltersPanel :collapsed="true" />

        <!-- Cards de Resumo -->
        <SummaryCards />

        <!-- Análise por Dimensões -->
        <DimensionAnalysis />

        <!-- Análise Comparativa -->
        <ComparisonPanel />

        <!-- Análise de Indicadores -->
        <IndicatorAnalysis />

        <!-- Análise Avançada -->
        <AdvancedAnalysis />

        <!-- Respostas que Pesam Negativamente -->
        <NegativeResponses />

        <!-- Informações sobre o IEGM -->
        <IEGMInfo />

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useIEGMStore, type Municipio } from '@/stores/iegmStore'
import FiltersPanel from '@/components/FiltersPanel.vue'
import SummaryCards from '@/components/SummaryCards.vue'
import DimensionAnalysis from '@/components/DimensionAnalysis.vue'
import ComparisonPanel from '@/components/ComparisonPanel.vue'
import IndicatorAnalysis from '@/components/IndicatorAnalysis.vue'
import AdvancedAnalysis from '@/components/AdvancedAnalysis.vue'
import NegativeResponses from '@/components/NegativeResponses.vue'
import IEGMInfo from '@/components/IEGMInfo.vue'

const iegmStore = useIEGMStore()

// Methods
const loadData = async () => {
  console.log('Dashboard: Iniciando carregamento de dados...');
  await iegmStore.initialize();
  console.log('Dashboard: Carregamento de dados concluído');
}

const exportData = () => {
  const data = iegmStore.municipiosFiltrados
  const csvContent = convertToCSV(data)
  downloadCSV(csvContent, `iegm_betim_${iegmStore.filters.ano}.csv`)
}

const printReport = () => {
  window.print()
}

const convertToCSV = (data: Municipio[]) => {
  if (!data || data.length === 0) return ''

  const headers = Object.keys(data[0] || {})
  const csvRows = [
    headers.join(';'),
    ...data.map(row => {
      if (!row) return headers.map(() => '').join(';')
      return headers.map(header => {
        const value = row[header as keyof Municipio]
        return value !== undefined && value !== null ? String(value) : ''
      }).join(';')
    })
  ]

  return csvRows.join('\n')
}

const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
@media print {
  header {
    display: none;
  }

  .filters-panel {
    display: none;
  }

  main {
    padding: 0;
  }

  .bg-gray-50 {
    background-color: white !important;
  }

  .shadow-sm {
    box-shadow: none !important;
  }

  .border {
    border: 1px solid #e5e7eb !important;
  }
}
</style>
