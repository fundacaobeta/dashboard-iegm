import { eq, and, desc, asc, sql, count, avg, min, max, like } from 'drizzle-orm';
import { DatabaseService } from '../database/index';
import { HttpClient } from '../api/httpClient';
import type {
  Municipio,
  MunicipioQuery,
  RankingQuery,
  EstatisticasQuery,
  RankingItem,
  EstatisticasGerais,
  FaixaDistribuicao
} from './types';
import { resultadosMunicipios, municipios as municipiosTable } from '../../db/schema';

export class MunicipioService {
  private db: DatabaseService;
  private httpClient: HttpClient;

  constructor(dbService: DatabaseService) {
    this.db = dbService;
    this.httpClient = new HttpClient(dbService.getApiBaseUrl());
  }

  // ============================================================================
  // CONSULTAS AO BANCO DE DADOS
  // ============================================================================

  async getMunicipios(query: MunicipioQuery): Promise<Municipio[]> {
    if (!this.db.isDirectD1()) {
      return this.getMunicipiosFromAPI(query);
    }

    try {
      const db = this.db.getDb();
      if (!db) throw new Error('Database not available');

      const whereConditions = [];

      if (query.ano) {
        whereConditions.push(eq(resultadosMunicipios.anoRef, query.ano));
      }

      if (query.tribunal) {
        whereConditions.push(eq(resultadosMunicipios.tribunalId, 1)); // TCEMG
      }

      if (query.municipio) {
        whereConditions.push(like(municipiosTable.nome, `%${query.municipio}%`));
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const results = await db
        .select({
          id: resultadosMunicipios.id,
          tribunalId: resultadosMunicipios.tribunalId,
          tribunal: sql<string>`'TCEMG'`,
          municipioId: resultadosMunicipios.municipioId,
          codigoIbge: municipiosTable.codigoIbge,
          municipio: municipiosTable.nome,
          anoRef: resultadosMunicipios.anoRef,
          percentualIamb: resultadosMunicipios.percentualIamb,
          percentualIcidade: resultadosMunicipios.percentualIcidade,
          percentualIeduc: resultadosMunicipios.percentualIeduc,
          percentualIfiscal: resultadosMunicipios.percentualIfiscal,
          percentualIgovTi: resultadosMunicipios.percentualIgovTi,
          percentualIsaude: resultadosMunicipios.percentualIsaude,
          percentualIplan: resultadosMunicipios.percentualIplan,
          percentualIegmMunicipio: resultadosMunicipios.percentualIegmMunicipio,
          faixaIamb: resultadosMunicipios.faixaIamb,
          faixaIcidade: resultadosMunicipios.faixaIcidade,
          faixaIeduc: resultadosMunicipios.faixaIeduc,
          faixaIfiscal: resultadosMunicipios.faixaIfiscal,
          faixaIgovTi: resultadosMunicipios.faixaIgovTi,
          faixaIsaude: resultadosMunicipios.faixaIsaude,
          faixaIplan: resultadosMunicipios.faixaIplan,
          faixaIegmMunicipio: resultadosMunicipios.faixaIegmMunicipio,
        })
        .from(resultadosMunicipios)
        .innerJoin(municipiosTable, eq(resultadosMunicipios.municipioId, municipiosTable.id))
        .where(whereClause)
        .orderBy(desc(resultadosMunicipios.percentualIegmMunicipio))
        .limit(query.limit || 1000)
        .offset(query.offset || 0);

      return results;
    } catch (error) {
      console.error('Error fetching municipios from database:', error);
      return this.getMunicipiosFromAPI(query);
    }
  }

  async getMunicipioByNome(nome: string, ano: number): Promise<Municipio | null> {
    if (!this.db.isDirectD1()) {
      return this.getMunicipioByNomeFromAPI(nome, ano);
    }

    try {
      const db = this.db.getDb();
      if (!db) throw new Error('Database not available');

      const result = await db
        .select({
          id: resultadosMunicipios.id,
          tribunalId: resultadosMunicipios.tribunalId,
          tribunal: sql<string>`'TCEMG'`,
          municipioId: resultadosMunicipios.municipioId,
          codigoIbge: municipiosTable.codigoIbge,
          municipio: municipiosTable.nome,
          anoRef: resultadosMunicipios.anoRef,
          percentualIamb: resultadosMunicipios.percentualIamb,
          percentualIcidade: resultadosMunicipios.percentualIcidade,
          percentualIeduc: resultadosMunicipios.percentualIeduc,
          percentualIfiscal: resultadosMunicipios.percentualIfiscal,
          percentualIgovTi: resultadosMunicipios.percentualIgovTi,
          percentualIsaude: resultadosMunicipios.percentualIsaude,
          percentualIplan: resultadosMunicipios.percentualIplan,
          percentualIegmMunicipio: resultadosMunicipios.percentualIegmMunicipio,
          faixaIamb: resultadosMunicipios.faixaIamb,
          faixaIcidade: resultadosMunicipios.faixaIcidade,
          faixaIeduc: resultadosMunicipios.faixaIeduc,
          faixaIfiscal: resultadosMunicipios.faixaIfiscal,
          faixaIgovTi: resultadosMunicipios.faixaIgovTi,
          faixaIsaude: resultadosMunicipios.faixaIsaude,
          faixaIplan: resultadosMunicipios.faixaIplan,
          faixaIegmMunicipio: resultadosMunicipios.faixaIegmMunicipio,
        })
        .from(resultadosMunicipios)
        .innerJoin(municipiosTable, eq(resultadosMunicipios.municipioId, municipiosTable.id))
        .where(
          and(
            eq(municipiosTable.nome, nome),
            eq(resultadosMunicipios.anoRef, ano)
          )
        )
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Error fetching municipio by name from database:', error);
      return this.getMunicipioByNomeFromAPI(nome, ano);
    }
  }

  async getRanking(query: RankingQuery): Promise<RankingItem[]> {
    if (!this.db.isDirectD1()) {
      return this.getRankingFromAPI(query);
    }

    try {
      const db = this.db.getDb();
      if (!db) throw new Error('Database not available');

      const results = await db
        .select({
          codigoIbge: municipiosTable.codigoIbge,
          municipio: municipiosTable.nome,
          percentualIegmMunicipio: resultadosMunicipios.percentualIegmMunicipio,
          faixaIegmMunicipio: resultadosMunicipios.faixaIegmMunicipio,
        })
        .from(resultadosMunicipios)
        .innerJoin(municipiosTable, eq(resultadosMunicipios.municipioId, municipiosTable.id))
        .where(
          and(
            eq(resultadosMunicipios.anoRef, query.ano),
            eq(resultadosMunicipios.tribunalId, 1) // TCEMG
          )
        )
        .orderBy(desc(resultadosMunicipios.percentualIegmMunicipio))
        .limit(query.limit || 1000)
        .offset(query.offset || 0);

      // Calcular ranking e total de municípios
      const totalMunicipios = await this.getTotalMunicipios(query.ano);

      return results.map((item, index) => ({
        ...item,
        ranking: index + 1 + (query.offset || 0),
        totalMunicipios
      }));
    } catch (error) {
      console.error('Error fetching ranking from database:', error);
      return this.getRankingFromAPI(query);
    }
  }

  async getEstatisticas(query: EstatisticasQuery): Promise<EstatisticasGerais> {
    if (!this.db.isDirectD1()) {
      return this.getEstatisticasFromAPI(query);
    }

    try {
      const db = this.db.getDb();
      if (!db) throw new Error('Database not available');

      const stats = await db
        .select({
          totalMunicipios: count(),
          mediaIegm: avg(resultadosMunicipios.percentualIegmMunicipio),
          minIegm: min(resultadosMunicipios.percentualIegmMunicipio),
          maxIegm: max(resultadosMunicipios.percentualIegmMunicipio),
          mediaIamb: avg(resultadosMunicipios.percentualIamb),
          mediaIcidade: avg(resultadosMunicipios.percentualIcidade),
          mediaIeduc: avg(resultadosMunicipios.percentualIeduc),
          mediaIfiscal: avg(resultadosMunicipios.percentualIfiscal),
          mediaIgovTi: avg(resultadosMunicipios.percentualIgovTi),
          mediaIsaude: avg(resultadosMunicipios.percentualIsaude),
          mediaIplan: avg(resultadosMunicipios.percentualIplan),
        })
        .from(resultadosMunicipios)
        .where(
          and(
            eq(resultadosMunicipios.anoRef, query.ano),
            eq(resultadosMunicipios.tribunalId, 1) // TCEMG
          )
        );

      const result = stats[0];
      return {
        totalMunicipios: Number(result.totalMunicipios) || 0,
        mediaIegm: Number(result.mediaIegm) || 0,
        minIegm: Number(result.minIegm) || 0,
        maxIegm: Number(result.maxIegm) || 0,
        mediaIamb: Number(result.mediaIamb) || 0,
        mediaIcidade: Number(result.mediaIcidade) || 0,
        mediaIeduc: Number(result.mediaIeduc) || 0,
        mediaIfiscal: Number(result.mediaIfiscal) || 0,
        mediaIgovTi: Number(result.mediaIgovTi) || 0,
        mediaIsaude: Number(result.mediaIsaude) || 0,
        mediaIplan: Number(result.mediaIplan) || 0,
      };
    } catch (error) {
      console.error('Error fetching statistics from database:', error);
      return this.getEstatisticasFromAPI(query);
    }
  }

  async getFaixasDistribuicao(ano: number): Promise<FaixaDistribuicao[]> {
    if (!this.db.isDirectD1()) {
      return this.getFaixasDistribuicaoFromAPI(ano);
    }

    try {
      const db = this.db.getDb();
      if (!db) throw new Error('Database not available');

      const totalMunicipios = await this.getTotalMunicipios(ano);

      const faixas = await db
        .select({
          faixa: resultadosMunicipios.faixaIegmMunicipio,
          quantidade: count(),
        })
        .from(resultadosMunicipios)
        .where(
          and(
            eq(resultadosMunicipios.anoRef, ano),
            eq(resultadosMunicipios.tribunalId, 1) // TCEMG
          )
        )
        .groupBy(resultadosMunicipios.faixaIegmMunicipio)
        .orderBy(asc(resultadosMunicipios.faixaIegmMunicipio));

      return faixas.map(item => ({
        faixa: item.faixa,
        quantidade: item.quantidade || 0,
        percentual: totalMunicipios > 0 ? ((item.quantidade || 0) / totalMunicipios) * 100 : 0
      }));
    } catch (error) {
      console.error('Error fetching faixas distribution from database:', error);
      return this.getFaixasDistribuicaoFromAPI(ano);
    }
  }

  // ============================================================================
  // CONSULTAS À API (FALLBACK)
  // ============================================================================

  private async getMunicipiosFromAPI(query: MunicipioQuery): Promise<Municipio[]> {
    const response = await this.httpClient.get<Municipio[]>('municipios', query);
    return response.success ? response.data : [];
  }

  private async getMunicipioByNomeFromAPI(nome: string, ano: number): Promise<Municipio | null> {
    const response = await this.httpClient.get<Municipio[]>('municipios', {
      municipio: nome,
      ano
    });
    return response.success && response.data.length > 0 ? response.data[0] : null;
  }

  private async getRankingFromAPI(query: RankingQuery): Promise<RankingItem[]> {
    const response = await this.httpClient.get<RankingItem[]>('ranking', query);
    return response.success ? response.data : [];
  }

  private async getEstatisticasFromAPI(query: EstatisticasQuery): Promise<EstatisticasGerais> {
    const response = await this.httpClient.get<EstatisticasGerais>('stats', query);
    return response.success ? response.data : {
      totalMunicipios: 0,
      mediaIegm: 0,
      minIegm: 0,
      maxIegm: 0,
      mediaIamb: 0,
      mediaIcidade: 0,
      mediaIeduc: 0,
      mediaIfiscal: 0,
      mediaIgovTi: 0,
      mediaIsaude: 0,
      mediaIplan: 0,
    };
  }

  private async getFaixasDistribuicaoFromAPI(ano: number): Promise<FaixaDistribuicao[]> {
    const response = await this.httpClient.get<FaixaDistribuicao[]>('faixas', { ano });
    return response.success ? response.data : [];
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  private async getTotalMunicipios(ano: number): Promise<number> {
    try {
      const db = this.db.getDb();
      if (!db) return 0;

      const result = await db
        .select({ count: count() })
        .from(resultadosMunicipios)
        .where(
          and(
            eq(resultadosMunicipios.anoRef, ano),
            eq(resultadosMunicipios.tribunalId, 1) // TCEMG
          )
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting total municipios:', error);
      return 0;
    }
  }
}
