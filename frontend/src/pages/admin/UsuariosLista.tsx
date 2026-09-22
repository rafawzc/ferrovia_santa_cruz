import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { ScreenHeader } from '@/components/ui/screen-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UserCard } from '@/components/ui/user-card'
import { useAuth } from '@/contexts/AuthContext'
import { useCargos } from '@/hooks/cargos'
import {
  useAtualizarUsuario,
  useCriarUsuario,
  useDesativarUsuario,
  useUsuarios,
} from '@/hooks/usuarios'
import { ApiError, type Cargo, type Usuario } from '@/lib/api'

const CARGOS: Record<string, string> = {
  comum: 'Cliente',
  admin: 'Administrador',
  administracao: 'Administração',
  rh: 'RH',
  maquinista: 'Maquinista',
  auxiliar_maquinista: 'Auxiliar de Maquinista',
  agente_trem: 'Agente de Trem',
  manutencao: 'Manutenção',
  engenharia_mecanica: 'Engenharia Mecânica',
  eletricista: 'Eletricista',
}

const rotuloCargo = (slug: string) => CARGOS[slug] ?? slug

function erroTexto(e: unknown, recurso: string) {
  return e instanceof ApiError
    ? `Não foi possível ${recurso}: ${e.message}`
    : 'Sem conexão com o servidor.'
}

const base = {
  nome: z.string().trim().min(1, 'Informe o nome').max(120, 'Até 120 caracteres'),
  email: z
    .string()
    .trim()
    .max(160, 'Até 160 caracteres')
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'E-mail inválido'),
  telefone: z.string().trim().max(20, 'Até 20 caracteres'),
  cargo_id: z.string().min(1, 'Selecione o cargo'),
}

const senha = z.string().max(128, 'Até 128 caracteres')

const schemaNovo = z.object({ ...base, senha: senha.min(8, 'Mínimo de 8 caracteres') })
const schemaEdicao = z.object({
  ...base,
  senha: senha.refine((s) => s === '' || s.length >= 8, 'Mínimo de 8 caracteres'),
})

type Valores = z.infer<typeof schemaNovo>

function FormUsuario({
  usuario,
  cargos,
  onFechar,
}: {
  usuario: Usuario | null
  cargos: Cargo[]
  onFechar: () => void
}) {
  const { usuario: eu } = useAuth()
  const criar = useCriarUsuario()
  const atualizar = useAtualizarUsuario(usuario?.id ?? 0)
  const desativar = useDesativarUsuario()
  const form = useForm<Valores>({
    resolver: zodResolver(usuario ? schemaEdicao : schemaNovo),
    defaultValues: {
      nome: usuario?.nome ?? '',
      email: usuario?.email ?? '',
      telefone: usuario?.telefone ?? '',
      cargo_id: String(cargos.find((c) => c.nome === usuario?.cargo)?.id ?? ''),
      senha: '',
    },
  })

  const aoErrar = (e: Error) => {
    if (e instanceof ApiError && e.status === 409) {
      if (e.message === 'Registro duplicado') {
        form.setError('email', { message: 'E-mail já cadastrado' })
      } else {
        form.setError('cargo_id', { message: 'Cargo não encontrado' })
      }
    } else if (e instanceof ApiError && e.status === 422 && Array.isArray(e.body?.detail)) {
      for (const d of e.body.detail) {
        form.setError(String(d.loc[1]) as keyof Valores, { message: 'Valor inválido' })
      }
    } else {
      toast.error(erroTexto(e, 'salvar'))
    }
  }

  const enviar = form.handleSubmit((v) => {
    const dados = {
      nome: v.nome,
      email: v.email,
      cargo_id: Number(v.cargo_id),
      telefone: v.telefone || undefined,
    }
    const onSuccess = () => {
      toast.success(usuario ? 'Usuário atualizado' : 'Usuário cadastrado')
      onFechar()
    }
    if (usuario) {
      atualizar.mutate({ ...dados, senha: v.senha || undefined }, { onSuccess, onError: aoErrar })
    } else {
      criar.mutate({ ...dados, senha: v.senha }, { onSuccess, onError: aoErrar })
    }
  })

  const salvando = criar.isPending || atualizar.isPending

  const texto = (nome: 'nome' | 'email' | 'telefone', rotulo: string, tipo = 'text') => {
    const erro = form.formState.errors[nome]
    return (
      <Field data-invalid={!!erro}>
        <FieldLabel htmlFor={`usuario-${nome}`}>{rotulo}</FieldLabel>
        <Input id={`usuario-${nome}`} type={tipo} aria-invalid={!!erro} {...form.register(nome)} />
        {erro && <FieldError errors={[erro]} />}
      </Field>
    )
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        void enviar(e)
      }}
    >
      <FieldGroup>
        {texto('nome', 'Nome')}
        {texto('email', 'E-mail', 'email')}
        {texto('telefone', 'Telefone (opcional)', 'tel')}
        <Controller
          name="cargo_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="usuario-cargo">Cargo</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="usuario-cargo"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  {cargos.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {rotuloCargo(c.nome)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="senha"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="usuario-senha">
                {usuario ? 'Nova senha (deixe em branco pra manter)' : 'Senha'}
              </FieldLabel>
              <PasswordInput
                {...field}
                id="usuario-senha"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : usuario ? 'Salvar' : 'Cadastrar'}
        </Button>

        {usuario && !usuario.ativo && (
          <Button
            type="button"
            variant="success"
            disabled={atualizar.isPending}
            onClick={() => {
              atualizar.mutate(
                { ativo: true },
                {
                  onSuccess: () => {
                    toast.success('Usuário reativado')
                    onFechar()
                  },
                  onError: (e) => toast.error(erroTexto(e, 'reativar')),
                },
              )
            }}
          >
            Reativar usuário
          </Button>
        )}

        {usuario?.ativo && usuario.id !== eu?.id && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={desativar.isPending}>
                Desativar usuário
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Desativar {usuario.nome}?</AlertDialogTitle>
                <AlertDialogDescription>
                  A pessoa perde o acesso na hora. O cadastro e o histórico continuam, e dá pra
                  reativar depois.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    desativar.mutate(usuario.id, {
                      onSuccess: () => {
                        toast.success('Usuário desativado')
                        onFechar()
                      },
                      onError: (e) => toast.error(erroTexto(e, 'desativar')),
                    })
                  }}
                >
                  Desativar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </FieldGroup>
    </form>
  )
}

