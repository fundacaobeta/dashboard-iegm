<template>
  <div class="comparison-panel bg-white rounded-lg shadow-sm border p-6 mb-6">
    <h3 class="text-xl font-bold text-gray-900 mb-4">Análise Comparativa</h3>

    <!-- Resumo dos Grupos de Comparação -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div
        v-for="group in comparisonGroups"
        :key="group.name"
        class="bg-gray-50 rounded-lg p-4 border"
      >
        <h4 class="font-medium text-gray-900 mb-2">{{ group.name }}</h4>
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">IEGM:</span>
            <span class="font-medium">{{ getGroupScore(group.name) }}%</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Ranking:</span>
            <span class="font-medium">{{ getGroupRanking(group.name) }}</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">{{ group.description }}</p>
      </div>
    </div>

    <!-- Comparação com Top Municípios -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <h4 class="text-lg font-semibold text-gray-800 mb-4">Comparação com Top Municípios MG</h4>

      <!-- Abas para diferentes visualizações -->
      <div class="flex space-x-1 mb-4 border-b border-gray-200">
        <button
          @click="activeTab = 'top5'"
          :class="['px-4 py-2 text-sm font-medium rounded-t-lg',
                   activeTab === 'top5' ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700']"
        >
          Top 5
        </button>
        <button
          @click="activeTab = 'top10'"
          :class="['px-4 py-2 text-sm font-medium rounded-t-lg',
                   activeTab === 'top10' ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700']"
        >
          Top 10
        </button>
        <button
          @click="activeTab = 'top25'"
          :class="['px-4 py-2 text-sm font-medium rounded-t-lg',
                   activeTab === 'top25' ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700']"
        >
          Top 25
        </button>
      </div>

      <!-- Tabela de comparação -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 font-medium text-gray-700">Posição</th>
              <th class="text-left py-3 font-medium text-gray-700">Município</th>
              <th class="text-center py-3 font-medium text-gray-700">IEGM</th>
              <th class="text-center py-3 font-medium text-gray-700">Educação</th>
              <th class="text-center py-3 font-medium text-gray-700">Saúde</th>
              <th class="text-center py-3 font-medium text-gray-700">Fiscal</th>
              <th class="text-center py-3 font-medium text-gray-700">Ambiente</th>
              <th class="text-center py-3 font-medium text-gray-700">Cidades</th>
              <th class="text-center py-3 font-medium text-gray-700">Planejamento</th>
              <th class="text-center py-3 font-medium text-gray-700">GovTI</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="municipio in currentTabData"
              :key="municipio.municipio"
              :class="['border-b border-gray-100 hover:bg-gray-50',
                       municipio.isBetim ? 'bg-blue-50 font-semibold' : '']"
            >
              <td class="py-3">
                <span :class="municipio.isBetim ? 'text-blue-600' : 'text-gray-600'">
                  {{ municipio.position }}
                </span>
              </td>
              <td class="py-3">
                <span :class="municipio.isBetim ? 'text-blue-600 font-semibold' : 'text-gray-900'">
                  {{ municipio.municipio }}
                </span>
              </td>
              <td class="text-center py-3">
                <span :class="municipio.isBetim ? 'font-bold text-blue-600' : 'font-medium'">
                  {{ municipio.iegm }}%
                </span>
              </td>
              <td class="text-center py-3">{{ municipio.educacao }}%</td>
              <td class="text-center py-3">{{ municipio.saude }}%</td>
              <td class="text-center py-3">{{ municipio.fiscal }}%</td>
              <td class="text-center py-3">{{ municipio.ambiente }}%</td>
              <td class="text-center py-3">{{ municipio.cidades }}%</td>
              <td class="text-center py-3">{{ municipio.planejamento }}%</td>
              <td class="text-center py-3">{{ municipio.govti }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Resumo da posição de Betim -->
      <div v-if="betimPosition" class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p class="text-sm text-blue-800">
          <strong>Betim</strong> está na <strong>{{ betimPosition }}ª posição</strong>
          entre {{ totalMunicipios }} municípios de Minas Gerais em 2023.
        </p>
      </div>
    </div>

    <!-- Gráfico de Comparação por Dimensões -->
    <div class="mb-6">
      <h4 class="text-lg font-semibold text-gray-800 mb-4">Comparação por Dimensões</h4>
      <div class="relative h-96">
        <canvas ref="comparisonChart" class="w-full h-full"></canvas>
      </div>
    </div>

    <!-- Tabela Detalhada de Comparação -->
    <div class="mb-6">
      <h4 class="text-lg font-semibold text-gray-800 mb-4">Detalhamento por Dimensão</h4>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 font-medium text-gray-700">Dimensão</th>
              <th
                v-for="group in comparisonGroups"
                :key="group.name"
                class="text-center py-3 font-medium text-gray-700"
                :style="{ color: group.color }"
              >
                {{ group.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="dimension in dimensions"
              :key="dimension.key"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="py-3">
                <div class="flex items-center">
                  <span class="text-lg mr-2">{{ dimension.icon }}</span>
                  <span class="font-medium">{{ dimension.name }}</span>
                </div>
              </td>
              <td
                v-for="group in comparisonGroups"
                :key="group.name"
                class="text-center py-3"
              >
                <div class="space-y-1">
                  <span class="font-bold" :style="{ color: group.color }">
                    {{ getGroupDimensionScore(group.name, dimension.key) }}%
                  </span>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="h-2 rounded-full"
                      :style="{
                        width: `${getGroupDimensionScore(group.name, dimension.key)}%`,
                        backgroundColor: group.color
                      }"
                    ></div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Análise de Posicionamento -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Pontos Fortes vs Competidores -->
      <div class="bg-green-50 rounded-lg p-4 border border-green-200">
        <h4 class="text-lg font-semibold text-green-800 mb-3 flex items-center">
          <span class="mr-2">🏆</span>
          Vantagens Competitivas
        </h4>
        <div v-if="competitiveAdvantages.length === 0" class="text-center py-4">
          <p class="text-blue-700 font-medium">📊 Análise em andamento...</p>
          <p class="text-sm text-blue-600 mt-1">Comparando com outros municípios.</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="advantage in competitiveAdvantages"
            :key="advantage.dimension"
            class="bg-white rounded p-3 border border-green-200"
          >
            <div class="flex justify-between items-start mb-1">
              <span class="font-medium text-green-800">{{ advantage.dimension }}</span>
              <span class="text-sm text-green-600">{{ advantage.difference }}</span>
            </div>
            <p class="text-sm text-green-700">{{ advantage.description }}</p>
          </div>
        </div>
      </div>

      <!-- Pontos de Atenção -->
      <div class="bg-red-50 rounded-lg p-4 border border-red-200">
        <h4 class="text-lg font-semibold text-red-800 mb-3 flex items-center">
          <span class="mr-2">⚠️</span>
          Pontos de Atenção
        </h4>
        <div v-if="attentionPoints.length === 0" class="text-center py-4">
          <p class="text-green-700 font-medium">✅ Excelente! Nenhum ponto de atenção identificado.</p>
          <p class="text-sm text-green-600 mt-1">Todas as dimensões estão com desempenho satisfatório.</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="concern in attentionPoints"
            :key="concern.name"
            class="bg-white rounded p-3 border border-red-200"
          >
            <div class="flex justify-between items-start mb-1">
              <span class="font-medium text-red-800">{{ concern.name }}</span>
              <span class="text-sm text-red-600">{{ concern.score }}%</span>
            </div>
            <p class="text-sm text-red-700">{{ concern.motivo }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useIEGMStore, type Municipio } from '@/stores/iegmStore'
import Chart from 'chart.js/auto'

const iegmStore = useIEGMStore()

// Refs
const comparisonChart = ref<HTMLCanvasElement>()
const activeTab = ref('top5')
let chart: Chart | null = null

// Computed properties
const currentTabData = computed(() => {
  switch (activeTab.value) {
    case 'top5':
      return top5Data.value
    case 'top10':
      return top10Data.value
    case 'top25':
      return top25Data.value
    default:
      return top5Data.value
  }
})





const comparisonGroups = computed(() => [
  { name: '2022', color: '#10b981', description: 'Ano de referência 2022' },
  { name: '2023', color: '#f59e0b', description: 'Ano de referência 2023' }
])

const dimensions = [
  { key: 'percentualIeduc', name: 'Educação', icon: '🎓' },
  { key: 'percentualIsaude', name: 'Saúde', icon: '🏥' },
  { key: 'percentualIfiscal', name: 'Gestão Fiscal', icon: '💰' },
  { key: 'percentualIamb', name: 'Meio Ambiente', icon: '🌱' },
  { key: 'percentualIcidade', name: 'Cidades', icon: '🏙️' },
  { key: 'percentualIplan', name: 'Planejamento', icon: '📋' },
  { key: 'percentualIgovTi', name: 'Governança TI', icon: '💻' }
]



const comparisonData = computed(() => {
  if (!iegmStore.municipiosData) return []

  // Obter top 25 municípios únicos do ano atual, removendo duplicatas
  const municipiosUnicos = iegmStore.municipiosData
    .filter(m => m.anoRef === iegmStore.filters.ano && m.percentualIegmMunicipio !== null)
    .reduce((acc, municipio) => {
      // Verificar se já existe um município com o mesmo nome
      const existingIndex = acc.findIndex(m => m.municipio === municipio.municipio)
      if (existingIndex === -1) {
        acc.push(municipio)
      }
      return acc
    }, [] as typeof iegmStore.municipiosData)
    .sort((a, b) => (b.percentualIegmMunicipio || 0) - (a.percentualIegmMunicipio || 0))
    .slice(0, 25)

  // Se Betim não está no top 25, incluí-lo na lista
  const betimInTop25 = municipiosUnicos.find(m => m.municipio === iegmStore.filters.municipio)
  if (!betimInTop25 && iegmStore.municipioAtual) {
    // Remover o 25º colocado e adicionar Betim
    municipiosUnicos.pop()
    municipiosUnicos.push(iegmStore.municipioAtual)
  }

  return municipiosUnicos.map((municipio, index) => {
    const isBetim = municipio.municipio === iegmStore.filters.municipio
    const position = index + 1

    let positionIcon = '🥇'
    if (position === 1) positionIcon = '🥇'
    else if (position === 2) positionIcon = '🥈'
    else if (position === 3) positionIcon = '🥉'
    else if (isBetim) positionIcon = '🏆'
    else positionIcon = `${position}º`

    // Função helper para formatar valores evitando NaN
    const formatValue = (value: number | null): string => {
      if (value === null || value === undefined || isNaN(value)) return '0.00'
      return (value * 100).toFixed(2)
    }

    return {
      position: positionIcon,
      municipio: municipio.municipio,
      iegm: formatValue(municipio.percentualIegmMunicipio),
      educacao: formatValue(municipio.percentualIeduc),
      saude: formatValue(municipio.percentualIsaude),
      fiscal: formatValue(municipio.percentualIfiscal),
      ambiente: formatValue(municipio.percentualIamb),
      cidades: formatValue(municipio.percentualIcidade),
      planejamento: formatValue(municipio.percentualIplan),
      govti: formatValue(municipio.percentualIgovTi),
      isBetim,
      ranking: position
    }
  })
})

const top5Data = computed(() => comparisonData.value.slice(0, 5))
const top10Data = computed(() => comparisonData.value.slice(0, 10))
const top25Data = computed(() => comparisonData.value.slice(0, 25))

const betimPosition = computed(() => {
  return iegmStore.rankingMunicipio?.ranking || null
})

const totalMunicipios = computed(() => {
  return iegmStore.rankingMunicipio?.totalMunicipios || 0
})

const competitiveAdvantages = computed(() => {
  // Mapear e calcular diferencial
  const vantagens = iegmStore.pontosFortes.map(p => {
    // Calcular média estadual para a dimensão específica
    const currentYearMunicipios = iegmStore.municipios.filter(m => m.anoRef === iegmStore.filters.ano)

    let media = 0
    switch (p.nome) {
      case 'Educação':
        media = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIeduc || 0), 0) / currentYearMunicipios.length
        break
      case 'Saúde':
        media = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIsaude || 0), 0) / currentYearMunicipios.length
        break
      case 'Gestão Fiscal':
        media = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIfiscal || 0), 0) / currentYearMunicipios.length
        break
      case 'Meio Ambiente':
        media = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIamb || 0), 0) / currentYearMunicipios.length
        break
      case 'Cidades':
        media = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIcidade || 0), 0) / currentYearMunicipios.length
        break
      case 'Planejamento':
        media = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIplan || 0), 0) / currentYearMunicipios.length
        break
      case 'Governança TI':
        media = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIgovTi || 0), 0) / currentYearMunicipios.length
        break
    }

    const diff = p.score - media
    return {
      dimension: p.nome,
      difference: `+${(diff * 100).toFixed(0)}%`,
      diffValue: diff,
      description: `${(p.score * 100).toFixed(1)}% vs ${(media * 100).toFixed(1)}% da média estadual`
    };
  });
  // Ordenar do maior para o menor diferencial
  return vantagens.sort((a, b) => b.diffValue - a.diffValue);
})

