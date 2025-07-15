-- Script para criar tabelas no Cloudflare D1
-- Execute com: wrangler d1 execute dataset-iegm --file=scripts/create-d1-tables.sql --local=false

-- ============================================================================
-- TABELAS DE REFERÊNCIA
-- ============================================================================

-- Tribunais de Contas
CREATE TABLE IF NOT EXISTS tribunais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  uf TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS tribunal_codigo_idx ON tribunais(codigo);
CREATE INDEX IF NOT EXISTS tribunal_uf_idx ON tribunais(uf);

-- Municípios
CREATE TABLE IF NOT EXISTS municipios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_ibge TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  uf TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS municipio_codigo_ibge_idx ON municipios(codigo_ibge);
CREATE INDEX IF NOT EXISTS municipio_nome_idx ON municipios(nome);
CREATE INDEX IF NOT EXISTS municipio_uf_idx ON municipios(uf);

-- Indicadores IEGM
CREATE TABLE IF NOT EXISTS indicadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS indicador_codigo_idx ON indicadores(codigo);
CREATE INDEX IF NOT EXISTS indicador_ordem_idx ON indicadores(ordem);

-- ============================================================================
-- TABELAS DE QUESTIONÁRIOS E QUESTÕES
-- ============================================================================

-- Questionários por ano e indicador
CREATE TABLE IF NOT EXISTS questionarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tribunal_id INTEGER NOT NULL,
  indicador_id INTEGER NOT NULL,
  ano_ref INTEGER NOT NULL,
  nome TEXT NOT NULL,
  codigo TEXT,
  FOREIGN KEY (tribunal_id) REFERENCES tribunais(id),
  FOREIGN KEY (indicador_id) REFERENCES indicadores(id)
);

CREATE INDEX IF NOT EXISTS questionario_tribunal_ano_idx ON questionarios(tribunal_id, ano_ref);
CREATE INDEX IF NOT EXISTS questionario_indicador_ano_idx ON questionarios(indicador_id, ano_ref);
CREATE INDEX IF NOT EXISTS questionario_unique_idx ON questionarios(tribunal_id, indicador_id, ano_ref);

-- Questões dos questionários
CREATE TABLE IF NOT EXISTS questoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  questionario_id INTEGER NOT NULL,
  questao_id INTEGER NOT NULL,
  sequencia_bloco_repeticao INTEGER,
  indice_questao TEXT,
  chave_questao TEXT NOT NULL,
  texto TEXT NOT NULL,
  peso REAL DEFAULT 1.0,
  FOREIGN KEY (questionario_id) REFERENCES questionarios(id)
);

CREATE INDEX IF NOT EXISTS questao_questionario_idx ON questoes(questionario_id);
CREATE INDEX IF NOT EXISTS questao_chave_idx ON questoes(chave_questao);
CREATE INDEX IF NOT EXISTS questao_indice_idx ON questoes(indice_questao);

-- ============================================================================
-- TABELAS DE RESPOSTAS
-- ============================================================================

-- Respostas dos questionários por município
CREATE TABLE IF NOT EXISTS questionario_respostas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tribunal_id INTEGER NOT NULL,
  municipio_id INTEGER NOT NULL,
  questionario_id INTEGER NOT NULL,
  questionario_resposta_id INTEGER NOT NULL,
  data_termino TEXT,
  ano_ref INTEGER NOT NULL,
  FOREIGN KEY (tribunal_id) REFERENCES tribunais(id),
  FOREIGN KEY (municipio_id) REFERENCES municipios(id),
  FOREIGN KEY (questionario_id) REFERENCES questionarios(id)
);

CREATE INDEX IF NOT EXISTS questionario_resposta_municipio_ano_idx ON questionario_respostas(municipio_id, ano_ref);
CREATE INDEX IF NOT EXISTS questionario_resposta_questionario_idx ON questionario_respostas(questionario_id);
CREATE INDEX IF NOT EXISTS questionario_resposta_tribunal_ano_idx ON questionario_respostas(tribunal_id, ano_ref);

-- Respostas individuais às questões
CREATE TABLE IF NOT EXISTS respostas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  questionario_resposta_id INTEGER NOT NULL,
  questao_id INTEGER NOT NULL,
  chave_resposta TEXT,
  resposta TEXT NOT NULL,
  nota REAL,
  FOREIGN KEY (questionario_resposta_id) REFERENCES questionario_respostas(id),
  FOREIGN KEY (questao_id) REFERENCES questoes(id)
);

CREATE INDEX IF NOT EXISTS resposta_questionario_resposta_idx ON respostas(questionario_resposta_id);
CREATE INDEX IF NOT EXISTS resposta_questao_idx ON respostas(questao_id);
CREATE INDEX IF NOT EXISTS resposta_chave_idx ON respostas(chave_resposta);

-- ============================================================================
-- TABELAS DE RESULTADOS E CÁLCULOS
-- ============================================================================

