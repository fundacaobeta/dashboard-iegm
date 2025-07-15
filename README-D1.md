# Dashboard IEGM - Integração com Cloudflare D1

Este projeto agora suporta conexão direta com Cloudflare D1 usando Drizzle ORM, tanto em produção quanto em desenvolvimento local.

## 🚀 Início Rápido

### Desenvolvimento Local com D1

```bash
# 1. Instalar dependências
yarn install

# 2. Configurar Wrangler (se ainda não configurado)
wrangler login

# 3. Iniciar desenvolvimento com D1
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

1. **Browser**: Usa API endpoints (fallback automático)
2. **Cloudflare Workers**: Usa D1 diretamente com Drizzle
3. **Desenvolvimento Local**: Pode usar D1 local ou API SQLite

### Detecção Automática

O sistema detecta automaticamente o ambiente:

- **Browser**: Sempre usa API (não pode acessar D1 diretamente)
- **Cloudflare Workers**: Usa D1 diretamente
- **Desenvolvimento Local**: Usa D1 local se disponível, senão API

## 📁 Estrutura de Arquivos

```
src/
├── db/
│   ├── index.ts          # Factory para criar conexão D1
│   ├── schema.ts         # Schema Drizzle
│   └── migrations/       # Migrações Drizzle
├── services/
│   ├── database/
│   │   └── index.ts      # DatabaseService com detecção de ambiente
│   └── iegm/            # Serviços que usam D1 ou API
├── worker/
│   └── index.ts         # Worker Cloudflare com D1
└── hooks/
    └── useDatabase.ts   # Hook para inicializar banco
```

## 🛠️ Comandos Disponíveis

### Desenvolvimento
```bash
yarn cf:dev:d1          # Desenvolvimento com D1 local
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
# Health check do worker
curl http://localhost:8788/health
```

### Logs

- **Desenvolvimento D1**: Logs aparecem no console do Wrangler
- **Browser**: Verifique o console do navegador
- **Produção**: Logs aparecem no Cloudflare Dashboard

### Mensagens de Status

No console você verá:
- ✅ "D1Database connected successfully with Drizzle"
- ℹ️ "Browser environment detected, using API endpoints"
- ⚠️ "D1Database not available, using API endpoints"

## 🚨 Troubleshooting

### Erro: "D1Database not available"

1. Verifique se está logado: `wrangler login`
2. Verifique se o banco existe: `wrangler d1 list`
3. Aplique migrações: `yarn cf:db:migrate`

### Erro: "Database not available"

1. Verifique os logs do console
2. Certifique-se de que o `DatabaseService` está sendo inicializado
3. Verifique se o D1 está configurado corretamente

### Performance Lenta

- Use `yarn cf:dev:d1` para desenvolvimento local
- Em produção, a conexão direta com D1 é mais rápida

## 📝 Configuração

### wrangler.toml

```toml
name = "dashboard-iegm"
main = "src/worker/index.ts"

[env.production]
d1_databases = [{ binding = "DB", database_name = "dataset-iegm", database_id = "..." }]

[env.development]
d1_databases = [{ binding = "DB", database_name = "dataset-iegm-dev", database_id = "..." }]
```

### Variáveis de Ambiente

- `DATABASE_URL`: URL do banco local (desenvolvimento)
- `D1_DATABASE_ID`: ID do banco D1 (produção)

## 🔗 Links Úteis

- [Documentação Completa](docs/D1-INTEGRATION.md)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## 🤝 Contribuindo

1. Use `yarn cf:dev:d1` para desenvolvimento local
2. Teste tanto com D1 quanto com API
3. Verifique se os logs indicam o modo correto de operação
4. Documente mudanças na integração com D1 