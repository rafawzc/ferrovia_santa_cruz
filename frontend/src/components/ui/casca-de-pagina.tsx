import type { ReactNode } from 'react'
import {
  AlertTriangle,
  Box,
  CircleUserRound,
  FileText,
  LayoutGrid,
  LogOut,
  Radio,
  Route,
  Train,
  User,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAutenticacao } from '@/contexts/Autenticacao'
import type { Papel } from '@/lib/api'
import { rotuloDeCargo } from '@/lib/rotulos'
import { cn } from '@/lib/utils'

const EQUIPE: Papel[] = ['operacional', 'gestao']
const GESTAO: Papel[] = ['gestao']
const CLIENTE: Papel[] = ['cliente']
const TODOS: Papel[] = ['cliente', 'operacional', 'gestao']

const NAV = [
  { icon: LayoutGrid, label: 'Início', path: '/admin', papeis: EQUIPE },
  { icon: Train, label: 'Trens', path: '/admin/trens', papeis: EQUIPE },
  { icon: Radio, label: 'Sensores', path: '/admin/sensores', papeis: EQUIPE },
  { icon: Route, label: 'Rotas', path: '/admin/rotas', papeis: EQUIPE },
  { icon: AlertTriangle, label: 'Alertas', path: '/admin/alertas', papeis: EQUIPE },
  { icon: Box, label: 'Carga', path: '/admin/carga', papeis: EQUIPE },
  { icon: FileText, label: 'Relatórios', path: '/admin/relatorios', papeis: GESTAO },
  { icon: User, label: 'Usuários', path: '/admin/usuarios', papeis: GESTAO },
  { icon: Train, label: 'Viagens', path: '/viagens', papeis: CLIENTE },
  { icon: CircleUserRound, label: 'Perfil', path: '/perfil', papeis: TODOS },
]

function Identificacao() {
  const { usuario, sair } = useAutenticacao()
  if (!usuario) return null
  return (
    <header className="nao-imprime border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <p className="min-w-0 flex-1 text-sm">
          Conectado como <span className="font-semibold">{usuario.nome}</span>
          <span className="block text-xs opacity-80 sm:inline sm:opacity-100">
            <span className="hidden sm:inline"> · </span>
            {rotuloDeCargo(usuario.cargo)}
          </span>
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={sair.isPending}
          onClick={() => {
            sair.mutate(undefined, {
              onError: () => toast.error('Não foi possível sair. Tente de novo.'),
            })
          }}
        >
          <LogOut className="size-4" aria-hidden />
          Sair
        </Button>
      </div>
    </header>
  )
}

function Dock() {
  const { usuario } = useAutenticacao()
  if (!usuario) return null
  const itens = NAV.filter(({ papeis }) => papeis.includes(usuario.papel))
  return (
    <nav
      aria-label="Navegação principal"
      className="nao-imprime fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-3 perspective-normal"
    >
      <ul className="flex max-w-full rotate-x-8 items-center gap-1 overflow-x-auto rounded-full bg-primary p-1.5 shadow-lg">
        {itens.map(({ icon: Icon, label, path }) => (
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
  )
}

export function CascaDePagina({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background pb-28 text-foreground">
      <Identificacao />
      <main className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">{children}</main>
      <Dock />
    </div>
  )
}
