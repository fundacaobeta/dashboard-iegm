<template>
  <div class="iegm-info bg-white rounded-lg shadow-sm border p-6 mb-6">
    <h3 class="text-xl font-bold text-gray-900 mb-4">Sobre o IEGM</h3>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- O que é o IEGM -->
      <div>
        <h4 class="text-lg font-semibold text-gray-800 mb-3">O que é o IEGM?</h4>
        <p class="text-gray-700 mb-4">
          O Índice de Efetividade da Gestão Municipal (IEGM) é uma ferramenta desenvolvida pelo Tribunal de Contas
          do Estado de Minas Gerais (TCEMG) para avaliar a qualidade da gestão pública municipal em sete dimensões
          fundamentais.
        </p>

        <h5 class="font-medium text-gray-800 mb-2">Objetivos:</h5>
        <ul class="list-disc list-inside text-gray-700 space-y-1 mb-4">
          <li>Avaliar a efetividade da gestão municipal</li>
          <li>Identificar pontos de melhoria</li>
          <li>Promover transparência e controle social</li>
          <li>Orientar políticas públicas</li>
        </ul>
      </div>

      <!-- Dimensões -->
      <div>
        <h4 class="text-lg font-semibold text-gray-800 mb-3">Dimensões Avaliadas</h4>
        <div class="space-y-3">
          <div class="flex items-start">
            <span class="text-lg mr-3">🎓</span>
            <div>
              <h5 class="font-medium text-gray-800">Educação</h5>
              <p class="text-sm text-gray-600">Gestão da educação municipal, infraestrutura escolar, qualidade do ensino</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-lg mr-3">🏥</span>
            <div>
              <h5 class="font-medium text-gray-800">Saúde</h5>
              <p class="text-sm text-gray-600">Atenção básica, infraestrutura de saúde, gestão de recursos</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-lg mr-3">💰</span>
            <div>
              <h5 class="font-medium text-gray-800">Gestão Fiscal</h5>
              <p class="text-sm text-gray-600">Transparência, controle interno, equilíbrio fiscal</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-lg mr-3">🌱</span>
            <div>
              <h5 class="font-medium text-gray-800">Meio Ambiente</h5>
              <p class="text-sm text-gray-600">Saneamento, gestão de resíduos, políticas ambientais</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-lg mr-3">🏙️</span>
            <div>
              <h5 class="font-medium text-gray-800">Cidades</h5>
              <p class="text-sm text-gray-600">Mobilidade urbana, planejamento territorial, infraestrutura</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-lg mr-3">📋</span>
            <div>
              <h5 class="font-medium text-gray-800">Planejamento</h5>
              <p class="text-sm text-gray-600">Plano diretor, gestão estratégica, monitoramento</p>
            </div>
          </div>
          <div class="flex items-start">
            <span class="text-lg mr-3">💻</span>
            <div>
              <h5 class="font-medium text-gray-800">Governança TI</h5>
              <p class="text-sm text-gray-600">Tecnologia da informação, transparência digital, inovação</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Classificações -->
    <div class="mt-6">
      <h4 class="text-lg font-semibold text-gray-800 mb-3">Classificações</h4>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-green-50 rounded-lg p-4 border border-green-200">
          <div class="text-center">
            <span class="text-2xl font-bold text-green-600">A</span>
            <p class="text-sm text-green-700 mt-1">Excelente</p>
            <p class="text-xs text-green-600">80% - 100%</p>
          </div>
        </div>
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div class="text-center">
            <span class="text-2xl font-bold text-blue-600">B+</span>
            <p class="text-sm text-blue-700 mt-1">Muito Boa</p>
            <p class="text-xs text-blue-600">70% - 79%</p>
          </div>
        </div>
        <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div class="text-center">
            <span class="text-2xl font-bold text-yellow-600">B</span>
            <p class="text-sm text-yellow-700 mt-1">Boa</p>
            <p class="text-xs text-yellow-600">60% - 69%</p>
          </div>
        </div>
        <div class="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div class="text-center">
            <span class="text-2xl font-bold text-orange-600">C+</span>
            <p class="text-sm text-orange-700 mt-1">Regular</p>
            <p class="text-xs text-orange-600">50% - 59%</p>
          </div>
        </div>
        <div class="bg-red-50 rounded-lg p-4 border border-red-200">
          <div class="text-center">
            <span class="text-2xl font-bold text-red-600">C</span>
            <p class="text-sm text-red-700 mt-1">Precisa Melhorar</p>
            <p class="text-xs text-red-600">0% - 49%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Metodologia -->
    <div class="mt-6">
      <h4 class="text-lg font-semibold text-gray-800 mb-3">Metodologia</h4>
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-gray-700 mb-3">
          O IEGM utiliza uma metodologia baseada em questionários estruturados aplicados aos gestores municipais,
          complementados por dados oficiais e auditorias. Cada dimensão é avaliada através de múltiplos indicadores
          que consideram:
        </p>
        <ul class="list-disc list-inside text-gray-700 space-y-1">
          <li>Existência de políticas e instrumentos de gestão</li>
          <li>Implementação efetiva das políticas</li>
          <li>Resultados alcançados</li>
          <li>Transparência e controle social</li>
          <li>Inovação e boas práticas</li>
        </ul>
      </div>
    </div>

    <!-- Benefícios -->
    <div class="mt-6">
      <h4 class="text-lg font-semibold text-gray-800 mb-3">Benefícios do IEGM</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h5 class="font-medium text-blue-800 mb-2">Para os Municípios</h5>
          <ul class="text-sm text-blue-700 space-y-1">
            <li>• Diagnóstico da gestão</li>
            <li>• Identificação de melhorias</li>
            <li>• Planejamento estratégico</li>
            <li>• Benchmarking</li>
          </ul>
        </div>
        <div class="bg-green-50 rounded-lg p-4 border border-green-200">
          <h5 class="font-medium text-green-800 mb-2">Para os Cidadãos</h5>
          <ul class="text-sm text-green-700 space-y-1">
            <li>• Transparência</li>
            <li>• Controle social</li>
            <li>• Participação cidadã</li>
            <li>• Melhoria dos serviços</li>
          </ul>
        </div>
        <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h5 class="font-medium text-purple-800 mb-2">Para o Estado</h5>
          <ul class="text-sm text-purple-700 space-y-1">
            <li>• Monitoramento</li>
            <li>• Políticas públicas</li>
            <li>• Desenvolvimento regional</li>
            <li>• Cooperação federativa</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Fonte -->
    <div class="mt-6 pt-4 border-t border-gray-200">
      <p class="text-sm text-gray-500 text-center">
        Fonte: Tribunal de Contas do Estado de Minas Gerais (TCEMG) -
        <a href="https://www.tce.mg.gov.br" target="_blank" class="text-blue-600 hover:underline">
          www.tce.mg.gov.br
        </a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Componente informativo sobre o IEGM
</script>
