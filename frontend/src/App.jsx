import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Cadastro from './pages/auth/Cadastro'
import RecuperarSenha from './pages/auth/RecuperarSenha'
import Dashboard from './pages/admin/Dashboard'
import UsuariosLista from './pages/admin/UsuariosLista'
import UsuarioDetalhe from './pages/admin/UsuarioDetalhe'
import UsuarioEditar from './pages/admin/UsuarioEditar'
import CargaLista from './pages/admin/CargaLista'
import Linhas from './pages/admin/Linhas'
import Alertas from './pages/admin/Alertas'
import Perfil from './pages/Perfil'
import ThemeToggle from './components/ThemeToggle/ThemeToggle'

export default function App() {
  return (
    <BrowserRouter>
      <div className="fixed top-4 right-4 z-[100]">
        <ThemeToggle />
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/funcionarios" element={<UsuariosLista />} />
        <Route path="/admin/funcionarios/:id" element={<UsuarioDetalhe />} />
        <Route path="/admin/funcionarios/:id/editar" element={<UsuarioEditar />} />
        <Route path="/admin/carga" element={<CargaLista />} />
        <Route path="/admin/linhas" element={<Linhas />} />
        <Route path="/admin/alertas" element={<Alertas />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
