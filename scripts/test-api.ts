#!/usr/bin/env tsx

import { execSync } from 'child_process';

console.log('🧪 Testando API do Cloudflare Pages...\n');

const baseUrl = 'http://localhost:8788';

async function testEndpoint(endpoint: string, description: string) {
  try {
    console.log(`📡 Testando ${description}...`);
    const response = await fetch(`${baseUrl}${endpoint}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${description} - Status: ${response.status}`);
      console.log(`   Dados recebidos: ${Array.isArray(data) ? data.length : 'object'}`);
    } else {
      console.log(`❌ ${description} - Status: ${response.status}`);
      const text = await response.text();
      console.log(`   Erro: ${text.substring(0, 100)}...`);
    }
  } catch (error) {
    console.log(`❌ ${description} - Erro: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  console.log('');
}

async function runTests() {
  console.log('🚀 Iniciando testes da API...\n');

  // Testar endpoints básicos
  await testEndpoint('/api/municipios?ano=2023&tribunal=TCEMG', 'Listar Municípios');
  await testEndpoint('/api/ranking?ano=2023', 'Ranking de Municípios');
  await testEndpoint('/api/estatisticas?ano=2023&tribunal=TCEMG', 'Estatísticas Gerais');
  await testEndpoint('/api/faixas-distribuicao?ano=2023', 'Faixas de Distribuição');

  console.log('✅ Testes concluídos!');
}

runTests().catch(console.error);
