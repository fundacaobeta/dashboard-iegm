# Integração com Cloudflare D1 e Drizzle

Este documento explica como usar a integração direta com Cloudflare D1 usando Drizzle ORM tanto em produção quanto em desenvolvimento local.

## 🏗️ Arquitetura

A aplicação agora suporta três modos de operação:

1. **Modo Browser**: Usa API endpoints (fallback)
2. **Modo Cloudflare Workers**: Usa D1 diretamente com Drizzle
3. **Modo Desenvolvimento Local**: Usa D1 local com Wrangler

## 🚀 Configuração

### Pré-requisitos

1. **Wrangler CLI instalado**:
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. **Banco D1 configurado**:
   ```bash
   yarn cf:db:create
   yarn cf:db:migrate
   ```

### Desenvolvimento Local com D1

Para desenvolver usando D1 localmente:

```bash
# Iniciar servidor de desenvolvimento com D1
yarn cf:dev:d1
```

Este comando irá:
- Verificar se o Wrangler está instalado
- Aplicar migrações locais
- Iniciar o servidor em `http://localhost:8788`
- Disponibilizar a API em `http://localhost:8788/api`

### Desenvolvimento Local com API

Para desenvolver usando a API local (SQLite):

```bash
# Iniciar servidor API local
yarn local:server

# Em outro terminal, iniciar o frontend
yarn dev
```

## 🌐 Produção (Cloudflare Pages)

Em produção, a aplicação automaticamente detecta o ambiente Cloudflare e usa D1 diretamente.

### Deploy

```bash
# Deploy para Cloudflare Pages
yarn cf:deploy
```

### Configuração do Worker

O worker (`src/worker/index.ts`) gerencia:
- Conexão direta com D1 usando Drizzle
- API endpoints para fallback
- Inicialização do store com D1

## 🔧 Como Funciona

### Detecção de Ambiente

O `DatabaseService` detecta automaticamente o ambiente:

```typescript
// Em browser
if (isBrowser) {
  // Usa API endpoints
}

// Em Cloudflare Workers ou desenvolvimento local
if (d1Database || isLocalWrangler) {
  // Usa D1 diretamente com Drizzle
}
```

### Uso nos Serviços

Os serviços verificam se devem usar D1 diretamente:

```typescript
async getMunicipios(query: MunicipioQuery): Promise<Municipio[]> {
  if (!this.db.isDirectD1()) {
    return this.getMunicipiosFromAPI(query);
  }
  
  // Usar Drizzle diretamente
  const db = this.db.getDb();
  // ... consultas Drizzle
}
```

## 📊 Endpoints Disponíveis

### Worker Endpoints

- `/health` - Health check
- `/init-d1` - Inicializar store com D1
- `/api/*` - API endpoints

### API Endpoints

- `/api/municipios` - Listar municípios
- `/api/ranking` - Ranking de municípios
- `/api/estatisticas` - Estatísticas gerais
- `/api/analise` - Análise de município

## 🔍 Debugging

### Verificar Conexão D1

```bash
# Verificar se o D1 está funcionando
curl http://localhost:8788/health
```

### Logs do Worker

Os logs aparecem no console do Wrangler quando usando `yarn cf:dev:d1`.

### Verificar Modo de Operação

No console do browser, você verá mensagens como:
- "D1Database connected successfully with Drizzle"
- "Browser environment detected, using API endpoints"

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento com D1
yarn cf:dev:d1

# Desenvolvimento com API local
yarn local:server
yarn dev

# Deploy para produção
yarn cf:deploy

# Gerenciar banco D1
yarn cf:db:studio
yarn cf:db:migrate

# Migrar dados para D1
yarn cf:db:migrate-data
```

## 🔄 Migração de Dados

Para migrar dados do SQLite local para D1:

```bash
# 1. Preparar dados locais
yarn data:migrate

# 2. Migrar para D1
yarn cf:db:migrate-data
```

## 🚨 Troubleshooting

### Erro: "D1Database not available"

- Verifique se está logado no Wrangler: `wrangler login`
- Verifique se o banco D1 existe: `wrangler d1 list`
- Aplique as migrações: `yarn cf:db:migrate`

### Erro: "Database not available"

- Verifique se o `DatabaseService` está sendo inicializado corretamente
- Verifique os logs do console para mensagens de erro

### Performance Lenta

- Em desenvolvimento local, use `yarn cf:dev:d1` para melhor performance
- Em produção, a conexão direta com D1 é mais rápida que API

## 📝 Notas Importantes

1. **Browser**: Sempre usa API endpoints (não pode acessar D1 diretamente)
2. **Cloudflare Workers**: Usa D1 diretamente com Drizzle
3. **Desenvolvimento Local**: Pode usar D1 local ou API SQLite
4. **Fallback**: Se D1 não estiver disponível, automaticamente usa API

## 🔗 Links Úteis

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/) 