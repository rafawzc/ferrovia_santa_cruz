import type { TipoRelatorio } from '@/lib/api'

const CARGOS: Record<string, string> = {
  comum: 'Usuário comum',
  admin: 'Administrador',
  administracao: 'Administração',
  rh: 'RH',
  maquinista: 'Maquinista',
  auxiliar_maquinista: 'Auxiliar de Maquinista',
  agente_trem: 'Agente de Trem',
  manutencao: 'Manutenção',
  engenharia_mecanica: 'Engenharia Mecânica',
  eletricista: 'Eletricista',
}

export const rotuloDeCargo = (slug: string) => CARGOS[slug] ?? slug

const TIPOS_DE_RELATORIO: Record<TipoRelatorio, string> = {
  desempenho: 'Desempenho',
  consumo: 'Consumo de energia',
  eficiencia: 'Eficiência operacional',
  manutencao: 'Manutenção',
}

export const rotuloDeTipoDeRelatorio = (tipo: TipoRelatorio) => TIPOS_DE_RELATORIO[tipo]

export const opcoesDeTipoDeRelatorio = (Object.keys(TIPOS_DE_RELATORIO) as TipoRelatorio[]).map(
  (valor) => ({ valor, rotulo: TIPOS_DE_RELATORIO[valor] }),
)
