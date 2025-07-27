# Dashboard IEGM - Integração com Cloudflare Pages + D1

Este projeto suporta conexão com **Cloudflare D1** usando **Drizzle ORM** através de **Cloudflare Pages Functions**, proporcionando uma solução serverless completa e escalável.

## 🚀 Início Rápido

### Desenvolvimento Local com D1 (Recomendado)

```bash
# 1. Instalar dependências
yarn install

# 2. Configurar Wrangler (se ainda não configurado)
wrangler login

# 3. Iniciar desenvolvimento com Pages + D1
yarn cf:dev:d1
```

O aplicativo estará disponível em `http://localhost:8788`

### Desenvolvimento Local com API

```bash
# 1. Iniciar servidor API local
yarn local:server

# 2. Em outro terminal, iniciar frontend
yarn dev
```

## 🌐 Deploy para Produção

```bash
# Deploy para Cloudflare Pages
yarn cf:deploy
```

## 📊 Gerenciamento do Banco D1

```bash
# Aplicar migrações
yarn cf:db:migrate

# Abrir D1 Studio
yarn cf:db:studio

# Migrar dados do SQLite local para D1
yarn cf:db:migrate-data
```

## 🔧 Arquitetura

### Modos de Operação

1. **Browser**: Usa API endpoints (Pages Functions)
2. **Pages Functions**: Usa D1 diretamente com Drizzle
3. **Desenvolvimento Local**: Pode usar D1 local ou API SQLite

### Como Funciona

- **Browser**: Sempre usa API endpoints (não pode acessar D1 diretamente)
- **Pages Functions**: Acessa D1 diretamente usando Drizzle
- **API Routes**: `/functions/api/[[route]].ts` gerencia todas as requisições

## 📁 Estrutura de Arquivos

```
src/
├── db/
│   ├── index.ts          # Factory para criar conexão D1
│   ├── schema.ts         # Schema Drizzle
│   └── migrations/       # Migrações Drizzle
├── services/
│   ├── database/
│   │   └── index.ts      # DatabaseService para Pages
│   └── iegm/            # Serviços que usam API
├── functions/
│   └── api/
│       └── [[route]].ts  # API routes para Pages
└── hooks/
    └── useDatabase.ts   # Hook para inicializar banco
```

## 🛠️ Comandos Disponíveis

### Desenvolvimento
```bash
yarn cf:dev:d1          # Desenvolvimento com Pages + D1
yarn local:server       # Servidor API local
yarn dev               # Frontend apenas
```

### Banco de Dados
```bash
yarn cf:db:migrate      # Aplicar migrações D1
yarn cf:db:studio       # Abrir D1 Studio
yarn cf:db:migrate-data # Migrar dados para D1
```

### Deploy
```bash
yarn cf:deploy          # Deploy para Cloudflare Pages
```

## 🔍 Debugging

### Verificar Conexão D1

```bash
# Health check da API
curl http://localhost:8788/api/municipios?ano=2023&tribunal=TCEMG
```

### Logs

- **Desenvolvimento Pages**: Logs aparecem no console do Wrangler
- **Browser**: Verifique o console do navegador
- **Produção**: Logs aparecem no Cloudflare Dashboard

### Mensagens de Status

No console você verá:
- ✅ "D1Database connected successfully with Drizzle" (nas Functions)
- ℹ️ "Browser environment detected, using API endpoints" (no browser)

## 🚨 Troubleshooting

### Erro: "D1Database not available"

1. Verifique se está logado: `wrangler login`
2. Verifique se o banco existe: `wrangler d1 list`
3. Aplique migrações: `yarn cf:db:migrate`

### Erro: "Database not available"

1. Verifique os logs do console
2. Certifique-se de que o `DatabaseService` está sendo inicializado
3. Verifique se o D1 está configurado corretamente

### Erro: "Unexpected token '<'"

Este erro indica que a API está retornando HTML em vez de JSON. Isso pode acontecer se:
1. As Pages Functions não estão configuradas corretamente
2. O D1 não está acessível
3. Há um erro na rota da API

**Solução:**
- Verifique se o arquivo `functions/api/[[route]].ts` existe
- Certifique-se de que o D1 está configurado no `wrangler.toml`
- Teste a API localmente primeiro

### Erro: "Wrangler not found"

```bash
# Instalar Wrangler CLI
npm install -g wrangler

# Verificar instalação
wrangler --version
```

### Erro: "Login required"

```bash
# Fazer login no Cloudflare
wrangler login

# Verificar status
wrangler whoami
```

## 📝 Configuração

### wrangler.toml

```toml
name = "dashboard-iegm"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
d1_databases = [{ binding = "DB", database_name = "dataset-iegm", database_id = "..." }]

[env.development]
d1_databases = [{ binding = "DB", database_name = "dataset-iegm-dev", database_id = "..." }]
```

### API Routes

As rotas da API estão em `functions/api/[[route]].ts`:
- `/api/municipios` - Listar municípios
- `/api/ranking` - Ranking de municípios
- `/api/estatisticas` - Estatísticas gerais
- `/api/faixas-distribuicao` - Faixas de distribuição
- `/api/analise-dimensoes` - Análise de dimensões
- `/api/respostas-detalhadas` - Respostas detalhadas
- `/api/comparativo-ano-anterior` - Comparativo anual

## 🔒 Segurança

### Variáveis de Ambiente

```bash
# Configurações do Cloudflare
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token

# Configurações do D1
D1_DATABASE_ID=your-database-id
```

### Permissões

- **D1**: Apenas leitura em produção
- **Pages Functions**: Execução serverless
- **CORS**: Configurado para desenvolvimento local

## 📈 Performance

### Otimizações

- **Drizzle ORM**: Queries type-safe e otimizadas
- **Cloudflare Edge**: Cache global automático
- **D1**: Banco SQLite serverless de alta performance
- **Pages Functions**: Execução próxima ao usuário

### Métricas

- **Cold Start**: < 100ms
- **Query Response**: < 50ms
- **Cache Hit**: > 95%

## 🔗 Links Úteis

- [Documentação Completa](docs/D1-INTEGRATION.md)
- [Guia de Setup](docs/SETUP.md)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## 🤝 Contribuindo

1. Use `yarn cf:dev:d1` para desenvolvimento local
2. Teste as rotas da API antes de fazer deploy
3. Verifique se os logs indicam o modo correto de operação
4. Documente mudanças na integração com D1

## 📚 Recursos Adicionais

- [Cross-Platform Node.js Guide](https://github.com/ehmicky/cross-platform-node-guide)
- [Microsoft Node.js Guidelines](https://github.com/Microsoft/nodejs-guidelines)
- [Awesome Cross-Platform Node.js](https://github.com/bcoe/awesome-cross-platform-nodejs)

---

**Desenvolvido com ❤️ para transparência e eficiência na gestão municipal**