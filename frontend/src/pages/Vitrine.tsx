import type { ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangle,
  BarChart3,
  Download,
  Pencil,
  Plus,
  Radio,
  SearchX,
  Train,
  Trash2,
  Wrench,
} from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { AcoesDeLinha } from '@/components/ui/acoes-de-linha'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AlternadorDeTema } from '@/components/ui/alternador-de-tema'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { BannerDeErro } from '@/components/ui/banner-de-erro'
import { CampoDeSenha } from '@/components/ui/campo-de-senha'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { EstadoVazio } from '@/components/ui/estado-vazio'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { GraficoDeBarras } from '@/components/ui/grafico-de-barras'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ListaDeViagens } from '@/components/ui/lista-de-viagens'
import { Dado, RotuloDeDado } from '@/components/ui/rotulo-de-dado'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUSES, SeloDeStatus, type Status } from '@/components/ui/selo-de-status'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ApiError, type Viagem } from '@/lib/api'
import { cn, formatarNumero } from '@/lib/utils'

const SUPERFICIES = [
  { token: 'background', classe: 'bg-background' },
  { token: 'card', classe: 'bg-card' },
  { token: 'popover', classe: 'bg-popover' },
  { token: 'primary', classe: 'bg-primary' },
  { token: 'secondary', classe: 'bg-secondary' },
  { token: 'accent', classe: 'bg-accent' },
  { token: 'muted', classe: 'bg-muted' },
  { token: 'input', classe: 'bg-input' },
  { token: 'border', classe: 'bg-border' },
  { token: 'border-forte', classe: 'bg-border-forte' },
  { token: 'destructive', classe: 'bg-destructive' },
  { token: 'overlay', classe: 'bg-overlay' },
]

const STATUS_DO_TEMA = [
  { token: 'success', classe: 'bg-success text-success-foreground' },
  { token: 'warning', classe: 'bg-warning text-warning-foreground' },
  { token: 'danger', classe: 'bg-danger text-danger-foreground' },
  { token: 'delay', classe: 'bg-delay text-delay-foreground' },
]

const TINTAS = [
  { token: 'foreground', classe: 'text-foreground' },
  { token: 'muted-foreground', classe: 'text-muted-foreground' },
  { token: 'primary', classe: 'text-primary' },
  { token: 'danger-ink', classe: 'text-danger-ink' },
]

const TIPOGRAFIA = [
  {
    token: 'text-rotulo',
    classe: 'text-rotulo font-semibold tracking-wide uppercase',
    amostra: 'Peso total da carga',
  },
  {
    token: 'text-corpo',
    classe: 'text-corpo',
    amostra: 'Texto de corpo e célula de tabela.',
  },
  {
    token: 'text-titulo',
    classe: 'text-titulo leading-tight font-bold',
    amostra: 'Sensores da linha',
  },
  {
    token: 'text-destaque',
    classe: 'text-destaque leading-none font-bold tabular-nums',
    amostra: '1.284 t',
  },
]

const VARIANTES_DE_BOTAO = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'link',
  'success',
  'destructive',
] as const

const TAMANHOS_DE_BOTAO = ['xs', 'sm', 'default', 'lg'] as const

const TAMANHOS_DE_ICONE = ['icon-xs', 'icon-sm', 'icon', 'icon-lg'] as const

const VARIANTES_DE_SELO = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'link',
  'success',
  'warning',
  'danger',
  'delay',
  'destructive',
] as const

const LADOS_DA_FOLHA = ['bottom', 'right', 'left', 'top'] as const

const CARGOS = ['Maquinista', 'Manutenção', 'Administração']

const CARGA: { vagao: string; tipo: string; peso: number; status: Status }[] = [
  { vagao: 'A1', tipo: 'Minério', peso: 1284.5, status: 'normal' },
  { vagao: 'A2', tipo: 'Grãos', peso: 940, status: 'alerta' },
  { vagao: 'B1', tipo: 'Combustível', peso: 612.25, status: 'falha' },
]

const PESO_TOTAL = CARGA.reduce((total, { peso }) => total + peso, 0)

