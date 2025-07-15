#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Iniciando desenvolvimento com D1...\n');

// Verificar se o wrangler está instalado
try {
  execSync('wrangler --version', { stdio: 'pipe' });
  console.log('✅ Wrangler CLI encontrado');
} catch (error) {
  console.error('❌ Wrangler CLI não encontrado. Instale com: npm install -g wrangler');
  process.exit(1);
}

// Verificar se o arquivo wrangler.toml existe
const wranglerConfigPath = join(process.cwd(), 'wrangler.toml');
if (!existsSync(wranglerConfigPath)) {
  console.error('❌ Arquivo wrangler.toml não encontrado');
  process.exit(1);
}

console.log('✅ Configuração do Wrangler encontrada');

// Verificar se o banco D1 existe
try {
  console.log('\n📊 Verificando banco D1...');
  execSync('wrangler d1 list', { stdio: 'pipe' });
  console.log('✅ Banco D1 configurado');
} catch (error) {
  console.error('❌ Erro ao verificar banco D1. Certifique-se de estar logado: wrangler login');
  process.exit(1);
}

// Aplicar migrações se necessário
try {
  console.log('\n🔄 Aplicando migrações...');
  execSync('wrangler d1 migrations apply dataset-iegm --local', { stdio: 'inherit' });
  console.log('✅ Migrações aplicadas com sucesso');
} catch (error) {
  console.error('❌ Erro ao aplicar migrações:', error);
  process.exit(1);
}

// Iniciar o servidor de desenvolvimento com D1
console.log('\n🌐 Iniciando servidor de desenvolvimento com D1...');
console.log('📝 O aplicativo estará disponível em: http://localhost:8788');
console.log('🔗 API estará disponível em: http://localhost:8788/api');
console.log('💡 Use Ctrl+C para parar o servidor\n');

try {
  execSync('wrangler dev --local --port 8788', { stdio: 'inherit' });
} catch (error) {
  console.error('\n❌ Erro ao iniciar servidor:', error);
  process.exit(1);
}
