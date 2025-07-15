# Scripts de Migração

Este diretório contém scripts otimizados para migração de dados, reduzidos de 3 arquivos para apenas 2 arquivos principais.

## Arquivos

### 1. `migrate-local.ts` - Migração para Banco Local
- **Função**: Migra dados dos arquivos CSV para o banco SQLite local
- **Filtro**: Migra todos os dados, exceto respostas detalhadas (filtradas por município)
- **Dados migrados**:
  - Cálculos de índices (todos os municípios - para comparativos)
  - Dados gerais dos municípios (todos os municípios - para comparativos)
  - Dados gerais dos estados (todos)
  - Respostas detalhadas (filtrado por município configurado)

### 2. `migrate-d1.ts` - Migração para Cloudflare D1
- **Função**: Migra dados do banco local para o Cloudflare D1
- **Filtro**: Migra todos os dados, exceto respostas detalhadas (filtradas por município)
- **Dados migrados**:
  - Todas as tabelas de referência (tribunais, indicadores, etc.)
  - Questionários e questões
  - Respostas e questionário respostas (todos - para comparativos)
  - Resultados de indicadores e municípios (todos - para comparativos)
  - Resultados estaduais (todos)
  - Respostas detalhadas (filtrado por município configurado)

## Configuração

O município a ser migrado é configurado em `src/config/municipioConfig.ts`:

```typescript
export const DEFAULT_MUNICIPIO_CONFIG = {
  ano: 2023,
  tribunal: 'TCEMG',
  municipio: 'BETIM'
};
```

## Como Usar

### 1. Migração Local
```bash
# Executar migração para banco local
yarn tsx scripts/migrate-local.ts
```

### 2. Migração D1
```bash
# Executar migração para Cloudflare D1
yarn tsx scripts/migrate-d1.ts
```

## Fluxo Completo

1. **Preparar dados**: Certifique-se de que os arquivos CSV estão na pasta `dataset/`
2. **Migrar para local**: Execute `migrate-local.ts` para criar o banco local
3. **Migrar para D1**: Execute `migrate-d1.ts` para enviar dados para o Cloudflare D1
4. **Verificar**: Use `yarn cf:db:studio` para verificar os dados no D1
5. **Deploy**: Use `yarn cf:deploy` para fazer deploy da aplicação

## Vantagens da Nova Estrutura

- **Menos arquivos**: Reduzido de 3 para 2 arquivos principais
- **Filtro inteligente**: Migra todos os dados para comparativos, exceto respostas detalhadas (filtradas por município)
- **Reutilização de código**: Funções compartilhadas entre os scripts
- **Melhor organização**: Separação clara entre migração local e D1
- **Configuração centralizada**: Município configurado em um só lugar
- **Sistema de comparativos**: Mantém dados de todos os municípios para análises comparativas

## Arquivos Removidos

Os seguintes arquivos foram removidos e suas funcionalidades incorporadas nos novos scripts:
- `migrate-d1-complete.ts`
- `migrate-data.ts` 
- `migrate-to-d1.ts`

## Dependências

- `scripts/create-d1-tables.sql` - Schema das tabelas D1
- `src/config/municipioConfig.ts` - Configuração do município
- `dataset/` - Arquivos CSV com os dados
- `local.db` - Banco SQLite local (criado pelo primeiro script) 