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
import { AuthLayout } from '@/components/ui/auth-layout'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { LineCard } from '@/components/ui/line-card'
import { MetricCard } from '@/components/ui/metric-card'
import { PageShell } from '@/components/ui/page-shell'
import { PasswordInput } from '@/components/ui/password-input'
import { Progress } from '@/components/ui/progress'
import { ScreenHeader } from '@/components/ui/screen-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { STATUSES, StatusBadge } from '@/components/ui/status-badge'
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
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { UserCard } from '@/components/ui/user-card'

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

const BUTTON_VARIANTS = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'link',
  'destructive',
  'success',
] as const
const BADGE_VARIANTS = [
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

const schema = z.object({
  email: z.email('Email inválido'),
  senha: z.string().min(8, 'Mínimo de 8 caracteres'),
  cargo: z.string().min(1, 'Selecione o cargo'),
  termos: z.boolean().refine((v) => v, 'Aceite os termos'),
})

type FormValues = z.infer<typeof schema>

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  )
}

function DemoForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', senha: '', cargo: '', termos: false },
  })

  return (
    <form
      noValidate
      onSubmit={(e) => {
        void form.handleSubmit(() => toast.success('Formulário válido'))(e)
      }}
      className="max-w-md"
    >
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
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
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="demo-senha">Senha</FieldLabel>
              <PasswordInput {...field} id="demo-senha" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="cargo"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="demo-cargo">Cargo</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="demo-cargo" className="w-full" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  {CARGOS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
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
          control={form.control}
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

export default function Vitrine() {
  const [showAuth, setShowAuth] = useState(false)

  if (showAuth) {
    return (
      <AuthLayout title="Entrar na Conta" description="Prévia do AuthLayout.">
        <Button
          className="w-full"
          onClick={() => {
            setShowAuth(false)
          }}
        >
          Voltar pra vitrine
        </Button>
      </AuthLayout>
    )
  }

  return (
    <PageShell>
      <ScreenHeader title="Vitrine do design system" actions={<ThemeToggle />} />

      <div className="flex flex-col gap-10">
        <Section title="Tokens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {TOKENS.map((t) => (
              <div
                key={t.name}
                className={`flex h-16 items-end rounded-lg border border-border p-2 text-xs font-semibold ${t.className}`}
              >
                {t.name}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Button">
          <div className="flex flex-wrap items-center gap-3">
            {BUTTON_VARIANTS.map((v) => (
              <Button key={v} variant={v}>
                {v}
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
        </Section>

        <Section title="Badge e StatusBadge">
          <div className="flex flex-wrap gap-2">
            {BADGE_VARIANTS.map((v) => (
              <Badge key={v} variant={v}>
                {v}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
        </Section>

        <Section title="Formulário (Field + react-hook-form + zod)">
          <DemoForm />
        </Section>

        <Section title="Card">
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
        </Section>

        <Section title="Tabs">
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
        </Section>

        <Section title="Dialog, AlertDialog e Sheet">
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
        </Section>

        <Section title="Table">
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
                  <StatusBadge status="normal" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>B</TableCell>
                <TableCell>Grãos</TableCell>
                <TableCell>
                  <StatusBadge status="alerta" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        <Section title="Avatar, Skeleton, Tooltip, Separator">
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
        </Section>

        <Section title="Compostos do domínio">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard icon={BarChart3} label="Linhas ativas" value="4 / 5" tone="success" />
            <MetricCard icon={Radio} label="Sensores" value="9 / 10" tone="warning" />
            <MetricCard icon={Wrench} label="Manutenções" value={1} tone="danger" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <LineCard numero="1778" status="manutencao" ativo />
            <LineCard numero="2645" status="atraso" ativo />
            <LineCard numero="9845" status="fechado" ativo={false} />
            <LineCard numero="5463" status="na_estacao" ativo />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <UserCard nome="Anna Rossi" cargo="RH" ativo />
            <UserCard nome="Juliana Costa" cargo="Maquinista" ativo={false} />
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => {
                setShowAuth(true)
              }}
            >
              Ver AuthLayout
            </Button>
          </div>
        </Section>
      </div>
    </PageShell>
  )
}
