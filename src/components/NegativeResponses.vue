<template>
  <div class="negative-responses bg-white rounded-lg shadow-sm border p-6 mb-6">
    <h3 class="text-xl font-bold text-gray-900 mb-4">Análise de Dimensões que Precisam de Melhoria</h3>

    <div v-if="iegmStore.loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Analisando respostas...</p>
    </div>

    <div v-else-if="negativeResponses.length === 0" class="text-center py-8">
      <p class="text-gray-600">Nenhuma dimensão crítica encontrada para Betim.</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Resumo -->
      <div class="bg-red-50 rounded-lg p-4 border border-red-200">
        <h4 class="text-lg font-semibold text-red-800 mb-2">Resumo das Dimensões que Precisam de Melhoria</h4>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="font-medium text-red-700">Total de Dimensões:</span>
            <span class="ml-2 text-red-600">{{ totalQuestions }}</span>
          </div>
          <div>
            <span class="font-medium text-red-700">Dimensões Críticas:</span>
            <span class="ml-2 text-red-600">{{ negativeResponses.length }}</span>
          </div>
          <div>
            <span class="font-medium text-red-700">Taxa de Impacto:</span>
            <span class="ml-2 text-red-600">{{ impactRate }}%</span>
          </div>
          <div>
            <span class="font-medium text-red-700">Pontos Perdidos:</span>
            <span class="ml-2 text-red-600">{{ totalPointsLost }}</span>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-4">
        <select v-model="selectedDimension" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Todas as Dimensões</option>
          <option value="i-Amb">Meio Ambiente</option>
          <option value="i-Cidade">Cidades</option>
          <option value="i-Educ">Educação</option>
          <option value="i-Fiscal">Gestão Fiscal</option>
          <option value="i-Gov TI">Governança TI</option>
          <option value="i-Plan">Planejamento</option>
          <option value="i-Saude">Saúde</option>
        </select>

        <select v-model="selectedScoreRange" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Todas as Pontuações</option>
          <option value="0">Score zero</option>
          <option value="low">Score baixo (&lt; 200)</option>
          <option value="medium">Score médio (200-400)</option>
        </select>
      </div>

      <!-- Lista de Dimensões -->
      <div class="space-y-4">
                <div
          v-for="response in filteredResponses"
          :key="response?.questao_id || Math.random()"
          class="border border-red-200 rounded-lg p-4 hover:bg-red-50 transition-colors"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <h5 class="font-medium text-gray-900 mb-1">{{ response?.questao || 'Dimensão sem título' }}</h5>
              <div class="flex items-center gap-4 text-sm text-gray-600">
                                 <span class="bg-red-100 text-red-800 px-2 py-1 rounded">
                   {{ response?.indicador || 'N/A' }}
                 </span>
                 <span>Dimensão: {{ response?.questao_id || 'N/A' }}</span>
                 <span>Pontuação: {{ response?.nota || '0' }}</span>
              </div>
            </div>
            <div class="text-right">
                             <div class="text-2xl font-bold" :class="getScoreClass(response?.nota)">
                 {{ response?.nota || '0' }}
               </div>
              <div class="text-xs text-gray-500">pontos</div>
            </div>
          </div>

          <div class="mt-3">
            <div class="text-sm text-gray-700">
              <strong>Análise:</strong>
              <span class="ml-1">{{ response?.resposta || 'Sem dados disponíveis' }}</span>
            </div>

            <div class="mt-2 flex gap-2">
              <span
                v-if="!response?.resposta || response?.resposta?.trim() === ''"
                class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs"
              >
                Sem Dados
              </span>
              <span
                v-if="response?.nota && parseFloat(response.nota) === 0"
                class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs"
              >
                Score Zero
              </span>
              <span
                v-if="response?.nota && parseFloat(response.nota) < 200"
                class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs"
              >
                Score Baixo
              </span>
              <span
                v-if="response?.nota && parseFloat(response.nota) >= 200 && parseFloat(response.nota) < 400"
                class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs"
              >
                Score Médio
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recomendações -->
      <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 class="text-lg font-semibold text-blue-800 mb-3">Recomendações para Melhoria das Dimensões</h4>
        <ul class="space-y-2 text-sm text-blue-700">
          <li v-for="(rec, index) in recommendations" :key="index" class="flex items-start">
            <span class="text-blue-600 mr-2">•</span>
            <span>{{ rec }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIEGMStore } from '@/stores/iegmStore'

