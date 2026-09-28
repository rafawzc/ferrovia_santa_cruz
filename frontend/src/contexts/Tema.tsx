import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface ValorDoTema {
  escuro: boolean
  alternarTema: () => void
}

const ContextoDeTema = createContext<ValorDoTema | null>(null)

export function ProvedorDeTema({ children }: { children: ReactNode }) {
  const [escuro, setEscuro] = useState(() => localStorage.getItem('tema') === 'escuro')

  useEffect(() => {
    const raiz = document.documentElement
    raiz.classList.remove('claro', 'escuro')
    raiz.classList.add(escuro ? 'escuro' : 'claro')
    localStorage.setItem('tema', escuro ? 'escuro' : 'claro')
  }, [escuro])

  const alternarTema = () => {
    setEscuro((anterior) => !anterior)
  }

  return (
    <ContextoDeTema.Provider value={{ escuro, alternarTema }}>{children}</ContextoDeTema.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTema() {
  const contexto = useContext(ContextoDeTema)
  if (!contexto) {
    throw new Error('useTema deve ser usado dentro de um ProvedorDeTema')
  }
  return contexto
}
