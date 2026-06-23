import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutGrid, Box, BarChart3, AlertTriangle, User } from 'lucide-react'

const navItems = [
  { icon: LayoutGrid, label: 'Início', path: '/admin' },
  { icon: Box, label: 'Carga', path: '/admin/carga' },
  { icon: BarChart3, label: 'Linhas', path: '/admin/linhas' },
  { icon: AlertTriangle, label: 'Alertas', path: '/admin/alertas' },
  { icon: User, label: 'Funcionários', path: '/admin/funcionarios' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4">
      <div className="flex items-center gap-1 bg-componente1 rounded-full px-2 py-2 shadow-lg">
        {navItems.map((item) => {
          const active = isActive(item.path)
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 transition-all duration-200 cursor-pointer ${
                active
                  ? 'bg-componente3 text-texto1 font-semibold'
                  : 'text-texto2 hover:bg-componente1/80'
              }`}
            >
              <Icon size={20} />
              {active && <span className="text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
