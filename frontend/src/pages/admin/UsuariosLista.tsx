import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { Controller, useForm, type UseFormReturn } from 'react-hook-form'
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
import { CampoDeSenha } from '@/components/ui/campo-de-senha'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { CartaoDeUsuario } from '@/components/ui/cartao-de-usuario'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErroDeCarregamento, mensagemDeErro } from '@/components/ui/erro-de-carregamento'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
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
import { useAutenticacao } from '@/contexts/Autenticacao'
import { useCargos } from '@/hooks/cargos'
import {
  useAtualizarUsuario,
  useCriarUsuario,
  useDesativarUsuario,
  useUsuarios,
} from '@/hooks/usuarios'
import { ApiError, tratouErrosDeCampo, type Cargo, type Usuario } from '@/lib/api'

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

function erroTexto(erro: Error, acao: string) {
  return `Não foi possível ${acao}: ${mensagemDeErro(erro)}`
}

const camposComuns = {
  nome: z.string().trim().min(1, 'Informe o nome').max(120, 'Até 120 caracteres'),
  email: z
    .string()
    .trim()
    .max(160, 'Até 160 caracteres')
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'E-mail inválido'),
  telefone: z.string().trim().max(20, 'Até 20 caracteres'),
  cargo_id: z.string().min(1, 'Selecione o cargo'),
}

const regraSenha = z.string().max(128, 'Até 128 caracteres')

const esquemaNovo = z.object({
  ...camposComuns,
  senha: regraSenha.min(8, 'Mínimo de 8 caracteres'),
})
const esquemaEdicao = z.object({
  ...camposComuns,
  senha: regraSenha.refine((valor) => valor === '' || valor.length >= 8, 'Mínimo de 8 caracteres'),
})

type ValoresDoFormulario = z.infer<typeof esquemaNovo>

interface CampoTextoProps {
  formulario: UseFormReturn<ValoresDoFormulario>
  name: 'nome' | 'email' | 'telefone'
  rotulo: string
  type?: string
}

function CampoTexto({ formulario, name, rotulo, type = 'text' }: CampoTextoProps) {
  const id = `usuario-${name}`
  const erro = formulario.formState.errors[name]
  return (
    <Field data-invalid={!!erro}>
      <FieldLabel htmlFor={id}>{rotulo}</FieldLabel>
      <Input id={id} type={type} aria-invalid={!!erro} {...formulario.register(name)} />
      {erro && <FieldError errors={[erro]} />}
    </Field>
  )
}

