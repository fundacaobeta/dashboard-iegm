<template>
  <div class="filters-panel bg-white rounded-lg shadow-sm border p-4 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Filtros Avançados</h3>
      <button
        @click="isCollapsed = !isCollapsed"
        class="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg
          :class="{ 'rotate-180': !isCollapsed }"
          class="w-5 h-5 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <div v-show="!isCollapsed" class="space-y-4">
      <!-- Filtros principais em linha -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Ano -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ano</label>
          <select
            v-model="localFilters.year"
            @change="updateFilters"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="year in iegmStore.anosDisponiveis" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>

        <!-- Município -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Município</label>
          <select
            v-model="localFilters.municipality"
            @change="updateFilters"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option v-for="municipio in iegmStore.municipios.map(m => m.municipio)" :key="municipio" :value="municipio">
              {{ municipio }}
            </option>
          </select>
        </div>

        <!-- Classificação -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Classificação</label>
          <select
            v-model="localFilters.classification"
            @change="updateFilters"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            <option v-for="classif in ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D']" :key="classif" :value="classif">
              {{ classif }}
            </option>
          </select>
        </div>

        <!-- Dimensão -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Dimensão</label>
          <select
            v-model="localFilters.dimension"
            @change="updateFilters"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            <option v-for="dim in ['i-Amb', 'i-Cidade', 'i-Educ', 'i-Fiscal', 'i-GovTI', 'i-Saude', 'i-Plan']" :key="dim" :value="dim">
              {{ dim }}
            </option>
          </select>
        </div>
      </div>

      <!-- Filtros avançados -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Score Range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Faixa de Score</label>
          <div class="flex space-x-2">
            <input
              v-model.number="localFilters.minScore"
              @input="updateFilters"
              type="number"
              min="0"
              max="1"
              step="0.1"
              placeholder="Min"
              class="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              v-model.number="localFilters.maxScore"
              @input="updateFilters"
              type="number"
              min="0"
              max="1"
              step="0.1"
              placeholder="Max"
              class="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Top N -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Top N Municípios</label>
          <input
            v-model.number="localFilters.topN"
            @input="updateFilters"
            type="number"
            min="1"
            max="100"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Indicador -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Indicador</label>
          <select
            v-model="localFilters.indicator"
            @change="updateFilters"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option v-for="ind in ['i-Amb', 'i-Cidade', 'i-Educ', 'i-Fiscal', 'i-Gov TI', 'i-Saude', 'i-Plan']" :key="ind" :value="ind">
              {{ ind }}
            </option>
          </select>
        </div>
      </div>

      <!-- Filtros de resposta -->
      <div class="flex space-x-4">
        <label class="flex items-center">
          <input
            v-model="localFilters.showOnlyAnswered"
            @change="updateFilters"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700">Apenas respondidos</span>
        </label>
        <label class="flex items-center">
          <input
            v-model="localFilters.showOnlyScored"
            @change="updateFilters"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700">Apenas pontuados</span>
        </label>
      </div>

      <!-- Botões de ação -->
      <div class="flex justify-between items-center pt-2 border-t">
        <button
          @click="resetFilters"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Limpar Filtros
        </button>
        <div class="text-sm text-gray-500">
          {{ filteredCount }} municípios encontrados
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useIEGMStore } from '@/stores/iegmStore'

const iegmStore = useIEGMStore()

// Props
interface Props {
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false
})

// Estado local
const isCollapsed = ref(props.collapsed)
const localFilters = ref({
  ano: iegmStore.filters.ano,
  tribunal: iegmStore.filters.tribunal,
  municipio: iegmStore.filters.municipio,
  indicador: iegmStore.filters.indicador,
  faixa: iegmStore.filters.faixa,
  year: iegmStore.filters.ano,
  municipality: iegmStore.filters.municipio,
  classification: '',
  dimension: '',
  minScore: undefined as number | undefined,
  maxScore: undefined as number | undefined,
  topN: undefined as number | undefined,
  indicator: iegmStore.filters.indicador,
  showOnlyAnswered: false,
  showOnlyScored: false
})

// Computed
const filters = computed(() => iegmStore.filters)
const filteredCount = computed(() => iegmStore.municipios.length)

// Watchers
watch(() => iegmStore.filters, (newFilters) => {
  localFilters.value = {
    ano: newFilters.ano,
    tribunal: newFilters.tribunal,
    municipio: newFilters.municipio,
    indicador: newFilters.indicador,
    faixa: newFilters.faixa,
    year: newFilters.ano,
    municipality: newFilters.municipio,
    classification: '',
    dimension: '',
    minScore: undefined,
    maxScore: undefined,
    topN: undefined,
    indicator: newFilters.indicador,
    showOnlyAnswered: false,
    showOnlyScored: false
  }
}, { deep: true })

// Methods
const updateFilters = () => {
  iegmStore.updateFilters({
    ano: localFilters.value.ano,
    tribunal: localFilters.value.tribunal,
    municipio: localFilters.value.municipio,
    indicador: localFilters.value.indicador,
    faixa: localFilters.value.faixa
  })
}

const resetFilters = () => {
  localFilters.value = {
    ano: 2023,
    tribunal: 'TCEMG',
    municipio: '',
    indicador: '',
    faixa: '',
    year: 2023,
    municipality: '',
    classification: '',
    dimension: '',
    minScore: undefined,
    maxScore: undefined,
    topN: undefined,
    indicator: '',
    showOnlyAnswered: false,
    showOnlyScored: false
  }
  updateFilters()
}
</script>

<style scoped>
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>
