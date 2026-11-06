import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AlternadorDeTema } from '@/components/ui/alternador-de-tema'
import { CascaDePagina } from '@/components/ui/casca-de-pagina'
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

function LayoutPublico() {
  const { usuario, carregando } = useAutenticacao()
  const rota = useLocation()
  if (carregando) return null
  if (!usuario) return <Outlet />

  const destino = (rota.state as { de?: string } | null)?.de ?? inicioDo(usuario.papel)
  return <Navigate to={destino} replace />
}

function LayoutProtegido() {
  const { usuario, carregando } = useAutenticacao()
  const rota = useLocation()
  if (carregando) return null
  if (!usuario) {
    return <Navigate to="/login" replace state={{ de: rota.pathname + rota.search }} />
  }
  return (
    <CascaDePagina>
      <Suspense fallback={null}>
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
      <div className="nao-imprime fixed top-4 right-4 z-50">
        <AlternadorDeTema />
      </div>
      <Suspense fallback={null}>
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
