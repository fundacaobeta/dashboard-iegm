import { createLocalDB } from '../src/db/local';
import * as schema from '../src/db/schema';
import { sql } from 'drizzle-orm';

const db = createLocalDB();
if (!db) {
  console.error('Erro ao criar banco de dados local');
  process.exit(1);
}

async function seedTribunais() {
  console.log('Populando tabela de tribunais...');

  const tribunaisData = [
    {
      codigo: 'TCEMG',
      nome: 'Tribunal de Contas do Estado de Minas Gerais',
      uf: 'MG'
    }
  ];

  for (const tribunal of tribunaisData) {
    try {
      await db.insert(schema.tribunais).values(tribunal);
      console.log(`✓ Tribunal ${tribunal.codigo} inserido`);
    } catch (error) {
      console.log(`- Tribunal ${tribunal.codigo} já existe`);
    }
  }
}

async function seedIndicadores() {
  console.log('Populando tabela de indicadores...');

  const indicadoresData = [
    {
      codigo: 'i-Amb',
      nome: 'Indicador de Meio Ambiente',
      descricao: 'Avalia a gestão ambiental municipal',
      ordem: 1
    },
    {
      codigo: 'i-Cidade',
      nome: 'Indicador de Cidade',
      descricao: 'Avalia a gestão urbana e infraestrutura',
      ordem: 2
    },
    {
      codigo: 'i-Educ',
      nome: 'Indicador de Educação',
      descricao: 'Avalia a gestão da educação municipal',
      ordem: 3
    },
    {
      codigo: 'i-Fiscal',
      nome: 'Indicador Fiscal',
      descricao: 'Avalia a gestão fiscal e financeira',
      ordem: 4
    },
    {
      codigo: 'i-GovTI',
      nome: 'Indicador de Governança de TI',
      descricao: 'Avalia a gestão de tecnologia da informação',
      ordem: 5
    },
    {
      codigo: 'i-Saude',
      nome: 'Indicador de Saúde',
      descricao: 'Avalia a gestão da saúde municipal',
      ordem: 6
    },
    {
      codigo: 'i-Plan',
      nome: 'Indicador de Planejamento',
      descricao: 'Avalia o planejamento municipal',
      ordem: 7
    }
  ];

  for (const indicador of indicadoresData) {
    try {
      await db.insert(schema.indicadores).values(indicador);
      console.log(`✓ Indicador ${indicador.codigo} inserido`);
    } catch (error) {
      console.log(`- Indicador ${indicador.codigo} já existe`);
    }
  }
}

async function main() {
  try {
    console.log('Iniciando seed dos dados de referência...');

    await seedTribunais();
    await seedIndicadores();

    console.log('Seed concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o seed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    const sqlite = (db as any).$client;
    sqlite.close();
  }
}

main();
