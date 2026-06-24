import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutGrid, Box, BarChart3, AlertTriangle, User, CircleUserRound } from 'lucide-react'

const navItems = [
  { icon: LayoutGrid, label: 'Início', path: '/admin' },
  { icon: Box, label: 'Carga', path: '/admin/carga' },
  { icon: BarChart3, label: 'Linhas', path: '/admin/linhas' },
  { icon: AlertTriangle, label: 'Alertas', path: '/admin/alertas' },
  { icon: User, label: 'Funcionários', path: '/admin/funcionarios' },
  { icon: CircleUserRound, label: 'Perfil', path: '/perfil' },
]

export default function BottomNav() {
  const [hovered, setHovered] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4">
      <div
        className="flex items-end gap-3 px-4 py-3 rounded-3xl border bg-componente1/90 backdrop-blur-sm shadow-lg"
        style={{ transform: 'perspective(600px) rotateX(8deg)' }}
      >
        {navItems.map((item, i) => {
          const active = isActive(item.path)
          const isHovered = hovered === i
          const Icon = item.icon

          return (
            <div
              key={item.path}
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <button
                onClick={() => navigate(item.path)}
                className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${
                  isHovered
                    ? 'bg-componente3 scale-110 shadow-lg shadow-componente3/30'
                    : active
                    ? 'bg-componente3'
                    : 'bg-transparent hover:bg-componente3/50'
                }`}
              >
                <Icon
                  size={24}
                  className={`transition-colors ${
                    active ? 'text-texto1' : 'text-texto2'
                  }`}
                />
                {isHovered && (
                  <span className="absolute inset-0 rounded-2xl border border-texto2/30" />
                )}
              </button>
              {active && (
                <div className="w-1.5 h-1.5 rounded-full bg-texto2 mt-1" />
              )}
              {isHovered && (
                <div className="absolute -top-8 px-2 py-1 bg-texto1 text-texto2 text-xs rounded whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
