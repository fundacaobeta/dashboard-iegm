// ============================================================================
// EXPORTAÇÕES DOS SERVIÇOS IEGM
// ============================================================================

export { MunicipioService } from './municipioService';
export { AnaliseService } from './analiseService';

// ============================================================================
// EXPORTAÇÕES DOS TIPOS
// ============================================================================

export type {
  IEGMFilters,
  MunicipioConfig,
  Municipio,
  EstatisticasGerais,
  RankingItem,
  FaixaDistribuicao,
  RespostaDetalhada,
  AnaliseMelhoria,
  PontoForte,
  PontoMelhoria,
  DimensaoAnalise,
  ComparativoAnoAnterior,
  MunicipioQuery,
  RankingQuery,
  EstatisticasQuery,
  RespostasQuery,
  LoadingState,
  ErrorState
} from './types';

// ============================================================================
// FÁBRICA DE SERVIÇOS
// ============================================================================

import { DatabaseService } from '../database/index';
import { MunicipioService } from './municipioService';
import { AnaliseService } from './analiseService';

export interface IEGMServices {
  municipio: MunicipioService;
  analise: AnaliseService;
}

export const createIEGMServices = (dbService: DatabaseService): IEGMServices => {
  return {
    municipio: new MunicipioService(dbService),
    analise: new AnaliseService(dbService)
  };
};
 