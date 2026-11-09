import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AlternadorDeTema } from '@/components/ui/alternador-de-tema'
import { CascaDePagina, Marca } from '@/components/ui/casca-de-pagina'
import { Skeleton } from '@/components/ui/skeleton'
import { useAutenticacao } from '@/contexts/Autenticacao'
import type { Papel } from '@/lib/api'

const Login = lazy(() => import('@/pages/autenticacao/Login'))
const Cadastro = lazy(() => import('@/pages/autenticacao/Cadastro'))
const RecuperarSenha = lazy(() => import('@/pages/autenticacao/RecuperarSenha'))
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'))
const UsuariosLista = lazy(() => import('@/pages/admin/UsuariosLista'))
const CargaLista = lazy(() => import('@/pages/admin/CargaLista'))
const Rotas = lazy(() => import('@/pages/admin/Rotas'))
const Alertas = lazy(() => import('@/pages/admin/Alertas'))
const Trens = lazy(() => import('@/pages/admin/Trens'))
const Sensores = lazy(() => import('@/pages/admin/Sensores'))
const Relatorios = lazy(() => import('@/pages/admin/Relatorios'))
const RelatorioVisualizacao = lazy(() => import('@/pages/admin/RelatorioVisualizacao'))
const Viagens = lazy(() => import('@/pages/Viagens'))
const Perfil = lazy(() => import('@/pages/Perfil'))
const Vitrine = lazy(() => import('@/pages/Vitrine'))

const EQUIPE: Papel[] = ['operacional', 'gestao']
const GESTAO: Papel[] = ['gestao']

function inicioDo(papel: Papel) {
  return papel === 'cliente' ? '/viagens' : '/admin'
}

function Abertura() {
  return (
    <div
      role="status"
      className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-4 text-foreground"
    >
      <Marca />
      <div className="flex w-full max-w-xs flex-col items-center gap-3">
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-2/3 rounded-full" />
      </div>
      <span className="sr-only">Abrindo a Ferrovia Santa Cruz</span>
    </div>
  )
}

function EsqueletoDeTela() {
  return (
    <div role="status" className="flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <Skeleton className="h-8 w-56 lg:h-9 lg:w-72" />
        <Skeleton className="h-11 w-full rounded-full sm:w-44" />
      </div>
      <Skeleton className="h-64 w-full" />
      <span className="sr-only">Carregando a tela</span>
    </div>
  )
}

function LayoutPublico() {
  const { usuario, carregando } = useAutenticacao()
  const rota = useLocation()
  if (carregando) return <Abertura />
  if (!usuario) {
    return (
      <>
        <div className="nao-imprime fixed top-4 right-4 z-50 rounded-full bg-popover px-3 py-2 text-popover-foreground shadow-lg">
          <AlternadorDeTema />
        </div>
        <Outlet />
      </>
    )
  }

  const destino = (rota.state as { de?: string } | null)?.de ?? inicioDo(usuario.papel)
  return <Navigate to={destino} replace />
}

function LayoutProtegido() {
  const { usuario, carregando } = useAutenticacao()
  const rota = useLocation()
  if (carregando) return <Abertura />
  if (!usuario) {
    return <Navigate to="/login" replace state={{ de: rota.pathname + rota.search }} />
  }
  return (
    <CascaDePagina>
      <Suspense fallback={<EsqueletoDeTela />}>
        <Outlet />
      </Suspense>
    </CascaDePagina>
  )
}

function Papeis({ papeis }: { papeis: Papel[] }) {
  const { usuario } = useAutenticacao()
  const papelSemAcesso = usuario !== null && !papeis.includes(usuario.papel)
  if (papelSemAcesso) return <Navigate to={inicioDo(usuario.papel)} replace />
  return <Outlet />
}

export default function Aplicacao() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Abertura />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route element={<LayoutPublico />}>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          </Route>
          <Route element={<LayoutProtegido />}>
            <Route element={<Papeis papeis={EQUIPE} />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/trens" element={<Trens />} />
              <Route path="/admin/sensores" element={<Sensores />} />
              <Route path="/admin/rotas" element={<Rotas />} />
              <Route path="/admin/carga" element={<CargaLista />} />
              <Route path="/admin/alertas" element={<Alertas />} />
            </Route>
            <Route element={<Papeis papeis={GESTAO} />}>
              <Route path="/admin/usuarios" element={<UsuariosLista />} />
              <Route path="/admin/relatorios" element={<Relatorios />} />
              <Route path="/admin/relatorios/ver" element={<RelatorioVisualizacao />} />
            </Route>
            <Route path="/viagens" element={<Viagens />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>
          <Route path="/ui" element={<Vitrine />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