const VIAGENS: Viagem[] = [
  {
    id: 1,
    linha_id: 1,
    linha_numero: '1778',
    origem: 'Santa Cruz',
    destino: 'Porto Velho',
    trem_id: 1,
    trem_prefixo: 'TR-01',
    partida_prevista: '2026-11-03T08:00:00',
    chegada_prevista: '2026-11-03T11:30:00',
    status: 'em_andamento',
    criado_em: '2026-11-01T09:00:00',
  },
  {
    id: 2,
    linha_id: 2,
    linha_numero: '2645',
    origem: 'Porto Velho',
    destino: 'Santa Cruz',
    trem_id: 2,
    trem_prefixo: 'TR-02',
    partida_prevista: '2026-11-03T14:00:00',
    chegada_prevista: '2026-11-03T17:45:00',
    status: 'atrasada',
    criado_em: '2026-11-01T09:00:00',
  },
]

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
      <h2 className="text-lg leading-snug font-bold">{titulo}</h2>
      {children}
    </section>
  )
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-rotulo font-semibold tracking-wide text-muted-foreground uppercase">
        {titulo}
      </h3>
      {children}
    </div>
  )
}

function SelectDeCargo({ id, size }: { id: string; size?: 'sm' | 'default' }) {
  return (
    <Select>
      <SelectTrigger id={id} size={size} className="w-full">
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
  )
}

function AbasDeExemplo({
  variant,
  orientation,
}: {
  variant?: 'default' | 'line'
  orientation?: 'horizontal' | 'vertical'
}) {
  return (
    <Tabs defaultValue="carga" orientation={orientation}>
      <TabsList variant={variant}>
        <TabsTrigger value="carga">Carga</TabsTrigger>
        <TabsTrigger value="viagens">Viagens</TabsTrigger>
      </TabsList>
      <TabsContent value="carga" className="text-corpo">
        Painel de carga (exemplo).
      </TabsContent>
      <TabsContent value="viagens" className="text-corpo">
        Painel de viagens (exemplo).
      </TabsContent>
    </Tabs>
  )
}

function SecaoTokens() {
  return (
    <>
      <Secao titulo="Superfícies, bordas e véu">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SUPERFICIES.map(({ token, classe }) => (
            <li key={token} className="flex flex-col gap-2">
              <span className={cn('h-14 rounded-sm border border-border', classe)} />
              <span className="text-rotulo font-semibold">{token}</span>
            </li>
          ))}
        </ul>
      </Secao>
      <Secao titulo="Status e seu par de tinta">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STATUS_DO_TEMA.map(({ token, classe }) => (
            <li key={token} className={cn('flex flex-col gap-1 rounded-sm p-4', classe)}>
              <span className="text-rotulo font-semibold">{token}</span>
              <span className="text-rotulo">{`${token}-foreground`}</span>
            </li>
          ))}
        </ul>
      </Secao>
      <Secao titulo="Tinta sobre cartão">
        <Card>
          <CardContent className="flex flex-col gap-2">
            {TINTAS.map(({ token, classe }) => (
              <p key={token} className={cn('text-corpo font-semibold', classe)}>
                {token}
              </p>
            ))}
          </CardContent>
        </Card>
      </Secao>
      <Secao titulo="Escala tipográfica">
        <Card>
          <CardContent>
            <dl className="flex flex-col gap-5">
              {TIPOGRAFIA.map(({ token, classe, amostra }) => (
                <div key={token} className="flex flex-col gap-1.5">
                  <dt className="text-rotulo font-semibold tracking-wide text-muted-foreground uppercase">
                    {token}
                  </dt>
                  <dd className={classe}>{amostra}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </Secao>
      <Secao titulo="RotuloDeDado e Dado">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <RotuloDeDado>Peso total da carga</RotuloDeDado>
            <dl className="flex flex-col gap-2">
              <Dado rotulo="Capacidade" valor="1.284 t" />
              <Dado rotulo="Última inspeção" valor="03/11/2026" />
              <Dado rotulo="Vagões" valor={12} />
            </dl>
          </CardContent>
        </Card>
      </Secao>
    </>
  )
}

function SecaoAcoes() {
  return (
    <>
      <Secao titulo="Button">
        <Bloco titulo="Variantes">
          <div className="flex flex-wrap items-center gap-3">
            {VARIANTES_DE_BOTAO.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant}
              </Button>
            ))}
          </div>
        </Bloco>
        <Bloco titulo="Tamanhos">
          <div className="flex flex-wrap items-center gap-3">
            {TAMANHOS_DE_BOTAO.map((size) => (
              <Button key={size} size={size} variant="secondary">
                {size}
              </Button>
            ))}
          </div>
        </Bloco>
        <Bloco titulo="Só ícone">
          <div className="flex flex-wrap items-center gap-3">
            {TAMANHOS_DE_ICONE.map((size) => (
              <Button key={size} size={size} aria-label={`Cadastrar trem, tamanho ${size}`}>
                <Plus aria-hidden />
              </Button>
            ))}
          </div>
        </Bloco>
        <Bloco titulo="Com ícone e desabilitado">
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <Plus aria-hidden />
              Cadastrar trem
            </Button>
            <Button variant="outline">
              <Download aria-hidden />
              Exportar CSV
            </Button>
            <Button disabled>Salvando…</Button>
          </div>
        </Bloco>
      </Secao>
      <Secao titulo="Badge">
        <div className="flex flex-wrap items-center gap-2">
          {VARIANTES_DE_SELO.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </Secao>
      <Secao titulo="SeloDeStatus">
        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map((status) => (
            <SeloDeStatus key={status} status={status} />
          ))}
        </div>
      </Secao>
      <Secao titulo="AcoesDeLinha">
        <AcoesDeLinha
          nome="sensor S-VEL-001"
          aoEditar={() => {
            toast('Editar sensor S-VEL-001', { description: 'Ação de exemplo' })
          }}
          aoExcluir={() => {
            toast('Excluir sensor S-VEL-001', { description: 'Ação de exemplo' })
          }}
        />
      </Secao>
    </>
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
        <FieldSet className="gap-4">
          <FieldLegend>Acesso</FieldLegend>
          <Controller
            name="email"
            control={formulario.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="vitrine-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="vitrine-email"
                  type="email"
                  placeholder="ana.admin@ferrovia.com"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>Use o email corporativo.</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="senha"
            control={formulario.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="vitrine-senha">Senha</FieldLabel>
                <CampoDeSenha {...field} id="vitrine-senha" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldSet>
        <Controller
          name="cargo"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="vitrine-cargo">Cargo</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="vitrine-cargo"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
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
                id="vitrine-termos"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldContent>
                <FieldLabel htmlFor="vitrine-termos">Aceito os termos de uso.</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
            </Field>
          )}
        />
        <Button type="submit">Salvar cadastro</Button>
      </FieldGroup>
    </form>
  )
}

