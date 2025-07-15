<template>
  <div class="iegm-accordion">
    <div class="card p-6 mb-6">
      <h2 class="text-2xl font-bold text-primary mb-6">Sobre o IEGM</h2>

      <!-- O que é o IEGM -->
      <div class="accordion-item mb-4">
        <button
          @click="toggleSection('what')"
          class="accordion-header w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <h3 class="text-lg font-semibold text-primary">O que é o IEGM?</h3>
          <svg
            :class="['w-5 h-5 transform transition-transform', { 'rotate-180': openSections.what }]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div v-show="openSections.what" class="accordion-content p-4 bg-white border-t border-gray-200">
          <p class="text-gray-700 mb-4">
            O <strong>Índice de Efetividade da Gestão Municipal (IEGM)</strong> é uma ferramenta desenvolvida pelo
            Tribunal de Contas do Estado de Minas Gerais (TCEMG) para avaliar a qualidade da gestão pública municipal.
          </p>
          <p class="text-gray-700 mb-4">
            O índice é composto por <strong>7 dimensões</strong> que avaliam diferentes aspectos da gestão municipal:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Educação (i-Educ):</strong> Avalia a gestão da educação municipal</li>
            <li><strong>Saúde (i-Saúde):</strong> Analisa a gestão da saúde pública</li>
            <li><strong>Gestão Fiscal (i-Fiscal):</strong> Verifica a transparência e responsabilidade fiscal</li>
            <li><strong>Meio Ambiente (i-Amb):</strong> Avalia as políticas ambientais</li>
            <li><strong>Cidades (i-Cidade):</strong> Analisa o planejamento urbano e infraestrutura</li>
            <li><strong>Planejamento (i-Plan):</strong> Verifica o planejamento estratégico</li>
            <li><strong>Governança de TI (i-GovTI):</strong> Avalia a gestão de tecnologia da informação</li>
          </ul>
        </div>
      </div>

      <!-- Metodologia -->
      <div class="accordion-item mb-4">
        <button
          @click="toggleSection('methodology')"
          class="accordion-header w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <h3 class="text-lg font-semibold text-primary">Metodologia</h3>
          <svg
            :class="['w-5 h-5 transform transition-transform', { 'rotate-180': openSections.methodology }]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div v-show="openSections.methodology" class="accordion-content p-4 bg-white border-t border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-semibold text-gray-800 mb-3">Como é calculado?</h4>
              <ul class="list-disc list-inside text-gray-700 space-y-2">
                <li>Cada dimensão possui indicadores específicos</li>
                <li>Os indicadores são pontuados de 0 a 1000</li>
                <li>A nota é convertida para percentual (0 a 1)</li>
                <li>O IEGM é a média ponderada das 7 dimensões</li>
                <li>Classificação: A (0,8-1,0), B+ (0,6-0,8), B (0,4-0,6), C+ (0,2-0,4), C (0-0,2)</li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-gray-800 mb-3">Fonte dos Dados</h4>
              <ul class="list-disc list-inside text-gray-700 space-y-2">
                <li>Questionários enviados aos municípios</li>
                <li>Documentos oficiais e relatórios</li>
                <li>Dados do IBGE e outras fontes oficiais</li>
                <li>Auditorias e fiscalizações do TCEMG</li>
                <li>Informações disponibilizadas pelos próprios municípios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Dimensões Detalhadas -->
      <div class="accordion-item mb-4">
        <button
          @click="toggleSection('dimensions')"
          class="accordion-header w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <h3 class="text-lg font-semibold text-primary">Dimensões Detalhadas</h3>
          <svg
            :class="['w-5 h-5 transform transition-transform', { 'rotate-180': openSections.dimensions }]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div v-show="openSections.dimensions" class="accordion-content p-4 bg-white border-t border-gray-200">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="dimension in dimensions" :key="dimension.code" class="dimension-card p-4 border border-gray-200 rounded-lg">
              <div class="flex items-center mb-3">
                <div :class="['w-3 h-3 rounded-full mr-3', dimension.color]"></div>
                <h4 class="font-semibold text-gray-800">{{ dimension.name }}</h4>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{ dimension.description }}</p>
              <div class="text-xs text-gray-500">
                <strong>Principais indicadores:</strong> {{ dimension.indicators }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Classificações -->
      <div class="accordion-item mb-4">
        <button
          @click="toggleSection('classifications')"
          class="accordion-header w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <h3 class="text-lg font-semibold text-primary">Classificações</h3>
          <svg
            :class="['w-5 h-5 transform transition-transform', { 'rotate-180': openSections.classifications }]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div v-show="openSections.classifications" class="accordion-content p-4 bg-white border-t border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div v-for="classification in classifications" :key="classification.grade"
                 class="classification-card p-4 rounded-lg text-center">
              <div :class="['w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl', classification.bgColor]">
                {{ classification.grade }}
              </div>
              <h4 class="font-semibold text-gray-800 mb-1">{{ classification.name }}</h4>
              <p class="text-sm text-gray-600">{{ classification.range }}</p>
              <p class="text-xs text-gray-500 mt-2">{{ classification.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Benefícios -->
      <div class="accordion-item mb-4">
        <button
          @click="toggleSection('benefits')"
          class="accordion-header w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <h3 class="text-lg font-semibold text-primary">Benefícios do IEGM</h3>
          <svg
            :class="['w-5 h-5 transform transition-transform', { 'rotate-180': openSections.benefits }]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div v-show="openSections.benefits" class="accordion-content p-4 bg-white border-t border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-semibold text-gray-800 mb-3">Para os Municípios</h4>
              <ul class="list-disc list-inside text-gray-700 space-y-2">
                <li>Identificação de pontos fortes e fracos</li>
                <li>Orientação para melhorias na gestão</li>
                <li>Transparência e prestação de contas</li>
                <li>Comparação com outros municípios</li>
                <li>Base para planejamento estratégico</li>
              </ul>
            </div>
            <div>
              <h4 class="font-semibold text-gray-800 mb-3">Para a Sociedade</h4>
              <ul class="list-disc list-inside text-gray-700 space-y-2">
                <li>Controle social da gestão pública</li>
                <li>Informação sobre qualidade dos serviços</li>
                <li>Participação cidadã mais qualificada</li>
                <li>Fortalecimento da democracia</li>
                <li>Melhoria da qualidade de vida</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

defineOptions({
  name: 'IEGMAccordion'
})

const openSections = reactive({
  what: false,
  methodology: false,
  dimensions: false,
  classifications: false,
  benefits: false
})

const toggleSection = (section: keyof typeof openSections) => {
  openSections[section] = !openSections[section]
}

const dimensions = [
  {
    code: 'i-educ',
    name: 'Educação (i-Educ)',
    description: 'Avalia a gestão da educação municipal, incluindo infraestrutura, qualidade do ensino e gestão escolar.',
    color: 'bg-green-500',
    indicators: 'Infraestrutura escolar, qualidade do ensino, gestão pedagógica'
  },
  {
    code: 'i-saude',
    name: 'Saúde (i-Saúde)',
    description: 'Analisa a gestão da saúde pública, atendimento à população e qualidade dos serviços de saúde.',
    color: 'bg-red-500',
    indicators: 'Atenção básica, especializada, gestão de recursos'
  },
  {
    code: 'i-fiscal',
    name: 'Gestão Fiscal (i-Fiscal)',
    description: 'Verifica a transparência, responsabilidade fiscal e controle dos recursos públicos.',
    color: 'bg-blue-500',
    indicators: 'Transparência, controle interno, responsabilidade fiscal'
  },
  {
    code: 'i-amb',
    name: 'Meio Ambiente (i-Amb)',
    description: 'Avalia as políticas ambientais, gestão de resíduos e sustentabilidade municipal.',
    color: 'bg-green-600',
    indicators: 'Gestão de resíduos, políticas ambientais, sustentabilidade'
  },
  {
    code: 'i-cidade',
    name: 'Cidades (i-Cidade)',
    description: 'Analisa o planejamento urbano, infraestrutura e qualidade de vida nas cidades.',
    color: 'bg-purple-500',
    indicators: 'Planejamento urbano, infraestrutura, mobilidade'
  },
  {
    code: 'i-plan',
    name: 'Planejamento (i-Plan)',
    description: 'Verifica o planejamento estratégico, gestão de projetos e desenvolvimento municipal.',
    color: 'bg-yellow-500',
    indicators: 'Planejamento estratégico, gestão de projetos, desenvolvimento'
  },
  {
    code: 'i-govti',
    name: 'Governança de TI (i-GovTI)',
    description: 'Avalia a gestão de tecnologia da informação, transparência digital e inovação.',
    color: 'bg-indigo-500',
    indicators: 'Tecnologia da informação, transparência digital, inovação'
  }
]

const classifications = [
  {
    grade: 'A',
    name: 'Excelente',
    range: '0,8 - 1,0',
    description: 'Gestão de excelência com práticas exemplares',
    bgColor: 'bg-green-600'
  },
  {
    grade: 'B+',
    name: 'Muito Boa',
    range: '0,6 - 0,8',
    description: 'Gestão muito boa com poucos pontos de melhoria',
    bgColor: 'bg-blue-600'
  },
  {
    grade: 'B',
    name: 'Boa',
    range: '0,4 - 0,6',
    description: 'Gestão boa com oportunidades de melhoria',
    bgColor: 'bg-indigo-600'
  },
  {
    grade: 'C+',
    name: 'Regular',
    range: '0,2 - 0,4',
    description: 'Gestão regular que precisa de melhorias',
    bgColor: 'bg-yellow-600'
  },
  {
    grade: 'C',
    name: 'Precisa Melhorar',
    range: '0,0 - 0,2',
    description: 'Gestão que precisa de melhorias significativas',
    bgColor: 'bg-red-600'
  }
]
</script>

<style scoped>
.accordion-content {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dimension-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease-in-out;
}

.classification-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-in-out;
}
</style>
