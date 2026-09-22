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
    <nav className="fixed right-0 bottom-0 left-0 z-50 flex justify-center px-4 pb-3">
      <div
        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-componente1 px-3 py-2 shadow-lg outline-hidden"
        style={{ transform: 'perspective(600px) rotateX(8deg)', willChange: 'transform' }}
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
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl outline-hidden transition-colors duration-200 ${
                  isHovered
                    ? 'bg-componente3'
                    : active
                      ? 'bg-componente3'
                      : 'bg-transparent hover:bg-componente3/50'
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-colors ${active ? 'text-texto1' : 'text-texto2'}`}
                />
              </button>
              {active && <div className="mt-1 h-1.5 w-1.5 rounded-full bg-texto2" />}
              {isHovered && (
                <div className="absolute -top-8 rounded-sm bg-componente3 px-2 py-1 text-xs whitespace-nowrap text-texto1">
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
