<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-semibold mb-4">Downloads dos Datasets</h3>
    <ul v-if="datasets.length > 0">
      <li v-for="dataset in datasets" :key="dataset.path" class="mb-2">
        <a :href="dataset.path" download class="text-blue-600 hover:underline">
          {{ dataset.name }}
        </a>
      </li>
    </ul>
    <p v-else class="text-gray-500">Nenhum dataset disponível para download.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Dataset {
  name: string;
  path: string;
}

const datasets = ref<Dataset[]>([]);

// Esta função simula a descoberta de arquivos. Em um cenário real, 
// isso poderia vir de um manifesto gerado no build ou de uma API.
const discoverDatasets = () => {
  const files = [
    // 2022
    '2022/MG/IEGM/geral_iegm_2022_TCEMG_municipio.csv',
    '2022/MG/IEGM/calculo_iegm_2022_TCEMG_completo.csv',
    // 2023
    '2023/MG/IEGM/geral_iegm_2023_TCEMG_municipio.csv',
    '2023/MG/IEGM/calculo_iegm_2023_TCEMG_completo.csv',
  ];

  datasets.value = files.map(file => ({
    name: file.split('/').pop() || file,
    path: `/dataset/${file}`
  }));
};

onMounted(() => {
  discoverDatasets();
});
</script>