function SecaoCampos() {
  return (
    <>
      <Secao titulo="Label, Input e CampoDeSenha">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="vitrine-prefixo">Prefixo do trem</Label>
            <Input id="vitrine-prefixo" placeholder="TR-01" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="vitrine-senha-solta">Senha</Label>
            <CampoDeSenha id="vitrine-senha-solta" defaultValue="ferrovia123" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="vitrine-desabilitado">Campo desabilitado</Label>
            <Input id="vitrine-desabilitado" defaultValue="Somente leitura" disabled />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="vitrine-invalido">Campo inválido</Label>
            <Input id="vitrine-invalido" defaultValue="tr 01" aria-invalid="true" />
          </div>
        </div>
      </Secao>
      <Secao titulo="Select">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="vitrine-cargo-default">Tamanho default</Label>
            <SelectDeCargo id="vitrine-cargo-default" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="vitrine-cargo-sm">Tamanho sm</Label>
            <SelectDeCargo id="vitrine-cargo-sm" size="sm" />
          </div>
        </div>
      </Secao>
      <Secao titulo="Switch">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <Switch id="vitrine-switch" defaultChecked />
            <Label htmlFor="vitrine-switch">Tamanho default</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="vitrine-switch-sm" size="sm" />
            <Label htmlFor="vitrine-switch-sm">Tamanho sm</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="vitrine-switch-off" disabled />
            <Label htmlFor="vitrine-switch-off">Desabilitado</Label>
          </div>
        </div>
      </Secao>
      <Secao titulo="Field com react-hook-form e zod">
        <FormularioDemo />
      </Secao>
    </>
  )
}

