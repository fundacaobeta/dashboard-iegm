<template>
  <div class="example-usage">
    <h2 class="text-2xl font-bold mb-6">Exemplo de Uso da Nova Estrutura</h2>

    <!-- Status de Inicialização -->
    <div class="mb-6 p-4 bg-blue-50 rounded-lg">
      <h3 class="font-semibold mb-2">Status do Sistema</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium">Inicializado:</span>
          <span :class="store.isInitialized ? 'text-green-600' : 'text-red-600'">
            {{ store.isInitialized ? 'Sim' : 'Não' }}
          </span>
        </div>
        <div>
          <span class="font-medium">Modo:</span>
          <span :class="store.isMockData ? 'text-orange-600' : 'text-green-600'">
            {{ store.isMockData ? 'API Local' : 'Banco de Dados' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="font-semibold mb-4">Filtros</h3>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Ano</label>
          <select
            v-model="localFilters.ano"
            @change="updateFilters"
            class="w-full px-3 py-2 border rounded-md"
          >
            <option value="2022">2022</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Município</label>
          <input
            v-model="localFilters.municipio"
            @input="updateFilters"
            placeholder="Digite o nome do município"
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Tribunal</label>
          <select
            v-model="localFilters.tribunal"
            @change="updateFilters"
            class="w-full px-3 py-2 border rounded-md"
          >
            <option value="TCEMG">TCEMG</option>
            <option value="TCE">TCE</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading States -->
    <div v-if="store.isLoading" class="mb-6 p-4 bg-yellow-50 rounded-lg">
      <div class="flex items-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
        <span>Carregando dados...</span>
      </div>
    </div>

    <!-- Error States -->
    <div v-if="store.hasError" class="mb-6 p-4 bg-red-50 rounded-lg">
      <h3 class="font-semibold text-red-800 mb-2">Erros Encontrados</h3>
      <div class="text-sm text-red-700">
        <div v-for="(error, key) in store.errorState" :key="key" v-if="error">
          <strong>{{ key }}:</strong> {{ error }}
        </div>
      </div>
    </div>

    <!-- Dados dos Municípios -->
    <div class="mb-6">
      <h3 class="font-semibold mb-4">Dados dos Municípios</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 bg-white border rounded-lg">
          <h4 class="font-medium mb-2">Total de Municípios</h4>
          <p class="text-2xl font-bold text-blue-600">{{ store.municipios.length }}</p>
        </div>
        <div class="p-4 bg-white border rounded-lg">
          <h4 class="font-medium mb-2">Município Atual</h4>
          <p class="text-lg font-semibold">{{ store.municipioAtual?.municipio || 'Nenhum selecionado' }}</p>
        </div>
        <div class="p-4 bg-white border rounded-lg">
          <h4 class="font-medium mb-2">Ranking</h4>
          <p class="text-2xl font-bold text-green-600">{{ store.municipioRanking?.ranking || 'N/A' }}</p>
        </div>
      </div>
    </div>

    <!-- Análise -->
    <div class="mb-6">
      <h3 class="font-semibold mb-4">Análise</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Pontos Fortes -->
        <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 class="font-semibold text-green-800 mb-3">Pontos Fortes</h4>
          <div v-if="store.pontosFortes.length === 0" class="text-green-600">
            Nenhum ponto forte identificado
          </div>
          <ul v-else class="space-y-2">
            <li
              v-for="ponto in store.pontosFortes"
              :key="ponto.nome"
              class="text-sm text-green-700"
            >
              <strong>{{ ponto.nome }}:</strong> {{ (ponto.score * 100).toFixed(1) }}%
              <span class="text-green-600">(+{{ (ponto.diferenca * 100).toFixed(1) }}%)</span>
            </li>
          </ul>
        </div>

        <!-- Pontos de Melhoria -->
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 class="font-semibold text-red-800 mb-3">Pontos de Melhoria</h4>
          <div v-if="store.pontosMelhoria.length === 0" class="text-red-600">
            Nenhum ponto de melhoria identificado
          </div>
          <ul v-else class="space-y-2">
            <li
              v-for="ponto in store.pontosMelhoria"
              :key="ponto.nome"
              class="text-sm text-red-700"
            >
              <strong>{{ ponto.nome }}:</strong> {{ (ponto.score * 100).toFixed(1) }}%
              <span class="text-red-600">(-{{ (ponto.diferenca * 100).toFixed(1) }}%)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Top Municípios -->
    <div class="mb-6">
      <h3 class="font-semibold mb-4">Top 10 Municípios</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-2 font-medium">Ranking</th>
              <th class="text-left py-2 font-medium">Município</th>
              <th class="text-center py-2 font-medium">IEGM</th>
              <th class="text-center py-2 font-medium">Classificação</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="municipio in store.topMunicipios"
              :key="municipio.municipio"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="py-2">{{ municipio.ranking }}</td>
              <td class="py-2 font-medium">{{ municipio.municipio }}</td>
              <td class="py-2 text-center">{{ (municipio.pctIegmMunicipio * 100).toFixed(1) }}%</td>
              <td class="py-2 text-center">
                <span class="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {{ municipio.indIegmMunicipio }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Botões de Ação -->
    <div class="flex space-x-4">
      <button
        @click="loadData"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Carregar Dados
      </button>
      <button
        @click="resetData"
        class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
      >
        Resetar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useIEGMStore } from '@/stores/iegmStore';
import type { IEGMFilters } from '@/services/iegm';

// Store
const store = useIEGMStore();

// Estado local
const localFilters = ref<IEGMFilters>({
  ano: 2023,
  tribunal: 'TCEMG',
  municipio: 'BETIM'
});

// Métodos
const updateFilters = async () => {
  await store.updateFilters(localFilters.value);
};

const loadData = async () => {
  await store.loadAllData();
};

const resetData = () => {
  store.reset();
  localFilters.value = {
    ano: 2023,
    tribunal: 'TCEMG',
    municipio: 'BETIM'
  };
};

// Inicialização
onMounted(async () => {
  // Inicializar o store (simulando D1Database)
  await store.initialize();

  // Sincronizar filtros locais com o store
  localFilters.value = { ...store.filters };
});
</script>
 