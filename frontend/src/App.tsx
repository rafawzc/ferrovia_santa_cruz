import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { PageShell } from '@/components/ui/page-shell'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/contexts/AuthContext'
import type { Papel } from '@/lib/api'

const Login = lazy(() => import('@/pages/auth/Login'))
const Cadastro = lazy(() => import('@/pages/auth/Cadastro'))
const RecuperarSenha = lazy(() => import('@/pages/auth/RecuperarSenha'))
const Dashboard = lazy(() => import('@/pages/admin/Dashboard.jsx'))
const UsuariosLista = lazy(() => import('@/pages/admin/UsuariosLista.jsx'))
const UsuarioDetalhe = lazy(() => import('@/pages/admin/UsuarioDetalhe.jsx'))
const UsuarioEditar = lazy(() => import('@/pages/admin/UsuarioEditar.jsx'))
const CargaLista = lazy(() => import('@/pages/admin/CargaLista.jsx'))
const Linhas = lazy(() => import('@/pages/admin/Linhas.jsx'))
const Alertas = lazy(() => import('@/pages/admin/Alertas.jsx'))
const Perfil = lazy(() => import('@/pages/Perfil.jsx'))
const Vitrine = lazy(() => import('@/pages/Vitrine'))

const EQUIPE: Papel[] = ['operacional', 'gestao']
const GESTAO: Papel[] = ['gestao']

function inicioDo(papel: Papel) {
  return papel === 'cliente' ? '/perfil' : '/admin'
}

function PublicLayout() {
  const { usuario, carregando } = useAuth()
  const location = useLocation()
  if (carregando) return null
  if (usuario) {
    const destino = (location.state as { de?: string } | null)?.de ?? inicioDo(usuario.papel)
    return <Navigate to={destino} replace />
  }
  return <Outlet />
}

function ProtectedLayout() {
  const { usuario, carregando } = useAuth()
  const location = useLocation()
  if (carregando) return null
  if (!usuario) {
    return <Navigate to="/login" replace state={{ de: location.pathname + location.search }} />
  }
  return (
    <PageShell>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </PageShell>
  )
}

function Papeis({ papeis }: { papeis: Papel[] }) {
  const { usuario } = useAuth()
  if (usuario && !papeis.includes(usuario.papel)) {
    return <Navigate to={inicioDo(usuario.papel)} replace />
  }
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          </Route>
          <Route element={<ProtectedLayout />}>
            <Route element={<Papeis papeis={EQUIPE} />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/rotas" element={<Linhas />} />
              <Route path="/admin/carga" element={<CargaLista />} />
              <Route path="/admin/alertas" element={<Alertas />} />
            </Route>
            <Route element={<Papeis papeis={GESTAO} />}>
              <Route path="/admin/usuarios" element={<UsuariosLista />} />
              <Route path="/admin/usuarios/:id" element={<UsuarioDetalhe />} />
              <Route path="/admin/usuarios/:id/editar" element={<UsuarioEditar />} />
            </Route>
            <Route path="/perfil" element={<Perfil />} />
          </Route>
          <Route path="/ui" element={<Vitrine />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