function SecaoBlocos() {
  return (
    <>
      <Secao titulo="Card">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Rota 1778</CardTitle>
            <CardDescription>Exemplo fixo, não vem da API.</CardDescription>
            <CardAction>
              <Button variant="ghost" size="icon-sm" aria-label="Editar a rota 1778">
                <Pencil aria-hidden />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="text-corpo">
            Santa Cruz → Porto Velho, 3 vagões carregados.
          </CardContent>
          <CardFooter className="gap-3">
            <Button size="sm">Ver viagens</Button>
            <Button size="sm" variant="outline">
              Fechar rota
            </Button>
          </CardFooter>
        </Card>
      </Secao>
      <Secao titulo="Table">
        <Card className="gap-0 px-2 py-2">
          <Table>
            <TableCaption>Carga de exemplo da Rota 1778.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Vagão</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Peso (t)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CARGA.map(({ vagao, tipo, peso, status }) => (
                <TableRow key={vagao}>
                  <TableCell className="font-semibold">{vagao}</TableCell>
                  <TableCell>{tipo}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatarNumero(peso)}</TableCell>
                  <TableCell>
                    <SeloDeStatus status={status} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon-sm" aria-label={`Editar o vagão ${vagao}`}>
                      <Pencil aria-hidden />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatarNumero(PESO_TOTAL)}
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableFooter>
          </Table>
        </Card>
      </Secao>
      <Secao titulo="Tabs">
        <Bloco titulo="Variante default">
          <AbasDeExemplo />
        </Bloco>
        <Bloco titulo="Variante line">
          <AbasDeExemplo variant="line" />
        </Bloco>
        <Bloco titulo="Orientação vertical">
          <AbasDeExemplo orientation="vertical" />
        </Bloco>
      </Secao>
      <Secao titulo="Skeleton">
        <div className="flex max-w-md flex-col gap-3">
          <Skeleton className="h-20" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </div>
        </div>
      </Secao>
      <Secao titulo="Avatar">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar size="sm">
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>AR</AvatarFallback>
            <AvatarBadge />
          </Avatar>
          <AvatarGroup>
            <Avatar>
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>JC</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+3</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </Secao>
      <Secao titulo="Tooltip e Separator">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Passe o ponteiro</Button>
          </TooltipTrigger>
          <TooltipContent>Rótulo curto do item</TooltipContent>
        </Tooltip>
        <Separator />
        <div className="flex h-10 items-center gap-4">
          <span className="text-corpo">Trens</span>
          <Separator orientation="vertical" />
          <span className="text-corpo">Sensores</span>
        </div>
      </Secao>
    </>
  )
}

function SecaoCamadas() {
  return (
    <>
      <Secao titulo="Dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus aria-hidden />
              Cadastrar carga
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar carga</DialogTitle>
              <DialogDescription>
                Cadastro e edição abrem em diálogo sobre a lista.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="vitrine-tipo-de-carga">Tipo de carga</FieldLabel>
                <Input id="vitrine-tipo-de-carga" placeholder="Minério" />
                <FieldDescription>Campo de exemplo: nada é enviado.</FieldDescription>
              </Field>
            </FieldGroup>
            <DialogFooter showCloseButton>
              <Button>Cadastrar carga</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Secao>
      <Secao titulo="AlertDialog">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 aria-hidden />
              Excluir sensor
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <AlertTriangle aria-hidden />
              </AlertDialogMedia>
              <AlertDialogTitle>Excluir o sensor 12?</AlertDialogTitle>
              <AlertDialogDescription>
                As leituras dele saem dos relatórios. Não dá para desfazer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Manter sensor</AlertDialogCancel>
              <AlertDialogAction variant="destructive">Excluir sensor</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Secao>
      <Secao titulo="Sheet">
        <div className="flex flex-wrap items-center gap-3">
          {LADOS_DA_FOLHA.map((side) => (
            <Sheet key={side}>
              <SheetTrigger asChild>
                <Button variant="outline">Gaveta {side}</Button>
              </SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle>Vagão A1</SheetTitle>
                  <SheetDescription>Gaveta de exemplo, lado {side}.</SheetDescription>
                </SheetHeader>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="outline">Fechar gaveta</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </Secao>
      <Secao titulo="Toast">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              toast.success('Carga cadastrada')
            }}
          >
            Toast de sucesso
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              toast.error('Não foi possível salvar a carga')
            }}
          >
            Toast de erro
          </Button>
        </div>
      </Secao>
    </>
  )
}