function StatusAtivo({ ativo }: { ativo: boolean }) {
  return <Badge variant={ativo ? 'success' : 'danger'}>{ativo ? 'Ativo' : 'Inativo'}</Badge>
}

export default function UsuariosLista() {
  const { data: usuarios, isPending, error } = useUsuarios()
  const cargos = useCargos()
  const [aberto, setAberto] = useState<Usuario | 'novo' | null>(null)
  const selecionado = aberto === 'novo' ? null : aberto

  return (
    <>
      <ScreenHeader
        title="Usuários"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setAberto('novo')
            }}
          >
            <Plus />
            Cadastrar
          </Button>
        }
      />

      {isPending ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-44 lg:h-10" />
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="text-destructive">
          {erroTexto(error, 'carregar os usuários')}
        </p>
      ) : usuarios.length === 0 ? (
        <p className="text-muted-foreground">Nenhum usuário cadastrado.</p>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:hidden">
            {usuarios.map((u) => (
              <li key={u.id}>
                <UserCard
                  nome={u.nome}
                  cargo={rotuloCargo(u.cargo)}
                  ativo={u.ativo}
                  foto={u.foto_url ?? undefined}
                  onClick={() => {
                    setAberto(u)
                  }}
                />
              </li>
            ))}
          </ul>

          <div className="hidden rounded-xl bg-card p-4 lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        className="h-auto p-0"
                        onClick={() => {
                          setAberto(u)
                        }}
                      >
                        {u.nome}
                      </Button>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.telefone ?? '—'}</TableCell>
                    <TableCell>{rotuloCargo(u.cargo)}</TableCell>
                    <TableCell>
                      <StatusAtivo ativo={u.ativo} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Dialog
        open={aberto !== null}
        onOpenChange={(open) => {
          if (!open) setAberto(null)
        }}
      >
        <DialogContent className="max-h-dvh overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selecionado ? selecionado.nome : 'Cadastrar usuário'}</DialogTitle>
            <DialogDescription>
              {selecionado ? (
                <span className="flex items-center gap-2">
                  {rotuloCargo(selecionado.cargo)} <StatusAtivo ativo={selecionado.ativo} />
                </span>
              ) : (
                'Cria o acesso de um funcionário ou cliente.'
              )}
            </DialogDescription>
          </DialogHeader>
          {cargos.isPending ? (
            <Skeleton className="h-80" />
          ) : cargos.error ? (
            <p role="alert" className="text-destructive">
              {erroTexto(cargos.error, 'carregar os cargos')}
            </p>
          ) : (
            <FormUsuario
              key={selecionado?.id ?? 'novo'}
              usuario={selecionado}
              cargos={cargos.data}
              onFechar={() => {
                setAberto(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
