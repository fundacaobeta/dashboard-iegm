import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/db/schema.ts';
import { eq, sql, desc, asc, count, avg, min, max, and } from 'drizzle-orm';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao banco SQLite
const sqlite = new Database('local.db');
const db = drizzle(sqlite, { schema });

// Função para gerar questões específicas por dimensão
const generateSpecificQuestions = (dimensao: string, score: number, media: number) => {
  const questions = {
    'Educação': [
      'Qualidade da gestão educacional municipal',
      'Investimento em infraestrutura escolar',
      'Formação continuada de professores',
      'Acompanhamento do desempenho escolar',
      'Transparência na aplicação de recursos da educação'
    ],
    'Saúde': [
      'Gestão da rede de atenção básica',
      'Qualidade dos serviços de saúde pública',
      'Investimento em equipamentos médicos',
      'Capacitação dos profissionais de saúde',
      'Controle de qualidade dos serviços prestados'
    ],
    'Gestão Fiscal': [
      'Transparência na execução orçamentária',
      'Controle interno e auditoria',
      'Gestão da dívida pública',
      'Eficiência na arrecadação tributária',
      'Planejamento financeiro de longo prazo'
    ],
    'Meio Ambiente': [
      'Gestão de resíduos sólidos',
      'Preservação de áreas verdes',
      'Controle da poluição ambiental',
      'Educação ambiental da população',
      'Licenciamento ambiental de atividades'
    ],
    'Cidades': [
      'Planejamento urbano e territorial',
      'Mobilidade urbana e transporte público',
      'Saneamento básico e infraestrutura',
      'Segurança pública e iluminação',
      'Acessibilidade e inclusão urbana'
    ],
    'Planejamento': [
      'Elaboração e execução do PPA',
      'Monitoramento de indicadores estratégicos',
      'Participação social no planejamento',
      'Integração entre políticas públicas',
      'Avaliação de resultados e impactos'
    ],
    'Governança TI': [
      'Modernização dos sistemas de informação',
      'Transparência digital e governo eletrônico',
      'Segurança da informação',
      'Capacitação em tecnologia da informação',
      'Integração de sistemas municipais'
    ]
  };

  const dimensionQuestions = questions[dimensao as keyof typeof questions] || [];
  const scorePercent = score * 100;
  const mediaPercent = media * 100;

  // Selecionar questão baseada no score
  let selectedQuestion = dimensionQuestions[0];

  if (scorePercent < 30) {
    selectedQuestion = dimensionQuestions[0]; // Questão mais crítica
  } else if (scorePercent < 50) {
    selectedQuestion = dimensionQuestions[1] || dimensionQuestions[0];
  } else if (scorePercent < 70) {
    selectedQuestion = dimensionQuestions[2] || dimensionQuestions[1] || dimensionQuestions[0];
  } else {
    selectedQuestion = dimensionQuestions[3] || dimensionQuestions[2] || dimensionQuestions[0];
  }

  // Adicionar contexto baseado na comparação com a média
  let context = '';
  if (scorePercent < mediaPercent - 10) {
    context = ' (Abaixo da média estadual)';
  } else if (scorePercent > mediaPercent + 10) {
    context = ' (Acima da média estadual)';
  }

  return selectedQuestion + context;
};

