import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Cadastro from './pages/auth/Cadastro'
import RecuperarSenha from './pages/auth/RecuperarSenha'

function DashboardPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-texto1 mb-2">Dashboard</h1>
        <p className="text-texto1/60">Página em construção</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/admin" element={<DashboardPlaceholder />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
