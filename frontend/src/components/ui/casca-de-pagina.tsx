import { useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  Boxes,
  CircleUserRound,
  FileText,
  LayoutGrid,
  LogOut,
  Menu,
  Radio,
  Route,
  Train,
  TrainFront,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { toast } from 'sonner'
import { AlternadorDeTema } from '@/components/ui/alternador-de-tema'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAutenticacao } from '@/contexts/Autenticacao'
import type { Papel } from '@/lib/api'
import { rotuloDeCargo } from '@/lib/rotulos'
import { cn } from '@/lib/utils'

const EQUIPE: Papel[] = ['operacional', 'gestao']
const GESTAO: Papel[] = ['gestao']
const CLIENTE: Papel[] = ['cliente']
const TODOS: Papel[] = ['cliente', 'operacional', 'gestao']

interface ItemDeNavegacao {
  icon: LucideIcon
  label: string
  path: string
  papeis: Papel[]
  dock?: boolean
}

interface GrupoDeNavegacao {
  titulo?: string
  itens: ItemDeNavegacao[]
}

const GRUPOS: GrupoDeNavegacao[] = [
  {
    itens: [
      { icon: LayoutGrid, label: 'Início', path: '/admin', papeis: EQUIPE, dock: true },
      { icon: Train, label: 'Viagens', path: '/viagens', papeis: CLIENTE, dock: true },
    ],
  },
  {
    titulo: 'Operação',
    itens: [
      { icon: Route, label: 'Rotas', path: '/admin/rotas', papeis: EQUIPE, dock: true },
      { icon: AlertTriangle, label: 'Alertas', path: '/admin/alertas', papeis: EQUIPE, dock: true },
      { icon: Boxes, label: 'Carga', path: '/admin/carga', papeis: EQUIPE },
    ],
  },
  {
    titulo: 'Frota',
    itens: [
      { icon: Train, label: 'Trens', path: '/admin/trens', papeis: EQUIPE },
      { icon: Radio, label: 'Sensores', path: '/admin/sensores', papeis: EQUIPE },
    ],
  },
  {
    titulo: 'Gestão',
    itens: [
      { icon: FileText, label: 'Relatórios', path: '/admin/relatorios', papeis: GESTAO },
      { icon: Users, label: 'Usuários', path: '/admin/usuarios', papeis: GESTAO },
    ],
  },
  {
    titulo: 'Conta',
    itens: [{ icon: CircleUserRound, label: 'Perfil', path: '/perfil', papeis: TODOS, dock: true }],
  },
]

function gruposDoPapel(papel: Papel) {
  return GRUPOS.map(({ titulo, itens }) => ({
    titulo,
    itens: itens.filter(({ papeis }) => papeis.includes(papel)),
  })).filter(({ itens }) => itens.length > 0)
}

function itensDoDock(papel: Papel) {
  return GRUPOS.flatMap(({ itens }) => itens).filter(
    ({ papeis, dock }) => dock && papeis.includes(papel),
  )
}

export function Marca({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-marca text-marca-foreground">
        <TrainFront className="size-5" aria-hidden />
      </span>
      <span className="text-base leading-tight font-bold">Ferrovia Santa Cruz</span>
    </div>
  )
}

function Navegacao({ papel, aoNavegar }: { papel: Papel; aoNavegar?: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      {gruposDoPapel(papel).map(({ titulo, itens }) => (
        <div key={titulo ?? 'principal'} className="flex flex-col gap-1">
          {titulo && (
            <p className="px-3 pb-1 text-rotulo font-semibold tracking-wide text-muted-foreground uppercase">
              {titulo}
            </p>
          )}
          {itens.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/admin'}
              onClick={aoNavegar}
              className={({ isActive }) =>
                cn(
                  'flex h-11 items-center gap-3 rounded-full px-3 text-sm font-semibold transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  isActive && 'bg-primary text-primary-foreground hover:bg-primary',
                )
              }
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </NavLink>
          ))}
        </div>
      ))}
    </div>
  )
}

export function BotaoDeSair() {
  const { sair } = useAutenticacao()
  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={sair.isPending}
      onClick={() => {
        sair.mutate(undefined, {
          onError: () => toast.error('Não foi possível sair. Tente de novo.'),
        })
      }}
    >
      <LogOut aria-hidden />
      Sair da conta
    </Button>
  )
}

function Sessao({ nome, cargo }: { nome: string; cargo: string }) {
  return (
    <div className="px-3">
      <p className="truncate text-sm font-semibold">{nome}</p>
      <p className="truncate text-rotulo text-muted-foreground">{rotuloDeCargo(cargo)}</p>
    </div>
  )
}

function BarraLateral({ papel, nome, cargo }: { papel: Papel; nome: string; cargo: string }) {
  return (
    <aside className="nao-imprime sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 overflow-y-auto border-r border-border px-4 py-6 lg:flex">
      <Marca className="px-2" />
      <nav aria-label="Seções do painel">
        <Navegacao papel={papel} />
      </nav>
      <div className="mt-auto flex flex-col gap-4 border-t border-border pt-4">
        <Sessao nome={nome} cargo={cargo} />
        <AlternadorDeTema className="px-3" />
        <BotaoDeSair />
      </div>
    </aside>
  )
}

function MenuDoDock({ papel, nome, cargo }: { papel: Papel; nome: string; cargo: string }) {
  const [aberto, setAberto] = useState(false)
  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:outline-secondary"
          aria-label="Abrir menu de seções"
        >
          <Menu className="size-5" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{nome}</SheetTitle>
          <SheetDescription>{rotuloDeCargo(cargo)}</SheetDescription>
        </SheetHeader>
        <nav aria-label="Todas as seções" className="px-6">
          <Navegacao
            papel={papel}
            aoNavegar={() => {
              setAberto(false)
            }}
          />
        </nav>
        <SheetFooter className="gap-4">
          <AlternadorDeTema className="justify-center" />
          <BotaoDeSair />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function Dock({ papel, nome, cargo }: { papel: Papel; nome: string; cargo: string }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="nao-imprime fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-3 lg:hidden"
    >
      <ul className="flex max-w-full items-center gap-1 rounded-full bg-primary p-1.5 shadow-lg">
        {itensDoDock(papel).map(({ icon: Icon, label, path }) => (
          <li key={path}>
            <NavLink
              to={path}
              end={path === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-primary-foreground transition-colors duration-150 hover:bg-primary-foreground/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
                  isActive && 'bg-secondary text-secondary-foreground hover:bg-secondary',
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
          </li>
        ))}
        <li>
          <MenuDoDock papel={papel} nome={nome} cargo={cargo} />
        </li>
      </ul>
    </nav>
  )
}

export function CascaDePagina({ children }: { children: ReactNode }) {
  const { usuario } = useAutenticacao()
  if (!usuario) return null
  const { papel, nome, cargo } = usuario
  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <BarraLateral papel={papel} nome={nome} cargo={cargo} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="nao-imprime flex items-center px-4 py-4 sm:px-6 lg:hidden">
          <Marca />
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pt-2 pb-28 sm:px-6 lg:gap-8 lg:px-8 lg:pt-10 lg:pb-12 print:pb-0">
          {children}
        </main>
      </div>
      <Dock papel={papel} nome={nome} cargo={cargo} />
    </div>
  )
}