// Função para gerar recomendações específicas
const generateSpecificRecommendations = (dimensao: string, score: number) => {
  const scorePercent = score * 100;

  const recommendations = {
    'Educação': {
      low: 'Implementar programa de formação continuada para professores e melhorar a infraestrutura escolar com recursos do FUNDEB.',
      medium: 'Ampliar o monitoramento do desempenho escolar e fortalecer a gestão democrática nas escolas.',
      high: 'Manter os bons resultados e expandir as boas práticas para outras áreas da educação.'
    },
    'Saúde': {
      low: 'Investir na modernização da rede básica de saúde e capacitar profissionais para melhorar a qualidade dos serviços.',
      medium: 'Implementar sistema de monitoramento da qualidade dos serviços e fortalecer a atenção primária.',
      high: 'Expandir as boas práticas e investir em tecnologia para otimizar os serviços de saúde.'
    },
    'Gestão Fiscal': {
      low: 'Implementar sistema de controle interno robusto e melhorar a transparência na execução orçamentária.',
      medium: 'Aprimorar o planejamento financeiro de longo prazo e fortalecer a auditoria interna.',
      high: 'Manter a excelência na gestão fiscal e compartilhar boas práticas com outros municípios.'
    },
    'Meio Ambiente': {
      low: 'Desenvolver programa de gestão de resíduos sólidos e implementar educação ambiental nas escolas.',
      medium: 'Ampliar as áreas verdes urbanas e fortalecer o controle da poluição ambiental.',
      high: 'Expandir as iniciativas ambientais e buscar certificações de sustentabilidade.'
    },
    'Cidades': {
      low: 'Investir em infraestrutura urbana básica e desenvolver plano de mobilidade urbana.',
      medium: 'Melhorar a integração entre planejamento urbano e políticas de desenvolvimento.',
      high: 'Manter a qualidade dos serviços urbanos e expandir as iniciativas de smart city.'
    },
    'Planejamento': {
      low: 'Elaborar PPA participativo e implementar sistema de monitoramento de indicadores.',
      medium: 'Fortalecer a integração entre políticas públicas e ampliar a participação social.',
      high: 'Manter a excelência no planejamento e expandir as boas práticas para outras áreas.'
    },
    'Governança TI': {
      low: 'Investir na modernização dos sistemas de informação e implementar governo eletrônico.',
      medium: 'Ampliar a transparência digital e fortalecer a segurança da informação.',
      high: 'Expandir as iniciativas de inovação tecnológica e buscar certificações de excelência.'
    }
  };

  const dimRecs = recommendations[dimensao as keyof typeof recommendations];
  if (!dimRecs) return 'Implementar melhorias específicas nesta área.';

  if (scorePercent < 40) return dimRecs.low;
  if (scorePercent < 70) return dimRecs.medium;
  return dimRecs.high;
};