const iegmStore = useIEGMStore()

// Refs
const selectedDimension = ref('')
const selectedScoreRange = ref('')

// Computed properties
// Define the answer type
interface Answer {
  questao_id: string
  indicador: string
  questao: string
  resposta: string
  nota: string
}

const betimAnswers = computed((): Answer[] => {
  // Criar respostas baseadas nos scores dimensionais
  if (!iegmStore.municipioAtual) {
    console.log('❌ municipioAtual não encontrado')
    return []
  }

  const municipio = iegmStore.municipioAtual
  console.log('🏙️ Dados do município atual:', {
    municipio: municipio.municipio,
    percentualIeduc: municipio.percentualIeduc,
    percentualIsaude: municipio.percentualIsaude,
    percentualIfiscal: municipio.percentualIfiscal,
    percentualIamb: municipio.percentualIamb,
    percentualIcidade: municipio.percentualIcidade,
    percentualIplan: municipio.percentualIplan,
    percentualIgovTi: municipio.percentualIgovTi
  })

  const respostas: Answer[] = []

  // Calcular médias estaduais para comparação
  const currentYearMunicipios = iegmStore.municipios.filter(m => m.anoRef === iegmStore.filters.ano)
  console.log('📊 Total de municípios do ano atual:', currentYearMunicipios.length)

  // Adicionar dimensões com scores baixos ou abaixo da média como respostas negativas
  const dimensoes = [
    { indicador: 'i-Educ', score: municipio.percentualIeduc, nome: 'Educação' },
    { indicador: 'i-Saude', score: municipio.percentualIsaude, nome: 'Saúde' },
    { indicador: 'i-Fiscal', score: municipio.percentualIfiscal, nome: 'Gestão Fiscal' },
    { indicador: 'i-Amb', score: municipio.percentualIamb, nome: 'Meio Ambiente' },
    { indicador: 'i-Cidade', score: municipio.percentualIcidade, nome: 'Cidades' },
    { indicador: 'i-Plan', score: municipio.percentualIplan, nome: 'Planejamento' },
    { indicador: 'i-Gov TI', score: municipio.percentualIgovTi, nome: 'Governança TI' }
  ]

  dimensoes.forEach(dim => {
    if (dim.score !== null) {
      // Calcular média estadual para esta dimensão
      let mediaEstadual = 0
      switch (dim.indicador) {
        case 'i-Educ':
          mediaEstadual = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIeduc || 0), 0) / currentYearMunicipios.length
          break
        case 'i-Saude':
          mediaEstadual = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIsaude || 0), 0) / currentYearMunicipios.length
          break
        case 'i-Fiscal':
          mediaEstadual = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIfiscal || 0), 0) / currentYearMunicipios.length
          break
        case 'i-Amb':
          mediaEstadual = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIamb || 0), 0) / currentYearMunicipios.length
          break
        case 'i-Cidade':
          mediaEstadual = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIcidade || 0), 0) / currentYearMunicipios.length
          break
        case 'i-Plan':
          mediaEstadual = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIplan || 0), 0) / currentYearMunicipios.length
          break
        case 'i-Gov TI':
          mediaEstadual = currentYearMunicipios.reduce((sum, m) => sum + (m.percentualIgovTi || 0), 0) / currentYearMunicipios.length
          break
      }

      console.log(`📈 ${dim.nome}: Score=${(dim.score * 100).toFixed(1)}%, Média=${(mediaEstadual * 100).toFixed(1)}%`)

      // Adicionar como resposta negativa se:
      // 1. Score < 0.6 (baixo desempenho)
      // 2. Score < média estadual (abaixo da média)
      // 3. Score < 0.4 (crítico)
      if (dim.score < 0.6 || dim.score < mediaEstadual || dim.score < 0.4) {
        const nota = Math.round(dim.score * 1000) // Converter para escala de 1000
        const diferenca = ((mediaEstadual - dim.score) / mediaEstadual) * 100

        console.log(`⚠️ Adicionando resposta negativa para ${dim.nome}: Score=${(dim.score * 100).toFixed(1)}%, Nota=${nota}`)

        respostas.push({
          questao_id: `DIM_${dim.indicador}`,
          indicador: dim.indicador,
          questao: `Melhoria em ${dim.nome}`,
          resposta: `Score atual: ${(dim.score * 100).toFixed(1)}% (média estadual: ${(mediaEstadual * 100).toFixed(1)}%)`,
          nota: nota.toString()
        })
      }
    }
  })

  console.log(`📋 Total de respostas negativas geradas: ${respostas.length}`)
  return respostas
})

