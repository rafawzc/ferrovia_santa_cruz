import { requisitar } from '@/lib/api/client'
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

export { ApiError, tratouErrosDeCampo } from '@/lib/api/client'
export type { ErroBody, ErroValidacao } from '@/lib/api/client'
export type * from '@/lib/api/types'

export const api = {
  autenticacao: {
    login: (credenciais: Credenciais) => requisitar<Usuario>('POST', '/auth/login', credenciais),
    logout: () => requisitar<undefined>('POST', '/auth/logout'),
    me: () => requisitar<Usuario>('GET', '/auth/me'),
    atualizarMe: (perfil: PerfilEdicao) => requisitar<Usuario>('PATCH', '/auth/me', perfil),
    cadastro: (cadastro: Cadastro) => requisitar<Usuario>('POST', '/auth/cadastro', cadastro),
    recuperarSenha: (email: string) =>
      requisitar<{ detail: string }>('POST', '/auth/recuperar-senha', { email }),
  },
  usuarios: {
    listar: () => requisitar<Usuario[]>('GET', '/usuarios'),
    criar: (usuario: UsuarioNovo) => requisitar<Usuario>('POST', '/usuarios', usuario),
    atualizar: (id: number, usuario: UsuarioEdicao) =>
      requisitar<Usuario>('PATCH', `/usuarios/${String(id)}`, usuario),
    desativar: (id: number) => requisitar<undefined>('DELETE', `/usuarios/${String(id)}`),
  },
  cargos: {
    listar: () => requisitar<Cargo[]>('GET', '/cargos'),
  },
  linhas: {
    listar: () => requisitar<Linha[]>('GET', '/linhas'),
  },
  cargas: {
    listar: () => requisitar<Carga[]>('GET', '/cargas'),
    criar: (carga: CargaNova) => requisitar<Carga>('POST', '/cargas', carga),
  },
  alertas: {
    listar: () => requisitar<Alerta[]>('GET', '/alertas'),
    criar: (alerta: AlertaNovo) => requisitar<Alerta>('POST', '/alertas', alerta),
  },
  dashboard: {
    obter: () => requisitar<Dashboard>('GET', '/dashboard'),
  },
}