function AcoesDeAtivacao({ usuario, aoFechar }: { usuario: Usuario; aoFechar: () => void }) {
  const { usuario: eu } = useAutenticacao()
  const reativar = useAtualizarUsuario(usuario.id)
  const desativar = useDesativarUsuario()

  if (!usuario.ativo) {
    return (
      <Button
        type="button"
        variant="success"
        disabled={reativar.isPending}
        onClick={() => {
          reativar.mutate(
            { ativo: true },
            {
              onSuccess: () => {
                toast.success('Usuário reativado')
                aoFechar()
              },
              onError: (erro) => toast.error(erroTexto(erro, 'reativar')),
            },
          )
        }}
      >
        Reativar usuário
      </Button>
    )
  }

  const ehVoceMesmo = usuario.id === eu?.id
  if (ehVoceMesmo) return null

  return (
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
            A pessoa perde o acesso na hora. O cadastro e o histórico continuam, e dá pra reativar
            depois.
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
                  aoFechar()
                },
                onError: (erro) => toast.error(erroTexto(erro, 'desativar')),
              })
            }}
          >
            Desativar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function FormularioDeUsuario({
  usuario,
  cargos,
  aoFechar,
}: {
  usuario: Usuario | null
  cargos: Cargo[]
  aoFechar: () => void
}) {
  const criar = useCriarUsuario()
  const atualizar = useAtualizarUsuario(usuario?.id ?? 0)
  const formulario = useForm<ValoresDoFormulario>({
    resolver: zodResolver(usuario ? esquemaEdicao : esquemaNovo),
    defaultValues: {
      nome: usuario?.nome ?? '',
      email: usuario?.email ?? '',
      telefone: usuario?.telefone ?? '',
      cargo_id: String(cargos.find((cargo) => cargo.nome === usuario?.cargo)?.id ?? ''),
      senha: '',
    },
  })

  const aoErrar = (erro: Error) => {
    if (erro instanceof ApiError && erro.status === 409) {
      const emailDuplicado = erro.message === 'Registro duplicado'
      if (emailDuplicado) {
        formulario.setError('email', { message: 'E-mail já cadastrado' })
      } else {
        formulario.setError('cargo_id', { message: 'Cargo não encontrado' })
      }
      return
    }
    if (tratouErrosDeCampo(erro, formulario)) return
    toast.error(erroTexto(erro, 'salvar'))
  }

  const enviar = formulario.handleSubmit((valores) => {
    const dados = {
      nome: valores.nome,
      email: valores.email,
      cargo_id: Number(valores.cargo_id),
      telefone: valores.telefone || undefined,
    }
    const onSuccess = () => {
      toast.success(usuario ? 'Usuário atualizado' : 'Usuário cadastrado')
      aoFechar()
    }
    if (usuario) {
      atualizar.mutate(
        { ...dados, senha: valores.senha || undefined },
        { onSuccess, onError: aoErrar },
      )
      return
    }
    criar.mutate({ ...dados, senha: valores.senha }, { onSuccess, onError: aoErrar })
  })

  const salvando = criar.isPending || atualizar.isPending
  const rotuloDeEnvio = usuario ? 'Salvar' : 'Cadastrar'

  return (
    <form
      noValidate
      onSubmit={(evento) => {
        void enviar(evento)
      }}
    >
      <FieldGroup>
        <CampoTexto formulario={formulario} name="nome" rotulo="Nome" />
        <CampoTexto formulario={formulario} name="email" rotulo="E-mail" type="email" />
        <CampoTexto
          formulario={formulario}
          name="telefone"
          rotulo="Telefone (opcional)"
          type="tel"
        />
        <Controller
          name="cargo_id"
          control={formulario.control}
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
                  {cargos.map((cargo) => (
                    <SelectItem key={cargo.id} value={String(cargo.id)}>
                      {rotuloCargo(cargo.nome)}
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
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="usuario-senha">
                {usuario ? 'Nova senha (deixe em branco pra manter)' : 'Senha'}
              </FieldLabel>
              <CampoDeSenha
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
          {salvando ? 'Salvando…' : rotuloDeEnvio}
        </Button>

        {usuario && <AcoesDeAtivacao usuario={usuario} aoFechar={aoFechar} />}
      </FieldGroup>
    </form>
  )
}

function StatusAtivo({ ativo }: { ativo: boolean }) {
  return <Badge variant={ativo ? 'success' : 'danger'}>{ativo ? 'Ativo' : 'Inativo'}</Badge>
}

interface ListaProps {
  usuarios: Usuario[]
  aoAbrir: (usuario: Usuario) => void
}

function ListaDeCards({ usuarios, aoAbrir }: ListaProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:hidden">
      {usuarios.map((usuario) => (
        <li key={usuario.id}>
          <CartaoDeUsuario
            nome={usuario.nome}
            cargo={rotuloCargo(usuario.cargo)}
            ativo={usuario.ativo}
            foto={usuario.foto_url ?? undefined}
            onClick={() => {
              aoAbrir(usuario)
            }}
          />
        </li>
      ))}
    </ul>
  )
}

function TabelaDeUsuarios({ usuarios, aoAbrir }: ListaProps) {
  return (
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
          {usuarios.map((usuario) => (
            <TableRow key={usuario.id}>
              <TableCell>
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => {
                    aoAbrir(usuario)
                  }}
                >
                  {usuario.nome}
                </Button>
              </TableCell>
              <TableCell>{usuario.email}</TableCell>
              <TableCell>{usuario.telefone ?? '—'}</TableCell>
              <TableCell>{rotuloCargo(usuario.cargo)}</TableCell>
              <TableCell>
                <StatusAtivo ativo={usuario.ativo} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ConteudoDeUsuarios({ aoAbrir }: { aoAbrir: (usuario: Usuario) => void }) {
  const { data: usuarios, isPending, error } = useUsuarios()

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {Array.from({ length: 6 }, (_, indice) => (
          <Skeleton key={indice} className="h-44 lg:h-10" />
        ))}
      </div>
    )
  }
  if (error) return <ErroDeCarregamento error={error} />
  if (usuarios.length === 0) {
    return <p className="text-muted-foreground">Nenhum usuário cadastrado.</p>
  }

  return (
    <>
      <ListaDeCards usuarios={usuarios} aoAbrir={aoAbrir} />
      <TabelaDeUsuarios usuarios={usuarios} aoAbrir={aoAbrir} />
    </>
  )
}

function FormularioComCargos({
  usuario,
  aoFechar,
}: {
  usuario: Usuario | null
  aoFechar: () => void
}) {
  const cargos = useCargos()

  if (cargos.isPending) return <Skeleton className="h-80" />
  if (cargos.error) return <ErroDeCarregamento error={cargos.error} />

  return <FormularioDeUsuario usuario={usuario} cargos={cargos.data} aoFechar={aoFechar} />
}

export default function UsuariosLista() {
  const [emEdicao, setEmEdicao] = useState<Usuario | 'novo' | null>(null)
  const usuarioEmEdicao = emEdicao === 'novo' ? null : emEdicao

  return (
    <>
      <CabecalhoDeTela
        title="Usuários"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEmEdicao('novo')
            }}
          >
            <Plus />
            Cadastrar
          </Button>
        }
      />

      <ConteudoDeUsuarios aoAbrir={setEmEdicao} />

      <Dialog
        open={emEdicao !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setEmEdicao(null)
        }}
      >
        <DialogContent className="max-h-dvh overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {usuarioEmEdicao ? usuarioEmEdicao.nome : 'Cadastrar usuário'}
            </DialogTitle>
            <DialogDescription>
              {usuarioEmEdicao ? (
                <span className="flex items-center gap-2">
                  {rotuloCargo(usuarioEmEdicao.cargo)} <StatusAtivo ativo={usuarioEmEdicao.ativo} />
                </span>
              ) : (
                'Cria o acesso de um funcionário ou cliente.'
              )}
            </DialogDescription>
          </DialogHeader>
          <FormularioComCargos
            key={usuarioEmEdicao?.id ?? 'novo'}
            usuario={usuarioEmEdicao}
            aoFechar={() => {
              setEmEdicao(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
