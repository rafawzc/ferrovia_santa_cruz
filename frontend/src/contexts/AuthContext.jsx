import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const CARGOS_GESTAO = ['admin', 'administracao', 'rh']

const usuarioSimulado = {
  id: 1,
  nome: 'Ana Gestora',
  email: 'ana.admin@ferrovia.com',
  cargo: 'admin',
}

export function AuthProvider({ children }) {
  const [usuario] = useState(usuarioSimulado)

  const isGestao = CARGOS_GESTAO.includes(usuario.cargo)

  return (
    <AuthContext.Provider value={{ usuario, isGestao }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