function SecaoDominio() {
  return (
    <>
      <Secao titulo="CartaoDeMetrica">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CartaoDeMetrica icon={BarChart3} label="Rotas ativas" value="4 / 5" status="normal" />
          <CartaoDeMetrica icon={Radio} label="Sensores" value="9 / 10" status="alerta" />
          <CartaoDeMetrica icon={Wrench} label="Manutenções" value={1} />
        </div>
      </Secao>
      <Secao titulo="CartaoDeUsuario">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <CartaoDeUsuario
            nome="Ana Rossi"
            cargo="Administração"
            ativo
            onClick={() => {
              toast('Ana Rossi', { description: 'Cartão de exemplo' })
            }}
          />
          <CartaoDeUsuario nome="Juliana Costa" cargo="Maquinista" ativo={false} />
        </div>
      </Secao>
      <Secao titulo="GraficoDeBarras">
        <Card>
          <CardHeader>
            <CardTitle>Carga por tipo</CardTitle>
            <CardDescription>Série de exemplo, em toneladas.</CardDescription>
          </CardHeader>
          <CardContent>
            <GraficoDeBarras
              formatar={formatarNumero}
              barras={[
                { rotulo: 'Minério', valor: 1284.5 },
                { rotulo: 'Grãos', valor: 940, variant: 'success' },
                { rotulo: 'Combustível', valor: 612.25, variant: 'warning' },
                { rotulo: 'Químicos', valor: 180, variant: 'danger' },
              ]}
            />
          </CardContent>
        </Card>
        <GraficoDeBarras barras={[]} />
      </Secao>
      <Secao titulo="ListaDeViagens">
        <ListaDeViagens
          viagens={VIAGENS}
          acoes={(viagem) => (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast(`Viagem ${String(viagem.id)}`, { description: 'Ação de exemplo' })
              }}
            >
              <Pencil aria-hidden />
              Editar
            </Button>
          )}
        />
      </Secao>
      <Secao titulo="EstadoVazio">
        <div className="flex flex-col gap-4">
          <EstadoVazio
            icone={Train}
            titulo="Nenhum trem cadastrado"
            descricao="A frota aparece aqui assim que o primeiro trem for cadastrado."
            acao={
              <Button
                onClick={() => {
                  toast('Cadastrar primeiro trem', { description: 'Ação de exemplo' })
                }}
              >
                <Plus aria-hidden />
                Cadastrar primeiro trem
              </Button>
            }
          />
          <EstadoVazio icone={SearchX} titulo="Nenhum resultado para esta busca" />
        </div>
      </Secao>
      <Secao titulo="BannerDeErro">
        <BannerDeErro>Email ou senha inválidos</BannerDeErro>
      </Secao>
      <Secao titulo="ErroDeCarregamento">
        <div className="flex flex-col gap-4">
          <ErroDeCarregamento
            error={new ApiError(500, { detail: 'Erro ao consultar os sensores' })}
            aoTentarDeNovo={() => {
              toast('Nova tentativa', { description: 'Exemplo sem requisição' })
            }}
          />
          <ErroDeCarregamento
            error={new TypeError('Failed to fetch')}
            aoTentarDeNovo={() => {
              toast('Nova tentativa', { description: 'Exemplo sem requisição' })
            }}
          />
        </div>
      </Secao>
    </>
  )
}

const ABAS = [
  { valor: 'tokens', rotulo: 'Tokens', Conteudo: SecaoTokens },
  { valor: 'acoes', rotulo: 'Ações', Conteudo: SecaoAcoes },
  { valor: 'campos', rotulo: 'Campos', Conteudo: SecaoCampos },
  { valor: 'blocos', rotulo: 'Blocos', Conteudo: SecaoBlocos },
  { valor: 'camadas', rotulo: 'Camadas', Conteudo: SecaoCamadas },
  { valor: 'dominio', rotulo: 'Domínio', Conteudo: SecaoDominio },
]

export default function Vitrine() {
  return (
    <CascaDePagina>
      <CabecalhoDeTela
        title="Vitrine do design system"
        apoio="Catálogo dos tokens e componentes em uso. Todo dado desta tela é exemplo fixo, nada vem da API."
        temVoltar
        actions={<AlternadorDeTema />}
      />
      <Tabs defaultValue="tokens" className="gap-6 lg:gap-8">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
          {ABAS.map(({ valor, rotulo }) => (
            <TabsTrigger key={valor} value={valor} className="flex-none">
              {rotulo}
            </TabsTrigger>
          ))}
        </TabsList>
        {ABAS.map(({ valor, Conteudo }) => (
          <TabsContent key={valor} value={valor} className="flex flex-col gap-8">
            <Conteudo />
          </TabsContent>
        ))}
      </Tabs>
    </CascaDePagina>
  )
}
