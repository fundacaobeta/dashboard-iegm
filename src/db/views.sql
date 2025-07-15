-- View para resumo dos municípios com todos os índices
CREATE VIEW IF NOT EXISTS vw_resumo_municipios AS
SELECT 
  codigo_ibge,
  municipio,
  ano_ref,
  tribunal,
  pct_iegm_municipio as iegm_geral,
  ind_iegm_municipio as faixa_geral,
  pct_iamb,
  pct_icidade,
  pct_ieduc,
  pct_ifiscal,
  pct_igov_ti,
  pct_isaude,
  pct_iplan,
  ind_iamb,
  ind_icidade,
  ind_ieduc,
  ind_ifiscal,
  ind_igov_ti,
  ind_isaude,
  ind_iplan
FROM municipios;

-- View para análise comparativa entre anos
CREATE VIEW IF NOT EXISTS vw_comparacao_anos AS
SELECT 
  codigo_ibge,
  municipio,
  tribunal,
  ano_ref,
  pct_iegm_municipio,
  ind_iegm_municipio,
  pct_iamb,
  pct_icidade,
  pct_ieduc,
  pct_ifiscal,
  pct_igov_ti,
  pct_isaude,
  pct_iplan
FROM municipios
ORDER BY codigo_ibge, ano_ref;

-- View para ranking dos municípios por IEGM
CREATE VIEW IF NOT EXISTS vw_ranking_iegm AS
SELECT 
  codigo_ibge,
  municipio,
  ano_ref,
  tribunal,
  pct_iegm_municipio,
  ind_iegm_municipio,
  ROW_NUMBER() OVER (PARTITION BY ano_ref ORDER BY pct_iegm_municipio DESC) as ranking_geral,
  ROW_NUMBER() OVER (PARTITION BY ano_ref, tribunal ORDER BY pct_iegm_municipio DESC) as ranking_tribunal
FROM municipios;

-- View para análise de indicadores por município
CREATE VIEW IF NOT EXISTS vw_analise_indicadores AS
SELECT 
  codigo_ibge,
  municipio,
  ano_ref,
  tribunal,
  indicador,
  quantidade_respostas,
  quantidade_respostas_pontuadas,
  nota_final,
  pct_indice_dentro_faixa,
  faixa,
  rebaixamentos
FROM calculos_indices
ORDER BY codigo_ibge, indicador;

-- View para estatísticas gerais por ano
CREATE VIEW IF NOT EXISTS vw_estatisticas_gerais AS
SELECT 
  ano_ref,
  tribunal,
  COUNT(*) as total_municipios,
  AVG(pct_iegm_municipio) as media_iegm,
  MIN(pct_iegm_municipio) as min_iegm,
  MAX(pct_iegm_municipio) as max_iegm,
  AVG(pct_iamb) as media_iamb,
  AVG(pct_icidade) as media_icidade,
  AVG(pct_ieduc) as media_ieduc,
  AVG(pct_ifiscal) as media_ifiscal,
  AVG(pct_igov_ti) as media_igov_ti,
  AVG(pct_isaude) as media_isaude,
  AVG(pct_iplan) as media_iplan
FROM municipios
GROUP BY ano_ref, tribunal;

-- View para análise de faixas por indicador
CREATE VIEW IF NOT EXISTS vw_analise_faixas AS
SELECT 
  ano_ref,
  tribunal,
  indicador,
  faixa,
  COUNT(*) as quantidade_municipios,
  AVG(pct_indice_dentro_faixa) as media_percentual
FROM calculos_indices
GROUP BY ano_ref, tribunal, indicador, faixa
ORDER BY ano_ref, indicador, faixa;

-- View para municípios com melhor desempenho por indicador
CREATE VIEW IF NOT EXISTS vw_melhores_por_indicador AS
SELECT 
  codigo_ibge,
  municipio,
  ano_ref,
  tribunal,
  indicador,
  pct_indice_dentro_faixa,
  faixa,
  ROW_NUMBER() OVER (PARTITION BY ano_ref, indicador ORDER BY pct_indice_dentro_faixa DESC) as ranking_indicador
FROM calculos_indices
WHERE pct_indice_dentro_faixa IS NOT NULL;

-- View para análise de rebaixamentos
CREATE VIEW IF NOT EXISTS vw_analise_rebaixamentos AS
SELECT 
  codigo_ibge,
  municipio,
  ano_ref,
  tribunal,
  indicador,
  rebaixamentos,
  pct_indice_dentro_faixa,
  pct_indice_apos_analise_rebaixamento,
  faixa,
  faixa_apos_analise_rebaixamento
FROM calculos_indices
WHERE rebaixamentos > 0
ORDER BY rebaixamentos DESC, codigo_ibge;

-- View para correlação entre indicadores
CREATE VIEW IF NOT EXISTS vw_correlacao_indicadores AS
SELECT 
  m1.codigo_ibge,
  m1.municipio,
  m1.ano_ref,
  m1.tribunal,
  m1.pct_iegm_municipio,
  m1.pct_iamb,
  m1.pct_icidade,
  m1.pct_ieduc,
  m1.pct_ifiscal,
  m1.pct_igov_ti,
  m1.pct_isaude,
  m1.pct_iplan
FROM municipios m1
WHERE m1.pct_iegm_municipio IS NOT NULL
  AND m1.pct_iamb IS NOT NULL
  AND m1.pct_icidade IS NOT NULL
  AND m1.pct_ieduc IS NOT NULL
  AND m1.pct_ifiscal IS NOT NULL
  AND m1.pct_igov_ti IS NOT NULL
  AND m1.pct_isaude IS NOT NULL
  AND m1.pct_iplan IS NOT NULL;

-- View para análise de respostas negativas
CREATE VIEW IF NOT EXISTS vw_respostas_negativas AS
SELECT 
  codigo_ibge,
  municipio,
  ano_ref,
  tribunal,
  indicador,
  questao,
  resposta,
  pontuacao,
  peso,
  nota
FROM respostas_detalhadas
WHERE pontuacao < 0 OR nota < 0
ORDER BY pontuacao ASC, nota ASC;

-- View para distribuição de faixas por ano
CREATE VIEW IF NOT EXISTS vw_distribuicao_faixas AS
SELECT 
  ano_ref,
  tribunal,
  ind_iegm_municipio as faixa,
  COUNT(*) as quantidade_municipios,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY ano_ref, tribunal), 2) as percentual
FROM municipios
WHERE ind_iegm_municipio IS NOT NULL
GROUP BY ano_ref, tribunal, ind_iegm_municipio
ORDER BY ano_ref, tribunal, faixa; 