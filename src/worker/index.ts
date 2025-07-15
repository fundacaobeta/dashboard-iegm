import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { createDatabaseService } from '../services/database';
import { useIEGMStore } from '../stores/iegmStore';

// Interface para o ambiente Cloudflare
interface Env {
  DB: D1Database;
}

// Função para criar conexão D1 com Drizzle
function createD1Connection(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Função para inicializar o store com D1
async function initializeStoreWithD1(d1: D1Database) {
  try {
    // Criar serviço de banco com D1
    const dbService = createDatabaseService(d1);

    // Inicializar o store global
    const store = useIEGMStore();
    await store.initialize(d1);

    console.log('Store initialized with D1 database');
    return true;
  } catch (error) {
    console.error('Error initializing store with D1:', error);
    return false;
  }
}

// Handler para requisições
async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar conexão D1
    const db = createD1Connection(env.DB);

    // Rotas da API
    if (path.startsWith('/api/')) {
      return await handleApiRequest(request, db, path);
    }

    // Rota para inicializar o store (para uso interno)
    if (path === '/init-d1') {
      const success = await initializeStoreWithD1(env.DB);
      return new Response(JSON.stringify({ success }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Rota de health check
    if (path === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        d1Available: !!env.DB
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Rota padrão - retornar informações sobre o worker
    return new Response(JSON.stringify({
      message: 'IEGM Dashboard Worker',
      version: '1.0.0',
      endpoints: [
        '/health - Health check',
        '/init-d1 - Initialize store with D1',
        '/api/* - API endpoints'
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Worker error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Handler para requisições da API
async function handleApiRequest(request: Request, db: any, path: string): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Exemplo de rota da API - você pode expandir conforme necessário
    if (path === '/api/municipios') {
      const url = new URL(request.url);
      const ano = url.searchParams.get('ano');
      const tribunal = url.searchParams.get('tribunal');

      if (!ano || !tribunal) {
        return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Aqui você pode implementar a lógica de consulta usando Drizzle
      // Por exemplo:
      // const municipios = await db.select().from(schema.resultadosMunicipios)...

      return new Response(JSON.stringify({
        message: 'API endpoint working with D1',
        params: { ano, tribunal }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Rota não encontrada
    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({
      error: 'API error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Exportar o handler para Cloudflare Workers
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return handleRequest(request, env);
  }
};
