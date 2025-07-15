import { drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { createDB } from '../db';
import { municipios, resultadosIndicadores, resultadosMunicipios } from '../db/schema';

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      const db = createDB(env.DB);

      if (!db) {
        return new Response('Database not available', { status: 500 });
      }

      // Rota para listar municípios
      if (path === '/api/municipios') {
        const result = await db
          .select()
          .from(municipios)
          .limit(10);

        return Response.json(result);
      }

            // Rota para estatísticas gerais
      if (path === '/api/stats') {
        const result = await db
          .select({
            totalMunicipios: sql`COUNT(*)`.as('total'),
            mediaIegm: sql`AVG(percentual_iegm_municipio)`.as('media')
          })
          .from(resultadosMunicipios);

        return Response.json(result[0] || { totalMunicipios: 0, mediaIegm: 0 });
      }

      // Rota para cálculos de índices
      if (path === '/api/calculos') {
        const result = await db
          .select()
          .from(resultadosIndicadores)
          .limit(10);

        return Response.json(result);
      }

      // Rota para resultados municipais
      if (path === '/api/resultados-municipios') {
        const result = await db
          .select()
          .from(resultadosMunicipios)
          .limit(10);

        return Response.json(result);
      }

      // Rota padrão
      return new Response('IEGM Dashboard API', {
        headers: { 'Content-Type': 'text/plain' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