const negativeResponses = computed(() => {
  const answers = betimAnswers.value
  if (!Array.isArray(answers) || answers.length === 0) return []

  return answers.filter(answer => {
    if (!answer || typeof answer !== 'object') return false
    const score = answer.nota ? parseFloat(answer.nota) : 0
    // Incluir respostas com score baixo (< 600 em escala de 1000) ou questões sem resposta
    return score < 600 || !answer.resposta || answer.resposta.trim() === ''
  })
})

const totalQuestions = computed(() => {
  const answers = betimAnswers.value
  return Array.isArray(answers) ? answers.length : 0
})

const impactRate = computed(() => {
  const total = totalQuestions.value
  if (total === 0) return 0
  return ((negativeResponses.value.length / total) * 100).toFixed(1)
})

const totalPointsLost = computed(() => {
  const responses = negativeResponses.value
  if (!Array.isArray(responses) || responses.length === 0) return 0

  return responses.reduce((total, response) => {
    if (!response || typeof response !== 'object') return total
    const maxScore = 1000 // Pontuação máxima por questão
    const actualScore = response.nota ? parseFloat(response.nota) : 0
    return total + (maxScore - actualScore)
  }, 0)
})

const filteredResponses = computed(() => {
  let filtered = negativeResponses.value
  if (!Array.isArray(filtered)) return []

  if (selectedDimension.value) {
    filtered = filtered.filter(response => {
      if (!response || typeof response !== 'object') return false
      return response.indicador === selectedDimension.value
    })
  }

  if (selectedScoreRange.value) {
    filtered = filtered.filter(response => {
      if (!response || typeof response !== 'object') return false
      const score = response.nota ? parseFloat(response.nota) : 0
      switch (selectedScoreRange.value) {
        case '0':
          return score === 0
        case 'low':
          return score > 0 && score < 400
        case 'medium':
          return score >= 400 && score <= 600
        default:
          return true
      }
    })
  }

  return filtered.sort((a, b) => {
    if (!a || !b) return 0
    const scoreA = a.nota ? parseFloat(a.nota) : 0
    const scoreB = b.nota ? parseFloat(b.nota) : 0
    return scoreA - scoreB
  })
})

const recommendations = computed(() => {
  const recs = []
  const responses = negativeResponses.value

  if (!Array.isArray(responses) || responses.length === 0) {
    recs.push('Nenhuma dimensão crítica encontrada para Betim.')
    return recs
  }

  const noDataCount = responses.filter(r => r && typeof r === 'object' && (!r.resposta || r.resposta.trim() === '')).length
  const zeroScoreCount = responses.filter(r => r && typeof r === 'object' && r.nota && parseFloat(r.nota) === 0).length
  const lowScoreCount = responses.filter(r => r && typeof r === 'object' && r.nota && parseFloat(r.nota) > 0 && parseFloat(r.nota) < 400).length

  if (noDataCount > 0) {
    recs.push(`Implementar coleta de dados para ${noDataCount} dimensão(ões) sem informações`)
  }

  if (zeroScoreCount > 0) {
    recs.push(`Revisar ${zeroScoreCount} dimensão(ões) com score zero`)
  }

  if (lowScoreCount > 0) {
    recs.push(`Melhorar ${lowScoreCount} dimensão(ões) com score baixo`)
  }

  recs.push('Implementar políticas específicas para as dimensões mais afetadas')
  recs.push('Capacitar equipes para melhor compreensão dos critérios de avaliação')
  recs.push('Estabelecer monitoramento contínuo das dimensões críticas')

  return recs
})

// Methods
const getScoreClass = (score: string | undefined) => {
  if (!score) return 'text-red-600'
  const numScore = parseFloat(score)
  if (numScore === 0) return 'text-red-600'
  if (numScore < 200) return 'text-orange-600'
  if (numScore < 400) return 'text-yellow-600'
  return 'text-green-600'
}
</script>