-- Resultados dos indicadores por município
CREATE TABLE IF NOT EXISTS resultados_indicadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tribunal_id INTEGER NOT NULL,
  municipio_id INTEGER NOT NULL,
  indicador_id INTEGER NOT NULL,
  ano_ref INTEGER NOT NULL,
  quantidade_respostas INTEGER,
  quantidade_respostas_pontuadas INTEGER,
  nota_final REAL,
  nota_ajustada_dentro_faixa REAL,
  percentual_indice REAL,
  faixa TEXT,
  rebaixamentos INTEGER,
  percentual_indice_apos_rebaixamento REAL,
  faixa_apos_rebaixamento TEXT,
  FOREIGN KEY (tribunal_id) REFERENCES tribunais(id),
  FOREIGN KEY (municipio_id) REFERENCES municipios(id),
  FOREIGN KEY (indicador_id) REFERENCES indicadores(id)
);

CREATE INDEX IF NOT EXISTS resultado_municipio_ano_idx ON resultados_indicadores(municipio_id, ano_ref);
CREATE INDEX IF NOT EXISTS resultado_indicador_ano_idx ON resultados_indicadores(indicador_id, ano_ref);
CREATE INDEX IF NOT EXISTS resultado_tribunal_ano_idx ON resultados_indicadores(tribunal_id, ano_ref);
CREATE INDEX IF NOT EXISTS resultado_unique_idx ON resultados_indicadores(tribunal_id, municipio_id, indicador_id, ano_ref);

-- Resultados consolidados por município (IEGM Municipal)
CREATE TABLE IF NOT EXISTS resultados_municipios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tribunal_id INTEGER NOT NULL,
  municipio_id INTEGER NOT NULL,
  ano_ref INTEGER NOT NULL,
  percentual_iamb REAL,
  percentual_icidade REAL,
  percentual_ieduc REAL,
  percentual_ifiscal REAL,
  percentual_igov_ti REAL,
  percentual_isaude REAL,
  percentual_iplan REAL,
  percentual_iegm_municipio REAL,
  faixa_iamb TEXT,
  faixa_icidade TEXT,
  faixa_ieduc TEXT,
  faixa_ifiscal TEXT,
  faixa_igov_ti TEXT,
  faixa_isaude TEXT,
  faixa_iplan TEXT,
  faixa_iegm_municipio TEXT,
  FOREIGN KEY (tribunal_id) REFERENCES tribunais(id),
  FOREIGN KEY (municipio_id) REFERENCES municipios(id)
);

CREATE INDEX IF NOT EXISTS resultado_municipio_consolidado_idx ON resultados_municipios(municipio_id, ano_ref);
CREATE INDEX IF NOT EXISTS resultado_municipio_tribunal_ano_idx ON resultados_municipios(tribunal_id, ano_ref);
CREATE INDEX IF NOT EXISTS resultado_municipio_unique_idx ON resultados_municipios(tribunal_id, municipio_id, ano_ref);

-- Resultados consolidados por estado/UF
CREATE TABLE IF NOT EXISTS resultados_estados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tribunal_id INTEGER NOT NULL,
  uf TEXT NOT NULL,
  ano_ref INTEGER NOT NULL,
  percentual_iamb REAL,
  percentual_icidade REAL,
  percentual_ieduc REAL,
  percentual_ifiscal REAL,
  percentual_igov_ti REAL,
  percentual_isaude REAL,
  percentual_iplan REAL,
  percentual_iegm_estado REAL,
  faixa_iamb TEXT,
  faixa_icidade TEXT,
  faixa_ieduc TEXT,
  faixa_ifiscal TEXT,
  faixa_igov_ti TEXT,
  faixa_isaude TEXT,
  faixa_iplan TEXT,
  faixa_iegm_estado TEXT,
  quantidade_municipios_responderam INTEGER,
  FOREIGN KEY (tribunal_id) REFERENCES tribunais(id)
);

CREATE INDEX IF NOT EXISTS resultado_estado_uf_ano_idx ON resultados_estados(uf, ano_ref);
CREATE INDEX IF NOT EXISTS resultado_estado_tribunal_ano_idx ON resultados_estados(tribunal_id, ano_ref);
CREATE INDEX IF NOT EXISTS resultado_estado_unique_idx ON resultados_estados(tribunal_id, uf, ano_ref);

-- ============================================================================
-- TABELA DE RESPOSTAS DETALHADAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS respostas_detalhadas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tribunal TEXT NOT NULL,
  codigo_ibge TEXT NOT NULL,
  municipio TEXT NOT NULL,
  indicador TEXT NOT NULL,
  questao TEXT NOT NULL,
  resposta TEXT NOT NULL,
  pontuacao REAL,
  peso REAL DEFAULT 1.0,
  nota REAL,
  ano_ref INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS resposta_detalhada_municipio_ano_idx ON respostas_detalhadas(municipio, ano_ref);
CREATE INDEX IF NOT EXISTS resposta_detalhada_indicador_idx ON respostas_detalhadas(indicador);
CREATE INDEX IF NOT EXISTS resposta_detalhada_tribunal_idx ON respostas_detalhadas(tribunal);

-- ============================================================================
-- TABELA DE CONTROLE DE MIGRAÇÕES
-- ============================================================================

CREATE TABLE IF NOT EXISTS migracoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome_arquivo TEXT NOT NULL UNIQUE,
  data_migracao INTEGER NOT NULL,
  tipo_arquivo TEXT NOT NULL,
  ano_ref INTEGER,
  tribunal TEXT
); 