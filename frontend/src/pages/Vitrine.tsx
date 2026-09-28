import { useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { BarChart3, Plus, Radio, Wrench } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AlternadorDeTema } from '@/components/ui/alternador-de-tema'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { CampoDeSenha } from '@/components/ui/campo-de-senha'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CartaoDeLinha } from '@/components/ui/cartao-de-linha'
import { CartaoDeMetrica } from '@/components/ui/cartao-de-metrica'
import { CartaoDeUsuario } from '@/components/ui/cartao-de-usuario'
import { CascaDePagina } from '@/components/ui/casca-de-pagina'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ErroDeCarregamento } from '@/components/ui/erro-de-carregamento'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { LayoutDeAutenticacao } from '@/components/ui/layout-de-autenticacao'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUSES, SeloDeStatus } from '@/components/ui/selo-de-status'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ApiError } from '@/lib/api'

const TOKENS = [
  { name: 'background', className: 'bg-background text-foreground' },
  { name: 'card', className: 'bg-card text-card-foreground' },
  { name: 'popover', className: 'bg-popover text-popover-foreground' },
  { name: 'primary', className: 'bg-primary text-primary-foreground' },
  { name: 'secondary', className: 'bg-secondary text-secondary-foreground' },
  { name: 'muted', className: 'bg-muted text-muted-foreground' },
  { name: 'accent', className: 'bg-accent text-accent-foreground' },
  { name: 'destructive', className: 'bg-destructive text-destructive-foreground' },
  { name: 'success', className: 'bg-success text-success-foreground' },
  { name: 'warning', className: 'bg-warning text-warning-foreground' },
  { name: 'danger', className: 'bg-danger text-danger-foreground' },
  { name: 'delay', className: 'bg-delay text-delay-foreground' },
  { name: 'input', className: 'bg-input text-foreground' },
  { name: 'overlay', className: 'bg-overlay text-primary-foreground' },
]

const VARIANTES_DE_BOTAO = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'link',
  'destructive',
  'success',
] as const
const VARIANTES_DE_SELO = [
  'default',
  'secondary',
  'outline',
  'destructive',
  'success',
  'warning',
  'danger',
  'delay',
] as const
const CARGOS = ['Maquinista', 'Manutenção', 'Administração']

const esquema = z.object({
  email: z.email('Email inválido'),
  senha: z.string().min(8, 'Mínimo de 8 caracteres'),
  cargo: z.string().min(1, 'Selecione o cargo'),
  termos: z.boolean().refine((termos) => termos, 'Aceite os termos'),
})

type ValoresDoFormulario = z.infer<typeof esquema>

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">{titulo}</h2>
      {children}
    </section>
  )
}