const attentionPoints = computed(() => {
  return iegmStore.pontosMelhoria.map(p => ({
    name: p.nome,
    score: (p.score * 100).toFixed(0),
    motivo: p.motivo
  }))
})

const getGroupScore = (groupName: string): string => {
  const ano = parseInt(groupName);
  const municipiosDoAno = iegmStore.municipiosData.filter(m => m.anoRef === ano);
  if (municipiosDoAno.length === 0) return '0.0';

  const totalScore = municipiosDoAno.reduce((sum, m) => sum + (m.percentualIegmMunicipio || 0), 0);
  return ((totalScore / municipiosDoAno.length) * 100).toFixed(1);
};

const getGroupRanking = (groupName: string): string => {
  // Esta função é mais complexa e depende de como o ranking é calculado para grupos.
  // Por enquanto, retorna N/A para grupos que não são o município selecionado.
  if (groupName === iegmStore.filters.municipio) {
    return `${iegmStore.rankingMunicipio?.ranking || 'N/A'}º`;
  }
  return 'N/A';
};

const getGroupDimensionScore = (groupName: string, dimensionKey: string): number => {
  const ano = parseInt(groupName);
  const municipiosDoAno = iegmStore.municipiosData.filter(m => m.anoRef === ano);
  if (municipiosDoAno.length === 0) return 0;

  const dimensionMap: Record<string, keyof Municipio> = {
    'percentualIeduc': 'percentualIeduc',
    'percentualIsaude': 'percentualIsaude',
    'percentualIfiscal': 'percentualIfiscal',
    'percentualIamb': 'percentualIamb',
    'percentualIcidade': 'percentualIcidade',
    'percentualIplan': 'percentualIplan',
    'percentualIgovTi': 'percentualIgovTi'
  };

  const key = dimensionMap[dimensionKey];
  if (!key) return 0;

  const validScores = municipiosDoAno
    .map(item => item[key] as number)
    .filter(score => score !== null && score !== undefined);

  if (validScores.length === 0) return 0;

  const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
  return parseFloat((average * 100).toFixed(1));
};

const createComparisonChart = () => {
  if (!comparisonChart.value || !iegmStore.municipioAtual) return

  const ctx = comparisonChart.value.getContext('2d')
  if (!ctx) return

  // Destruir chart anterior
  if (chart) {
    chart.destroy()
  }

  const labels = dimensions.map(d => d.name)
  const datasets = comparisonGroups.value.map(group => ({
    label: group.name,
    data: dimensions.map(dim => getGroupDimensionScore(group.name, dim.key)),
    borderColor: group.color,
    backgroundColor: group.color + '20',
    borderWidth: 2,
    pointBackgroundColor: group.color,
    pointBorderColor: '#fff',
    pointBorderWidth: 2
  }))

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Score (%)'
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
  if (iegmStore.municipioAtual) {
    createComparisonChart()
  }
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})

// Watchers
watch(() => iegmStore.municipioAtual, () => {
  if (iegmStore.municipioAtual) {
    createComparisonChart()
  }
}, { immediate: true })
</script>
