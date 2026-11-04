export type Papel = 'cliente' | 'operacional' | 'gestao'

export interface Usuario {
  id: number
  nome: string
  email: string
  telefone: string | null
  foto_url: string | null
  cargo: string
  papel: Papel
  trem_id: number | null
  ativo: boolean
}

export interface Credenciais {
  email: string
  senha: string
}

export interface Cadastro {
  nome: string
  email: string
  senha: string
}

export interface UsuarioNovo extends Cadastro {
  cargo_id: number
  telefone?: string
}

export type UsuarioEdicao = Partial<UsuarioNovo & { ativo: boolean }>

export type PerfilEdicao = Partial<
  Pick<Usuario, 'nome' | 'email'> & { telefone: string; senha: string; senha_atual: string }
>

export interface SenhaTemporaria {
  senha_temporaria: string
}

export interface Cargo {
  id: number
  nome: string
  papel: Papel
}

export type LinhaStatus = 'manutencao' | 'atraso' | 'fechado' | 'na_estacao' | 'ja_partiu'

export interface LinhaNova {
  numero: string
  origem: string
  destino: string
  status: LinhaStatus
  ativo?: boolean
}

export interface Linha extends Omit<LinhaNova, 'ativo'> {
  id: number
  ativo: boolean
}

export type LinhaEdicao = Partial<LinhaNova>

export type TremStatus = 'ativo' | 'manutencao' | 'parado'

export interface TremNovo {
  prefixo: string
  modelo: string
  ano: number
  capacidade_t: number
  status?: TremStatus
  ultima_inspecao?: string | null
  linha_id?: number | null
}

export interface Trem extends Omit<TremNovo, 'status' | 'ultima_inspecao' | 'linha_id'> {
  id: number
  status: TremStatus
  ultima_inspecao: string | null
  linha_id: number | null
  linha_numero: string | null
  total_sensores: number
}

export type TremEdicao = Partial<TremNovo>

export type FiltroTrens = {
  busca?: string
  status?: TremStatus
}

export type FiltroUsuarios = {
  busca?: string
  papel?: Papel
  ativo?: boolean
}

export type TipoSensor = 'velocidade' | 'temperatura' | 'falha' | 'energia' | 'localizacao'

export type StatusOperacional = 'normal' | 'alerta' | 'falha'

export interface SensorNovo {
  codigo: string
  nome: string
  tipo_dado: TipoSensor
  localizacao: string
  segmento?: string | null
  trem_id: number
}

export interface Sensor extends Omit<SensorNovo, 'segmento'> {
  id: number
  segmento: string | null
  trem_prefixo: string
  trem_modelo: string
  ultima_leitura_status: StatusOperacional | null
  ultima_leitura_valor: number | null
  ultima_leitura_data: string | null
}

export type SensorEdicao = Partial<SensorNovo>

export type FiltroSensores = {
  tipo?: TipoSensor
  trem_id?: number
}

export type ViagemStatus = 'programada' | 'em_andamento' | 'concluida' | 'cancelada' | 'atrasada'

export interface ViagemNova {
  linha_id: number
  trem_id: number
  partida_prevista: string
  chegada_prevista: string
  status?: ViagemStatus
}

export interface Viagem extends Omit<ViagemNova, 'status'> {
  id: number
  linha_numero: string
  origem: string
  destino: string
  trem_prefixo: string
  status: ViagemStatus
  criado_em: string
}

export type ViagemEdicao = Partial<ViagemNova>

export type FiltroViagens = {
  status?: ViagemStatus
  trem_id?: number
  linha_id?: number
  data?: string
}

export interface CargaNova {
  tipo: string
  peso_t: number
  local_partida: string
  destino: string
  vagao?: string
  trem_id?: number
}

export interface Carga extends Omit<CargaNova, 'vagao' | 'trem_id'> {
  id: number
  vagao: string | null
  trem_id: number | null
  criado_em: string
}

export type Severidade = 'normal' | 'atencao' | 'critico'

export interface AlertaNovo {
  linha_id: number
  tipo: string
  severidade?: Severidade
  tempo_espera?: string
  motivo: string
  status: string
}

export interface Alerta extends Omit<AlertaNovo, 'linha_id' | 'severidade' | 'tempo_espera'> {
  id: number
  linha_id: number | null
  linha_numero: string | null
  leitura_id: number | null
  severidade: Severidade
  tempo_espera: string | null
  tratado: boolean
  criado_em: string
}

export type FiltroAlertas = {
  severidade?: Severidade
  tipo?: string
  tratado?: boolean
}

export interface Leitura {
  id: number
  sensor_id: number
  sensor_codigo: string
  trem_prefixo: string
  valor: number
  status_operacional: StatusOperacional
  data_hora: string
}

export type FiltroLeituras = {
  sensor_id?: number
  limite?: number
}

export interface ContagemPorStatus {
  status: TremStatus
  quantidade: number
}

export interface ContagemPorSeveridade {
  severidade: Severidade
  quantidade: number
}

export interface Dashboard {
  trens_por_status: ContagemPorStatus[] | null
  alertas_ativos_por_severidade: ContagemPorSeveridade[] | null
  sensores_criticos: number | null
  viagens_em_andamento: number
  velocidade_media: number | null
}

export type TipoRelatorio = 'desempenho' | 'consumo' | 'eficiencia' | 'manutencao'

export interface ColunaDeRelatorio {
  chave: string
  rotulo: string
}

export interface ItemDeGrafico {
  rotulo: string
  valor: number
}

export type CelulaDeRelatorio = string | number | null

export interface Relatorio {
  tipo: TipoRelatorio
  inicio: string
  fim: string
  trem_id: number | null
  colunas: ColunaDeRelatorio[]
  linhas: Record<string, CelulaDeRelatorio>[]
  grafico: { rotulo: string; itens: ItemDeGrafico[] }
}

export type FiltroRelatorio = {
  tipo: TipoRelatorio
  inicio: string
  fim: string
  trem_id?: number
}
