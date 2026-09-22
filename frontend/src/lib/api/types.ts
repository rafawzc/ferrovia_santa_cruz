export type Papel = 'cliente' | 'operacional' | 'gestao'

export interface Usuario {
  id: number
  nome: string
  email: string
  telefone: string | null
  foto_url: string | null
  cargo: string
  papel: Papel
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

export interface Cargo {
  id: number
  nome: string
  papel: Papel
}

export type LinhaStatus = 'manutencao' | 'atraso' | 'fechado' | 'na_estacao' | 'ja_partiu'

export interface Linha {
  id: number
  numero: string
  status: LinhaStatus
  ativo: boolean
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

export interface AlertaNovo {
  linha_id: number
  tempo_espera?: string
  motivo: string
  status: string
}

export interface Alerta extends Omit<AlertaNovo, 'tempo_espera'> {
  id: number
  linha_numero: string
  tempo_espera: string | null
  criado_em: string
}

export interface Dashboard {
  linhas_ativas: number
  linhas_em_manutencao: number
  sensores: number
  velocidade_media: number | null
}
