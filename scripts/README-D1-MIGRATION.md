# Migração para Cloudflare D1

Este diretório contém scripts para migrar dados do banco local SQLite para o Cloudflare D1.

## 📋 Pré-requisitos

1. **Cloudflare D1 Database criado**
   - Database ID: `dcb723ba-b7ee-4851-8fb4-6fe106279b01`
   - Nome: `dataset-iegm`

2. **Wrangler CLI instalado e configurado**
   ```bash
   npm install -g wrangler
   wrangler login
   ```

3. **Dados locais disponíveis**
   - Banco `local.db` com dados migrados
   - Execute: `yarn data:migrate` se necessário

## 🚀 Migração Completa

Para migrar tudo de uma vez (recomendado):

```bash
yarn cf:db:migrate-complete
```

Este comando irá:
1. Criar todas as tabelas no D1
2. Migrar todos os dados do banco local
3. Gerar respostas detalhadas baseadas nos resultados

## 🔧 Migração Manual

### 1. Criar Tabelas

```bash
wrangler d1 execute dataset-iegm --file=scripts/create-d1-tables.sql --local=false
```

### 2. Migrar Dados

```bash
yarn cf:db:migrate-data
```

## 📊 Tabelas Migradas

### Tabelas de Referência
- `tribunais` - Tribunais de Contas
- `municipios` - Municípios brasileiros
- `indicadores` - Indicadores IEGM

### Tabelas de Questionários
- `questionarios` - Questionários por ano/indicador
- `questoes` - Questões dos questionários

### Tabelas de Respostas
- `questionario_respostas` - Respostas por município
- `respostas` - Respostas individuais
- `respostas_detalhadas` - Respostas detalhadas geradas

### Tabelas de Resultados
- `resultados_indicadores` - Resultados por indicador
- `resultados_municipios` - Resultados consolidados por município
- `resultados_estados` - Resultados consolidados por estado

## 🔍 Verificar Migração

### Studio do D1
```bash
wrangler d1 studio dataset-iegm
```

### Consultas de Teste
```bash
# Listar tribunais
wrangler d1 execute dataset-iegm --command="SELECT * FROM tribunais LIMIT 5;"

# Listar municípios
wrangler d1 execute dataset-iegm --command="SELECT * FROM municipios LIMIT 5;"

# Verificar respostas detalhadas
wrangler d1 execute dataset-iegm --command="SELECT * FROM respostas_detalhadas WHERE municipio = 'BETIM' LIMIT 5;"
```

## 🛠️ Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| `create-d1-tables.sql` | - | SQL para criar tabelas |
| `migrate-to-d1.ts` | `yarn cf:db:migrate-data` | Migra dados para D1 |
| `migrate-d1-complete.ts` | `yarn cf:db:migrate-complete` | Migração completa |

## 📈 Estatísticas Esperadas

Após a migração bem-sucedida, você deve ver:

```
📈 Estatísticas da migração:
  - Tribunais: 1
  - Municípios: 853
  - Indicadores: 7
  - Questionários: 7
  - Questões: 7
  - Respostas de Questionários: 853
  - Respostas: 5971
  - Resultados de Indicadores: 5971
  - Resultados de Municípios: 853
  - Resultados de Estados: 1
  - Respostas Detalhadas: 5971
  - Total de registros migrados: 14,456
```

## 🔧 Solução de Problemas

### Erro: "Database not found"
```bash
# Verificar se o database existe
wrangler d1 list

# Se não existir, criar
wrangler d1 create dataset-iegm
```

### Erro: "Permission denied"
```bash
# Fazer login no Cloudflare
wrangler login

# Verificar permissões
wrangler whoami
```

### Erro: "Table already exists"
- O script ignora tabelas existentes
- Para recriar, primeiro delete as tabelas no D1 Studio

### Erro: "CSV import failed"
- Verificar se o arquivo CSV foi criado corretamente
- Verificar se o D1 tem espaço suficiente
- Verificar se a estrutura da tabela está correta

## 🎯 Próximos Passos

1. **Verificar dados migrados**
   ```bash
   wrangler d1 studio dataset-iegm
   ```

2. **Fazer deploy do worker**
   ```bash
   yarn cf:deploy
   ```

3. **Testar API**
   ```bash
   curl https://seu-worker.workers.dev/api/municipios?municipio=BETIM&ano=2023
   ```

4. **Atualizar configurações**
   - Verificar se o `wrangler.toml` está correto
   - Atualizar variáveis de ambiente se necessário

## 📝 Notas Importantes

- **Backup**: Sempre faça backup antes de migrar
- **Teste**: Teste em ambiente de desenvolvimento primeiro
- **Monitoramento**: Monitore o uso do D1 após a migração
- **Limpeza**: Os arquivos CSV temporários são removidos automaticamente

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do Wrangler
2. Consulte a documentação do Cloudflare D1
3. Verifique se todos os pré-requisitos estão atendidos
4. Teste com um dataset menor primeiro 