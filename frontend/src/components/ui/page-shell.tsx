import type { ReactNode } from 'react'
import { AlertTriangle, BarChart3, Box, CircleUserRound, LayoutGrid, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const NAV = [
  { icon: LayoutGrid, label: 'Início', path: '/admin' },
  { icon: Box, label: 'Carga', path: '/admin/carga' },
  { icon: BarChart3, label: 'Linhas', path: '/admin/linhas' },
  { icon: AlertTriangle, label: 'Alertas', path: '/admin/alertas' },
  { icon: User, label: 'Funcionários', path: '/admin/funcionarios' },
  { icon: CircleUserRound, label: 'Perfil', path: '/perfil' },
]

function Dock() {
  return (
    <TooltipProvider>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-3 perspective-normal"
      >
        <ul className="flex rotate-x-8 items-center gap-1 rounded-full bg-primary p-1.5 shadow-lg">
          {NAV.map(({ icon: Icon, label, path }) => (
            <li key={path}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to={path}
                    end={path === '/admin'}
                    className={({ isActive }) =>
                      cn(
                        'flex h-11 items-center gap-2 rounded-full px-3 text-primary-foreground transition-colors hover:bg-primary-foreground/15',
                        isActive && 'bg-muted text-foreground hover:bg-muted',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className="size-5" aria-hidden />
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            isActive ? 'max-[380px]:sr-only' : 'sr-only',
                          )}
                        >
                          {label}
                        </span>
                      </>
                    )}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="top">{label}</TooltipContent>
              </Tooltip>
            </li>
          ))}
        </ul>
      </nav>
    </TooltipProvider>
  )
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background pb-28 text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">{children}</main>
      <Dock />
    </div>
  )
}
