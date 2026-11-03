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
  FiltroAlertas,
  FiltroLeituras,
  FiltroRelatorio,
  FiltroSensores,
  FiltroTrens,
  FiltroViagens,
  Leitura,
  Linha,
  LinhaEdicao,
  LinhaNova,
  LinhaStatus,
  PerfilEdicao,
  Relatorio,
  SenhaTemporaria,
  Sensor,
  SensorEdicao,
  SensorNovo,
  Trem,
  TremEdicao,
  TremNovo,
  Usuario,
  UsuarioEdicao,
  UsuarioNovo,
  Viagem,
  ViagemEdicao,
  ViagemNova,
} from '@/lib/api/types'

export { ApiError, tratouErrosDeCampo } from '@/lib/api/client'
export type { ErroBody, ErroValidacao } from '@/lib/api/client'
export type * from '@/lib/api/types'

type Filtro = Record<string, string | number | boolean | undefined>

function comFiltro(caminho: string, filtro: Filtro = {}): string {
  const parametros = new URLSearchParams()
  for (const [chave, valor] of Object.entries(filtro)) {
    if (valor !== undefined && valor !== '') parametros.set(chave, String(valor))
  }
  const consulta = parametros.toString()
  return consulta ? `${caminho}?${consulta}` : caminho
}

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
    senhaTemporaria: (id: number) =>
      requisitar<SenhaTemporaria>('POST', `/usuarios/${String(id)}/senha-temporaria`),
  },
  cargos: {
    listar: () => requisitar<Cargo[]>('GET', '/cargos'),
  },
  linhas: {
    listar: (status?: LinhaStatus) => requisitar<Linha[]>('GET', comFiltro('/linhas', { status })),
    criar: (linha: LinhaNova) => requisitar<Linha>('POST', '/linhas', linha),
    atualizar: (id: number, linha: LinhaEdicao) =>
      requisitar<Linha>('PATCH', `/linhas/${String(id)}`, linha),
    excluir: (id: number) => requisitar<undefined>('DELETE', `/linhas/${String(id)}`),
  },
  trens: {
    listar: (filtro?: FiltroTrens) => requisitar<Trem[]>('GET', comFiltro('/trens', filtro)),
    obter: (id: number) => requisitar<Trem>('GET', `/trens/${String(id)}`),
    criar: (trem: TremNovo) => requisitar<Trem>('POST', '/trens', trem),
    atualizar: (id: number, trem: TremEdicao) =>
      requisitar<Trem>('PATCH', `/trens/${String(id)}`, trem),
    excluir: (id: number) => requisitar<undefined>('DELETE', `/trens/${String(id)}`),
  },
  sensores: {
    listar: (filtro?: FiltroSensores) =>
      requisitar<Sensor[]>('GET', comFiltro('/sensores', filtro)),
    obter: (id: number) => requisitar<Sensor>('GET', `/sensores/${String(id)}`),
    criar: (sensor: SensorNovo) => requisitar<Sensor>('POST', '/sensores', sensor),
    atualizar: (id: number, sensor: SensorEdicao) =>
      requisitar<Sensor>('PATCH', `/sensores/${String(id)}`, sensor),
    excluir: (id: number) => requisitar<undefined>('DELETE', `/sensores/${String(id)}`),
  },
  viagens: {
    listar: (filtro?: FiltroViagens) => requisitar<Viagem[]>('GET', comFiltro('/viagens', filtro)),
    criar: (viagem: ViagemNova) => requisitar<Viagem>('POST', '/viagens', viagem),
    atualizar: (id: number, viagem: ViagemEdicao) =>
      requisitar<Viagem>('PATCH', `/viagens/${String(id)}`, viagem),
    excluir: (id: number) => requisitar<undefined>('DELETE', `/viagens/${String(id)}`),
  },
  cargas: {
    listar: () => requisitar<Carga[]>('GET', '/cargas'),
    criar: (carga: CargaNova) => requisitar<Carga>('POST', '/cargas', carga),
  },
  alertas: {
    listar: (filtro?: FiltroAlertas) => requisitar<Alerta[]>('GET', comFiltro('/alertas', filtro)),
    criar: (alerta: AlertaNovo) => requisitar<Alerta>('POST', '/alertas', alerta),
    tratar: (id: number, tratado: boolean) =>
      requisitar<Alerta>('PATCH', `/alertas/${String(id)}`, { tratado }),
  },
  leituras: {
    listar: (filtro?: FiltroLeituras) =>
      requisitar<Leitura[]>('GET', comFiltro('/leituras', filtro)),
  },
  relatorios: {
    gerar: (filtro: FiltroRelatorio) =>
      requisitar<Relatorio>('GET', comFiltro('/relatorios', { ...filtro })),
    enderecoCsv: (filtro: FiltroRelatorio) => `/api${comFiltro('/relatorios/csv', { ...filtro })}`,
  },
  dashboard: {
    obter: () => requisitar<Dashboard>('GET', '/dashboard'),
  },
}