function FormularioDemo() {
  const formulario = useForm<ValoresDoFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: { email: '', senha: '', cargo: '', termos: false },
  })

  return (
    <form
      noValidate
      onSubmit={(evento) => {
        void formulario.handleSubmit(() => toast.success('Formulário válido'))(evento)
      }}
      className="max-w-md"
    >
      <FieldGroup>
        <Controller
          name="email"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="demo-email">Email</FieldLabel>
              <Input
                {...field}
                id="demo-email"
                type="email"
                placeholder="seu@email.com"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="senha"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="demo-senha">Senha</FieldLabel>
              <CampoDeSenha {...field} id="demo-senha" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="cargo"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="demo-cargo">Cargo</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="demo-cargo" className="w-full" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  {CARGOS.map((cargo) => (
                    <SelectItem key={cargo} value={cargo}>
                      {cargo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="termos"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <Switch
                id="demo-termos"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldLabel htmlFor="demo-termos">Aceito os termos</FieldLabel>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit">Enviar</Button>
      </FieldGroup>
    </form>
  )
}

function SecaoTokens() {
  return (
    <Secao titulo="Tokens">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {TOKENS.map((token) => (
          <div
            key={token.name}
            className={`flex h-16 items-end rounded-lg border border-border p-2 text-xs font-semibold ${token.className}`}
          >
            {token.name}
          </div>
        ))}
      </div>
    </Secao>
  )
}

function SecaoBotoes() {
  return (
    <Secao titulo="Button">
      <div className="flex flex-wrap items-center gap-3">
        {VARIANTES_DE_BOTAO.map((variante) => (
          <Button key={variante} variant={variante}>
            {variante}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="xs">xs</Button>
        <Button size="sm">sm</Button>
        <Button>default</Button>
        <Button size="lg">lg</Button>
        <Button size="icon" aria-label="Adicionar">
          <Plus />
        </Button>
        <Button>
          <Plus />
          Com ícone
        </Button>
        <Button disabled>Desabilitado</Button>
      </div>
    </Secao>
  )
}

function SecaoSelos() {
  return (
    <Secao titulo="Badge e SeloDeStatus">
      <div className="flex flex-wrap gap-2">
        {VARIANTES_DE_SELO.map((variante) => (
          <Badge key={variante} variant={variante}>
            {variante}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((status) => (
          <SeloDeStatus key={status} status={status} />
        ))}
      </div>
    </Secao>
  )
}

function SecaoFormulario() {
  return (
    <Secao titulo="Formulário (Field + react-hook-form + zod)">
      <FormularioDemo />
    </Secao>
  )
}

function SecaoCartao() {
  return (
    <Secao titulo="Card">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Rota 1778</CardTitle>
          <CardDescription>Última leitura há 2 min</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm">Capacidade do vagão</p>
          <Progress value={72} aria-label="Capacidade do vagão" />
        </CardContent>
        <CardFooter>
          <Button size="sm">Detalhes</Button>
        </CardFooter>
      </Card>
    </Secao>
  )
}

function SecaoAbas() {
  return (
    <Secao titulo="Tabs">
      <Tabs defaultValue="carga">
        <TabsList>
          <TabsTrigger value="carga">Carga</TabsTrigger>
          <TabsTrigger value="passageiros">Passageiros</TabsTrigger>
          <TabsTrigger value="relatorio">Relatório</TabsTrigger>
        </TabsList>
        <TabsContent value="carga">Conteúdo de carga.</TabsContent>
        <TabsContent value="passageiros">Conteúdo de passageiros.</TabsContent>
        <TabsContent value="relatorio">Conteúdo do relatório.</TabsContent>
      </Tabs>
    </Secao>
  )
}

function SecaoSobreposicoes() {
  return (
    <Secao titulo="Dialog, AlertDialog e Sheet">
      <div className="flex flex-wrap gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Abrir dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar manutenção</DialogTitle>
              <DialogDescription>Informe o motivo e a linha.</DialogDescription>
            </DialogHeader>
            <Input placeholder="Motivo" aria-label="Motivo" />
            <DialogFooter>
              <Button>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Excluir</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir funcionário?</AlertDialogTitle>
              <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Abrir sheet</Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Detalhes do vagão</SheetTitle>
              <SheetDescription>Gaveta pra telas pequenas.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Button
          variant="ghost"
          onClick={() => {
            toast('Alerta enviado', { description: 'Rota 1778' })
          }}
        >
          Disparar toast
        </Button>
      </div>
    </Secao>
  )
}

function SecaoTabela() {
  return (
    <Secao titulo="Table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vagão</TableHead>
            <TableHead>Carga</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
            <TableCell>Minério</TableCell>
            <TableCell>
              <SeloDeStatus status="normal" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>B</TableCell>
            <TableCell>Grãos</TableCell>
            <TableCell>
              <SeloDeStatus status="alerta" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Secao>
  )
}

function SecaoAuxiliares() {
  return (
    <Secao titulo="Avatar, Skeleton, Tooltip, Separator">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar size="lg">
          <AvatarFallback>MW</AvatarFallback>
        </Avatar>
        <Skeleton className="h-10 w-40" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Passe o mouse</Button>
          </TooltipTrigger>
          <TooltipContent>Dica</TooltipContent>
        </Tooltip>
      </div>
      <Separator />
    </Secao>
  )
}

function SecaoCompostosDoDominio({
  aoVerLayoutDeAutenticacao,
}: {
  aoVerLayoutDeAutenticacao: () => void
}) {
  return (
    <Secao titulo="Compostos do domínio">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CartaoDeMetrica icon={BarChart3} label="Linhas ativas" value="4 / 5" status="normal" />
        <CartaoDeMetrica icon={Radio} label="Sensores" value="9 / 10" status="alerta" />
        <CartaoDeMetrica icon={Wrench} label="Manutenções" value={1} status="falha" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CartaoDeLinha numero="1778" status="manutencao" ativo />
        <CartaoDeLinha numero="2645" status="atraso" ativo />
        <CartaoDeLinha numero="9845" status="fechado" ativo={false} />
        <CartaoDeLinha numero="5463" status="na_estacao" ativo />
      </div>
      <div className="flex flex-col gap-2">
        <ErroDeCarregamento error={new ApiError(500, { detail: 'Erro interno' })} />
        <ErroDeCarregamento error={new TypeError('Failed to fetch')} />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CartaoDeUsuario nome="Anna Rossi" cargo="RH" ativo />
        <CartaoDeUsuario nome="Juliana Costa" cargo="Maquinista" ativo={false} />
      </div>
      <div>
        <Button variant="outline" onClick={aoVerLayoutDeAutenticacao}>
          Ver LayoutDeAutenticacao
        </Button>
      </div>
    </Secao>
  )
}

export default function Vitrine() {
  const [mostrandoLayoutDeAutenticacao, setMostrandoLayoutDeAutenticacao] = useState(false)

  if (mostrandoLayoutDeAutenticacao) {
    return (
      <LayoutDeAutenticacao title="Entrar na Conta" description="Prévia do LayoutDeAutenticacao.">
        <Button
          className="w-full"
          onClick={() => {
            setMostrandoLayoutDeAutenticacao(false)
          }}
        >
          Voltar pra vitrine
        </Button>
      </LayoutDeAutenticacao>
    )
  }

  return (
    <CascaDePagina>
      <CabecalhoDeTela title="Vitrine do design system" actions={<AlternadorDeTema />} />

      <div className="flex flex-col gap-10">
        <SecaoTokens />
        <SecaoBotoes />
        <SecaoSelos />
        <SecaoFormulario />
        <SecaoCartao />
        <SecaoAbas />
        <SecaoSobreposicoes />
        <SecaoTabela />
        <SecaoAuxiliares />
        <SecaoCompostosDoDominio
          aoVerLayoutDeAutenticacao={() => {
            setMostrandoLayoutDeAutenticacao(true)
          }}
        />
      </div>
    </CascaDePagina>
  )
}