// Rota para listar municípios
app.get('/api/municipios', async (req, res) => {
  try {
    const { ano, tribunal, municipio } = req.query;

    let query = db.select().from(schema.resultadosMunicipios);

    if (ano) {
      query = query.where(eq(schema.resultadosMunicipios.anoRef, parseInt(ano as string)));
    }

    if (tribunal) {
      // Join com tribunais para filtrar por tribunal
      query = db.select({
        id: schema.resultadosMunicipios.id,
        tribunalId: schema.resultadosMunicipios.tribunalId,
        municipioId: schema.resultadosMunicipios.municipioId,
        anoRef: schema.resultadosMunicipios.anoRef,
        percentualIamb: schema.resultadosMunicipios.percentualIamb,
        percentualIcidade: schema.resultadosMunicipios.percentualIcidade,
        percentualIeduc: schema.resultadosMunicipios.percentualIeduc,
        percentualIfiscal: schema.resultadosMunicipios.percentualIfiscal,
        percentualIgovTi: schema.resultadosMunicipios.percentualIgovTi,
        percentualIsaude: schema.resultadosMunicipios.percentualIsaude,
        percentualIplan: schema.resultadosMunicipios.percentualIplan,
        percentualIegmMunicipio: schema.resultadosMunicipios.percentualIegmMunicipio,
        faixaIamb: schema.resultadosMunicipios.faixaIamb,
        faixaIcidade: schema.resultadosMunicipios.faixaIcidade,
        faixaIeduc: schema.resultadosMunicipios.faixaIeduc,
        faixaIfiscal: schema.resultadosMunicipios.faixaIfiscal,
        faixaIgovTi: schema.resultadosMunicipios.faixaIgovTi,
        faixaIsaude: schema.resultadosMunicipios.faixaIsaude,
        faixaIplan: schema.resultadosMunicipios.faixaIplan,
        faixaIegmMunicipio: schema.resultadosMunicipios.faixaIegmMunicipio,
        tribunal: schema.tribunais.codigo,
        municipio: schema.municipios.nome,
        codigoIbge: schema.municipios.codigoIbge
      }).from(schema.resultadosMunicipios)
        .innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
        .innerJoin(schema.municipios, eq(schema.resultadosMunicipios.municipioId, schema.municipios.id))
        .where(eq(schema.tribunais.codigo, tribunal as string));
    }

    if (municipio && !tribunal) {
      // Se não há tribunal, fazer join para buscar por município
      query = db.select({
        id: schema.resultadosMunicipios.id,
        tribunalId: schema.resultadosMunicipios.tribunalId,
        municipioId: schema.resultadosMunicipios.municipioId,
        anoRef: schema.resultadosMunicipios.anoRef,
        percentualIamb: schema.resultadosMunicipios.percentualIamb,
        percentualIcidade: schema.resultadosMunicipios.percentualIcidade,
        percentualIeduc: schema.resultadosMunicipios.percentualIeduc,
        percentualIfiscal: schema.resultadosMunicipios.percentualIfiscal,
        percentualIgovTi: schema.resultadosMunicipios.percentualIgovTi,
        percentualIsaude: schema.resultadosMunicipios.percentualIsaude,
        percentualIplan: schema.resultadosMunicipios.percentualIplan,
        percentualIegmMunicipio: schema.resultadosMunicipios.percentualIegmMunicipio,
        faixaIamb: schema.resultadosMunicipios.faixaIamb,
        faixaIcidade: schema.resultadosMunicipios.faixaIcidade,
        faixaIeduc: schema.resultadosMunicipios.faixaIeduc,
        faixaIfiscal: schema.resultadosMunicipios.faixaIfiscal,
        faixaIgovTi: schema.resultadosMunicipios.faixaIgovTi,
        faixaIsaude: schema.resultadosMunicipios.faixaIsaude,
        faixaIplan: schema.resultadosMunicipios.faixaIplan,
        faixaIegmMunicipio: schema.resultadosMunicipios.faixaIegmMunicipio,
        tribunal: schema.tribunais.codigo,
        municipio: schema.municipios.nome,
        codigoIbge: schema.municipios.codigoIbge
      }).from(schema.resultadosMunicipios)
        .innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
        .innerJoin(schema.municipios, eq(schema.resultadosMunicipios.municipioId, schema.municipios.id))
        .where(eq(schema.municipios.nome, municipio as string));
    }

    if (municipio && tribunal) {
      // Se há ambos, fazer join e filtrar por ambos
      query = db.select({
        id: schema.resultadosMunicipios.id,
        tribunalId: schema.resultadosMunicipios.tribunalId,
        municipioId: schema.resultadosMunicipios.municipioId,
        anoRef: schema.resultadosMunicipios.anoRef,
        percentualIamb: schema.resultadosMunicipios.percentualIamb,
        percentualIcidade: schema.resultadosMunicipios.percentualIcidade,
        percentualIeduc: schema.resultadosMunicipios.percentualIeduc,
        percentualIfiscal: schema.resultadosMunicipios.percentualIfiscal,
        percentualIgovTi: schema.resultadosMunicipios.percentualIgovTi,
        percentualIsaude: schema.resultadosMunicipios.percentualIsaude,
        percentualIplan: schema.resultadosMunicipios.percentualIplan,
        percentualIegmMunicipio: schema.resultadosMunicipios.percentualIegmMunicipio,
        faixaIamb: schema.resultadosMunicipios.faixaIamb,
        faixaIcidade: schema.resultadosMunicipios.faixaIcidade,
        faixaIeduc: schema.resultadosMunicipios.faixaIeduc,
        faixaIfiscal: schema.resultadosMunicipios.faixaIfiscal,
        faixaIgovTi: schema.resultadosMunicipios.faixaIgovTi,
        faixaIsaude: schema.resultadosMunicipios.faixaIsaude,
        faixaIplan: schema.resultadosMunicipios.faixaIplan,
        faixaIegmMunicipio: schema.resultadosMunicipios.faixaIegmMunicipio,
        tribunal: schema.tribunais.codigo,
        municipio: schema.municipios.nome,
        codigoIbge: schema.municipios.codigoIbge
      }).from(schema.resultadosMunicipios)
        .innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
        .innerJoin(schema.municipios, eq(schema.resultadosMunicipios.municipioId, schema.municipios.id))
        .where(and(
          eq(schema.tribunais.codigo, tribunal as string),
          eq(schema.municipios.nome, municipio as string)
        ));
    }

    // Se não há filtros especiais, fazer join básico
    if (!tribunal && !municipio) {
      query = db.select({
        id: schema.resultadosMunicipios.id,
        tribunalId: schema.resultadosMunicipios.tribunalId,
        municipioId: schema.resultadosMunicipios.municipioId,
        anoRef: schema.resultadosMunicipios.anoRef,
        percentualIamb: schema.resultadosMunicipios.percentualIamb,
        percentualIcidade: schema.resultadosMunicipios.percentualIcidade,
        percentualIeduc: schema.resultadosMunicipios.percentualIeduc,
        percentualIfiscal: schema.resultadosMunicipios.percentualIfiscal,
        percentualIgovTi: schema.resultadosMunicipios.percentualIgovTi,
        percentualIsaude: schema.resultadosMunicipios.percentualIsaude,
        percentualIplan: schema.resultadosMunicipios.percentualIplan,
        percentualIegmMunicipio: schema.resultadosMunicipios.percentualIegmMunicipio,
        faixaIamb: schema.resultadosMunicipios.faixaIamb,
        faixaIcidade: schema.resultadosMunicipios.faixaIcidade,
        faixaIeduc: schema.resultadosMunicipios.faixaIeduc,
        faixaIfiscal: schema.resultadosMunicipios.faixaIfiscal,
        faixaIgovTi: schema.resultadosMunicipios.faixaIgovTi,
        faixaIsaude: schema.resultadosMunicipios.faixaIsaude,
        faixaIplan: schema.resultadosMunicipios.faixaIplan,
        faixaIegmMunicipio: schema.resultadosMunicipios.faixaIegmMunicipio,
        tribunal: schema.tribunais.codigo,
        municipio: schema.municipios.nome,
        codigoIbge: schema.municipios.codigoIbge
      }).from(schema.resultadosMunicipios)
        .innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
        .innerJoin(schema.municipios, eq(schema.resultadosMunicipios.municipioId, schema.municipios.id));
    }

    const result = await query.orderBy(desc(schema.resultadosMunicipios.percentualIegmMunicipio));
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar municípios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para estatísticas gerais
app.get('/api/stats', async (req, res) => {
  try {
    const { ano, tribunal } = req.query;

    let query = db.select({
      totalMunicipios: count(),
      mediaIegm: avg(schema.resultadosMunicipios.percentualIegmMunicipio),
      minIegm: min(schema.resultadosMunicipios.percentualIegmMunicipio),
      maxIegm: max(schema.resultadosMunicipios.percentualIegmMunicipio),
      mediaIamb: avg(schema.resultadosMunicipios.percentualIamb),
      mediaIcidade: avg(schema.resultadosMunicipios.percentualIcidade),
      mediaIeduc: avg(schema.resultadosMunicipios.percentualIeduc),
      mediaIfiscal: avg(schema.resultadosMunicipios.percentualIfiscal),
      mediaIgovTi: avg(schema.resultadosMunicipios.percentualIgovTi),
      mediaIsaude: avg(schema.resultadosMunicipios.percentualIsaude),
      mediaIplan: avg(schema.resultadosMunicipios.percentualIplan),
    }).from(schema.resultadosMunicipios);

    if (ano) {
      query = query.where(eq(schema.resultadosMunicipios.anoRef, parseInt(ano as string)));
    }

    if (tribunal) {
      query = query.innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
        .where(eq(schema.tribunais.codigo, tribunal as string));
    }

    const result = await query;
    res.json(result[0] || {});
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para ranking
app.get('/api/ranking', async (req, res) => {
  try {
    const { ano, tribunal } = req.query;

    let query = db.select({
      codigoIbge: schema.municipios.codigoIbge,
      municipio: schema.municipios.nome,
      percentualIegmMunicipio: schema.resultadosMunicipios.percentualIegmMunicipio,
      indIegmMunicipio: schema.resultadosMunicipios.faixaIegmMunicipio,
      ranking: sql`ROW_NUMBER() OVER (ORDER BY ${schema.resultadosMunicipios.percentualIegmMunicipio} DESC)`.as('ranking'),
    }).from(schema.resultadosMunicipios)
      .innerJoin(schema.municipios, eq(schema.resultadosMunicipios.municipioId, schema.municipios.id));

    if (ano) {
      query = query.where(eq(schema.resultadosMunicipios.anoRef, parseInt(ano as string)));
    }

    if (tribunal) {
      query = query.innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
        .where(eq(schema.tribunais.codigo, tribunal as string));
    }

    const result = await query.orderBy(desc(schema.resultadosMunicipios.percentualIegmMunicipio)).limit(50);
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para distribuição de faixas
app.get('/api/faixas', async (req, res) => {
  try {
    const { ano, tribunal } = req.query;

    let query = db.select({
      faixa: schema.resultadosMunicipios.faixaIegmMunicipio,
      quantidade: count(),
    }).from(schema.resultadosMunicipios);

    if (ano) {
      query = query.where(eq(schema.resultadosMunicipios.anoRef, parseInt(ano as string)));
    }

    if (tribunal) {
      query = query.innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
        .where(eq(schema.tribunais.codigo, tribunal as string));
    }

    const result = await query.groupBy(schema.resultadosMunicipios.faixaIegmMunicipio).orderBy(asc(schema.resultadosMunicipios.faixaIegmMunicipio));
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar faixas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para respostas negativas (simplificada para o momento)
app.get('/api/respostas-negativas', async (req, res) => {
  try {
    const { ano, tribunal, municipio } = req.query;

    // Por enquanto, retornar dados básicos do município
    let query = db.select({
      id: schema.resultadosMunicipios.id,
      tribunal: schema.tribunais.codigo,
      codigoIbge: schema.municipios.codigoIbge,
      municipio: schema.municipios.nome,
      indicador: sql`'IEGM'`.as('indicador'),
      questao: sql`'Análise Geral'`.as('questao'),
      resposta: sql`'Dados disponíveis'`.as('resposta'),
      pontuacao: schema.resultadosMunicipios.percentualIegmMunicipio,
      peso: sql`1.0`.as('peso'),
      nota: schema.resultadosMunicipios.percentualIegmMunicipio,
      anoRef: schema.resultadosMunicipios.anoRef,
    }).from(schema.resultadosMunicipios)
      .innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
      .innerJoin(schema.municipios, eq(schema.resultadosMunicipios.municipioId, schema.municipios.id));

    if (ano) {
      query = query.where(eq(schema.resultadosMunicipios.anoRef, parseInt(ano as string)));
    }

    if (tribunal) {
      query = query.where(eq(schema.tribunais.codigo, tribunal as string));
    }

    if (municipio) {
      query = query.where(eq(schema.municipios.nome, municipio as string));
    }

    const result = await query.orderBy(asc(schema.resultadosMunicipios.percentualIegmMunicipio)).limit(100);
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar respostas negativas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para análise de melhorias
app.get('/api/analise-melhorias', async (req, res) => {
  try {
    const { ano, tribunal, municipio } = req.query;

    if (!municipio) {
      return res.status(400).json({ error: 'Município é obrigatório' });
    }

    // Buscar dados do município
    const municipioResult = await db.select({
      id: schema.resultadosMunicipios.id,
      percentualIamb: schema.resultadosMunicipios.percentualIamb,
      percentualIcidade: schema.resultadosMunicipios.percentualIcidade,
      percentualIeduc: schema.resultadosMunicipios.percentualIeduc,
      percentualIfiscal: schema.resultadosMunicipios.percentualIfiscal,
      percentualIgovTi: schema.resultadosMunicipios.percentualIgovTi,
      percentualIsaude: schema.resultadosMunicipios.percentualIsaude,
      percentualIplan: schema.resultadosMunicipios.percentualIplan,
      percentualIegmMunicipio: schema.resultadosMunicipios.percentualIegmMunicipio,
    }).from(schema.resultadosMunicipios)
      .innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
      .innerJoin(schema.municipios, eq(schema.resultadosMunicipios.municipioId, schema.municipios.id))
      .where(and(
        eq(schema.municipios.nome, municipio as string),
        eq(schema.resultadosMunicipios.anoRef, parseInt(ano as string) || 2023),
        eq(schema.tribunais.codigo, tribunal as string || 'TCEMG')
      ));

    if (municipioResult.length === 0) {
      return res.status(404).json({ error: 'Município não encontrado' });
    }

    const municipioData = municipioResult[0];

    // Buscar estatísticas gerais
    const stats = await db.select({
      mediaIegm: avg(schema.resultadosMunicipios.percentualIegmMunicipio),
      mediaIamb: avg(schema.resultadosMunicipios.percentualIamb),
      mediaIcidade: avg(schema.resultadosMunicipios.percentualIcidade),
      mediaIeduc: avg(schema.resultadosMunicipios.percentualIeduc),
      mediaIfiscal: avg(schema.resultadosMunicipios.percentualIfiscal),
      mediaIgovTi: avg(schema.resultadosMunicipios.percentualIgovTi),
      mediaIsaude: avg(schema.resultadosMunicipios.percentualIsaude),
      mediaIplan: avg(schema.resultadosMunicipios.percentualIplan),
    }).from(schema.resultadosMunicipios)
      .innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
      .where(and(
        eq(schema.resultadosMunicipios.anoRef, parseInt(ano as string) || 2023),
        eq(schema.tribunais.codigo, tribunal as string || 'TCEMG')
      ));

    const medias = stats[0];

    // Gerar análise de melhorias
    const melhorias = [];
    const dimensoes = [
      { nome: 'Educação', valor: municipioData.percentualIeduc, media: medias.mediaIeduc, indicador: 'i-Educ' },
      { nome: 'Saúde', valor: municipioData.percentualIsaude, media: medias.mediaIsaude, indicador: 'i-Saude' },
      { nome: 'Gestão Fiscal', valor: municipioData.percentualIfiscal, media: medias.mediaIfiscal, indicador: 'i-Fiscal' },
      { nome: 'Meio Ambiente', valor: municipioData.percentualIamb, media: medias.mediaIamb, indicador: 'i-Amb' },
      { nome: 'Cidades', valor: municipioData.percentualIcidade, media: medias.mediaIcidade, indicador: 'i-Cidade' },
      { nome: 'Planejamento', valor: municipioData.percentualIplan, media: medias.mediaIplan, indicador: 'i-Plan' },
      { nome: 'Governança TI', valor: municipioData.percentualIgovTi, media: medias.mediaIgovTi, indicador: 'i-Gov TI' }
    ];

    dimensoes.forEach(dimensao => {
      if (dimensao.valor !== null && dimensao.valor < 0.6) {
        const impacto = (0.6 - dimensao.valor) * 100;
        const specificQuestion = generateSpecificQuestions(dimensao.nome, dimensao.valor, dimensao.media);
        const specificRecommendation = generateSpecificRecommendations(dimensao.nome, dimensao.valor);

        melhorias.push({
          indicador: dimensao.indicador,
          questao: specificQuestion,
          respostaAtual: `${(dimensao.valor * 100).toFixed(1)}%`,
          pontuacaoAtual: Math.round(dimensao.valor * 1000), // Escala 0-1000
          pontuacaoMaxima: 1000, // Escala 0-1000
          impacto: Math.round(impacto),
          recomendacao: specificRecommendation
        });
      }
    });

    res.json(melhorias);
  } catch (error) {
    console.error('Erro ao gerar análise de melhorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para análise de dimensões
app.get('/api/analise-dimensoes', async (req, res) => {
  try {
    const { ano, tribunal, municipio } = req.query;

    if (!municipio) {
      return res.status(400).json({ error: 'Município é obrigatório' });
    }

    // Buscar dados do município
    const municipioResult = await db.select({
      id: schema.resultadosMunicipios.id,
      percentualIamb: schema.resultadosMunicipios.percentualIamb,
      percentualIcidade: schema.resultadosMunicipios.percentualIcidade,
      percentualIeduc: schema.resultadosMunicipios.percentualIeduc,
      percentualIfiscal: schema.resultadosMunicipios.percentualIfiscal,
      percentualIgovTi: schema.resultadosMunicipios.percentualIgovTi,
      percentualIsaude: schema.resultadosMunicipios.percentualIsaude,
      percentualIplan: schema.resultadosMunicipios.percentualIplan,
      percentualIegmMunicipio: schema.resultadosMunicipios.percentualIegmMunicipio,
    }).from(schema.resultadosMunicipios)
      .innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
      .innerJoin(schema.municipios, eq(schema.resultadosMunicipios.municipioId, schema.municipios.id))
      .where(and(
        eq(schema.municipios.nome, municipio as string),
        eq(schema.resultadosMunicipios.anoRef, parseInt(ano as string) || 2023),
        eq(schema.tribunais.codigo, tribunal as string || 'TCEMG')
      ));

    if (municipioResult.length === 0) {
      return res.status(404).json({ error: 'Município não encontrado' });
    }

    const municipioData = municipioResult[0];

    // Buscar estatísticas gerais
    const stats = await db.select({
      mediaIegm: avg(schema.resultadosMunicipios.percentualIegmMunicipio),
      mediaIamb: avg(schema.resultadosMunicipios.percentualIamb),
      mediaIcidade: avg(schema.resultadosMunicipios.percentualIcidade),
      mediaIeduc: avg(schema.resultadosMunicipios.percentualIeduc),
      mediaIfiscal: avg(schema.resultadosMunicipios.percentualIfiscal),
      mediaIgovTi: avg(schema.resultadosMunicipios.percentualIgovTi),
      mediaIsaude: avg(schema.resultadosMunicipios.percentualIsaude),
      mediaIplan: avg(schema.resultadosMunicipios.percentualIplan),
    }).from(schema.resultadosMunicipios)
      .innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
      .where(and(
        eq(schema.resultadosMunicipios.anoRef, parseInt(ano as string) || 2023),
        eq(schema.tribunais.codigo, tribunal as string || 'TCEMG')
      ));

    const medias = stats[0];

    // Gerar análise de dimensões
    const dimensoes = [
      {
        dimensao: 'Educação',
        score: municipioData.percentualIeduc || 0,
        media: medias.mediaIeduc || 0,
        status: (municipioData.percentualIeduc || 0) >= 0.6 ? 'forte' : 'melhoria'
      },
      {
        dimensao: 'Saúde',
        score: municipioData.percentualIsaude || 0,
        media: medias.mediaIsaude || 0,
        status: (municipioData.percentualIsaude || 0) >= 0.6 ? 'forte' : 'melhoria'
      },
      {
        dimensao: 'Gestão Fiscal',
        score: municipioData.percentualIfiscal || 0,
        media: medias.mediaIfiscal || 0,
        status: (municipioData.percentualIfiscal || 0) >= 0.6 ? 'forte' : 'melhoria'
      },
      {
        dimensao: 'Meio Ambiente',
        score: municipioData.percentualIamb || 0,
        media: medias.mediaIamb || 0,
        status: (municipioData.percentualIamb || 0) >= 0.6 ? 'forte' : 'melhoria'
      },
      {
        dimensao: 'Cidades',
        score: municipioData.percentualIcidade || 0,
        media: medias.mediaIcidade || 0,
        status: (municipioData.percentualIcidade || 0) >= 0.6 ? 'forte' : 'melhoria'
      },
      {
        dimensao: 'Planejamento',
        score: municipioData.percentualIplan || 0,
        media: medias.mediaIplan || 0,
        status: (municipioData.percentualIplan || 0) >= 0.6 ? 'forte' : 'melhoria'
      },
      {
        dimensao: 'Governança TI',
        score: municipioData.percentualIgovTi || 0,
        media: medias.mediaIgovTi || 0,
        status: (municipioData.percentualIgovTi || 0) >= 0.6 ? 'forte' : 'melhoria'
      }
    ];

    res.json(dimensoes);
  } catch (error) {
    console.error('Erro ao gerar análise de dimensões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para respostas detalhadas
app.get('/api/respostas-detalhadas', async (req, res) => {
  try {
    const { ano, tribunal, municipio } = req.query;

    if (!municipio) {
      return res.status(400).json({ error: 'Município é obrigatório' });
    }

    // Buscar dados do município
    const municipioResult = await db.select({
      id: schema.resultadosMunicipios.id,
      percentualIamb: schema.resultadosMunicipios.percentualIamb,
      percentualIcidade: schema.resultadosMunicipios.percentualIcidade,
      percentualIeduc: schema.resultadosMunicipios.percentualIeduc,
      percentualIfiscal: schema.resultadosMunicipios.percentualIfiscal,
      percentualIgovTi: schema.resultadosMunicipios.percentualIgovTi,
      percentualIsaude: schema.resultadosMunicipios.percentualIsaude,
      percentualIplan: schema.resultadosMunicipios.percentualIplan,
      percentualIegmMunicipio: schema.resultadosMunicipios.percentualIegmMunicipio,
    }).from(schema.resultadosMunicipios)
      .innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
      .innerJoin(schema.municipios, eq(schema.resultadosMunicipios.municipioId, schema.municipios.id))
      .where(and(
        eq(schema.municipios.nome, municipio as string),
        eq(schema.resultadosMunicipios.anoRef, parseInt(ano as string) || 2023),
        eq(schema.tribunais.codigo, tribunal as string || 'TCEMG')
      ));

    if (municipioResult.length === 0) {
      return res.status(404).json({ error: 'Município não encontrado' });
    }

    const municipioData = municipioResult[0];

    // Gerar respostas detalhadas baseadas nos dados disponíveis
    const respostas = [];
    const dimensoes = [
      { nome: 'Educação', valor: municipioData.percentualIeduc, indicador: 'i-Educ' },
      { nome: 'Saúde', valor: municipioData.percentualIsaude, indicador: 'i-Saude' },
      { nome: 'Gestão Fiscal', valor: municipioData.percentualIfiscal, indicador: 'i-Fiscal' },
      { nome: 'Meio Ambiente', valor: municipioData.percentualIamb, indicador: 'i-Amb' },
      { nome: 'Cidades', valor: municipioData.percentualIcidade, indicador: 'i-Cidade' },
      { nome: 'Planejamento', valor: municipioData.percentualIplan, indicador: 'i-Plan' },
      { nome: 'Governança TI', valor: municipioData.percentualIgovTi, indicador: 'i-Gov TI' }
    ];

    dimensoes.forEach(dimensao => {
      if (dimensao.valor !== null) {
        const specificQuestion = generateSpecificQuestions(dimensao.nome, dimensao.valor, 0.5); // média padrão
        const scorePercent = dimensao.valor * 100;
        const scoreScale1000 = Math.round(scorePercent * 10); // Converter para escala 0-1000

        respostas.push({
          id: respostas.length + 1,
          tribunal: 'TCEMG',
          codigoIbge: '0000000', // Placeholder
          municipio: municipio as string,
          indicador: dimensao.indicador,
          questao: specificQuestion,
          resposta: `${dimensao.valor >= 0.6 ? 'Adequado' : 'Necessita Melhoria'}`,
          pontuacao: scorePercent,
          peso: 1.0,
          nota: scoreScale1000, // Usar escala 0-1000
          anoRef: parseInt(ano as string) || 2023
        });
      }
    });

    res.json(respostas);
  } catch (error) {
    console.error('Erro ao buscar respostas detalhadas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para comparativo ano anterior
app.get('/api/comparativo-ano-anterior', async (req, res) => {
  try {
    const { municipio, anoAtual } = req.query;
    const anoAnterior = parseInt(anoAtual as string) - 1;

    if (!municipio) {
      return res.status(400).json({ error: 'Município é obrigatório' });
    }

    // Buscar dados do ano atual
    const anoAtualResult = await db.select({
      percentualIegmMunicipio: schema.resultadosMunicipios.percentualIegmMunicipio,
      percentualIamb: schema.resultadosMunicipios.percentualIamb,
      percentualIcidade: schema.resultadosMunicipios.percentualIcidade,
      percentualIeduc: schema.resultadosMunicipios.percentualIeduc,
      percentualIfiscal: schema.resultadosMunicipios.percentualIfiscal,
      percentualIgovTi: schema.resultadosMunicipios.percentualIgovTi,
      percentualIsaude: schema.resultadosMunicipios.percentualIsaude,
      percentualIplan: schema.resultadosMunicipios.percentualIplan,
    }).from(schema.resultadosMunicipios)
      .innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
      .innerJoin(schema.municipios, eq(schema.resultadosMunicipios.municipioId, schema.municipios.id))
      .where(and(
        eq(schema.municipios.nome, municipio as string),
        eq(schema.resultadosMunicipios.anoRef, parseInt(anoAtual as string)),
        eq(schema.tribunais.codigo, 'TCEMG')
      ));

    // Buscar dados do ano anterior
    const anoAnteriorResult = await db.select({
      percentualIegmMunicipio: schema.resultadosMunicipios.percentualIegmMunicipio,
      percentualIamb: schema.resultadosMunicipios.percentualIamb,
      percentualIcidade: schema.resultadosMunicipios.percentualIcidade,
      percentualIeduc: schema.resultadosMunicipios.percentualIeduc,
      percentualIfiscal: schema.resultadosMunicipios.percentualIfiscal,
      percentualIgovTi: schema.resultadosMunicipios.percentualIgovTi,
      percentualIsaude: schema.resultadosMunicipios.percentualIsaude,
      percentualIplan: schema.resultadosMunicipios.percentualIplan,
    }).from(schema.resultadosMunicipios)
      .innerJoin(schema.tribunais, eq(schema.resultadosMunicipios.tribunalId, schema.tribunais.id))
      .innerJoin(schema.municipios, eq(schema.resultadosMunicipios.municipioId, schema.municipios.id))
      .where(and(
        eq(schema.municipios.nome, municipio as string),
        eq(schema.resultadosMunicipios.anoRef, anoAnterior),
        eq(schema.tribunais.codigo, 'TCEMG')
      ));

    const dadosAtual = anoAtualResult[0] || {};
    const dadosAnterior = anoAnteriorResult[0] || {};

    const comparativo = {
      anoAtual: parseInt(anoAtual as string),
      anoAnterior: anoAnterior,
      municipio: municipio as string,
      variacoes: {
        iEgm: ((dadosAtual.percentualIegmMunicipio || 0) - (dadosAnterior.percentualIegmMunicipio || 0)) * 100,
        iEduc: ((dadosAtual.percentualIeduc || 0) - (dadosAnterior.percentualIeduc || 0)) * 100,
        iSaude: ((dadosAtual.percentualIsaude || 0) - (dadosAnterior.percentualIsaude || 0)) * 100,
        iFiscal: ((dadosAtual.percentualIfiscal || 0) - (dadosAnterior.percentualIfiscal || 0)) * 100,
        iAmb: ((dadosAtual.percentualIamb || 0) - (dadosAnterior.percentualIamb || 0)) * 100,
        iCidade: ((dadosAtual.percentualIcidade || 0) - (dadosAnterior.percentualIcidade || 0)) * 100,
        iPlan: ((dadosAtual.percentualIplan || 0) - (dadosAnterior.percentualIplan || 0)) * 100,
        iGovTi: ((dadosAtual.percentualIgovTi || 0) - (dadosAnterior.percentualIgovTi || 0)) * 100
      }
    };

    res.json(comparativo);
  } catch (error) {
    console.error('Erro ao gerar comparativo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor API rodando em http://localhost:${port}`);
});
