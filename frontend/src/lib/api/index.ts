import { request } from '@/lib/api/client'
import type {
  Alerta,
  AlertaNovo,
  Cadastro,
  Carga,
  CargaNova,
  Cargo,
  Credenciais,
  Dashboard,
  Linha,
  PerfilEdicao,
  Usuario,
  UsuarioEdicao,
  UsuarioNovo,
} from '@/lib/api/types'

export { ApiError, marcarErrosDeCampo } from '@/lib/api/client'
export type { ErroBody, ErroValidacao } from '@/lib/api/client'
export type * from '@/lib/api/types'

export const api = {
  auth: {
    login: (dados: Credenciais) => request<Usuario>('POST', '/auth/login', dados),
    logout: () => request<undefined>('POST', '/auth/logout'),
    me: () => request<Usuario>('GET', '/auth/me'),
    atualizarMe: (dados: PerfilEdicao) => request<Usuario>('PATCH', '/auth/me', dados),
    cadastro: (dados: Cadastro) => request<Usuario>('POST', '/auth/cadastro', dados),
    recuperarSenha: (email: string) =>
      request<{ detail: string }>('POST', '/auth/recuperar-senha', { email }),
  },
  usuarios: {
    listar: () => request<Usuario[]>('GET', '/usuarios'),
    criar: (dados: UsuarioNovo) => request<Usuario>('POST', '/usuarios', dados),
    atualizar: (id: number, dados: UsuarioEdicao) =>
      request<Usuario>('PATCH', `/usuarios/${String(id)}`, dados),
    desativar: (id: number) => request<undefined>('DELETE', `/usuarios/${String(id)}`),
  },
  cargos: {
    listar: () => request<Cargo[]>('GET', '/cargos'),
  },
  linhas: {
    listar: () => request<Linha[]>('GET', '/linhas'),
  },
  cargas: {
    listar: () => request<Carga[]>('GET', '/cargas'),
    criar: (dados: CargaNova) => request<Carga>('POST', '/cargas', dados),
  },
  alertas: {
    listar: () => request<Alerta[]>('GET', '/alertas'),
    criar: (dados: AlertaNovo) => request<Alerta>('POST', '/alertas', dados),
  },
  dashboard: {
    obter: () => request<Dashboard>('GET', '/dashboard'),
  },
}
