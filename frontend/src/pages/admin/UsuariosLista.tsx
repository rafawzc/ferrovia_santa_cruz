import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, SearchX, UserPlus, Users } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { CampoDeSenha } from '@/components/ui/campo-de-senha'
import { Card } from '@/components/ui/card'
import { CartaoDeUsuario } from '@/components/ui/cartao-de-usuario'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErroDeCarregamento, mensagemDeErro } from '@/components/ui/erro-de-carregamento'
import { EstadoVazio } from '@/components/ui/estado-vazio'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RotuloDeDado } from '@/components/ui/rotulo-de-dado'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SeloDeStatus } from '@/components/ui/selo-de-status'
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
  useSenhaTemporaria,
  useUsuarios,
} from '@/hooks/usuarios'
import { ApiError, tratouErrosDeCampo, type Cargo, type Papel, type Usuario } from '@/lib/api'
import { rotuloDeCargo } from '@/lib/rotulos'

const OPCOES_DE_PAPEL: { valor: Papel; rotulo: string }[] = [
  { valor: 'cliente', rotulo: 'Cliente' },
  { valor: 'operacional', rotulo: 'Operacional' },
  { valor: 'gestao', rotulo: 'Gestão' },
]

const OPCOES_DE_SITUACAO = [
  { valor: 'ativos', rotulo: 'Ativos' },
  { valor: 'inativos', rotulo: 'Inativos' },
]

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
  if (ehVoceMesmo) {
    return <p className="text-sm text-muted-foreground">Você não pode desativar a própria conta.</p>
  }

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
            A pessoa perde o acesso na hora. Desativar não exclui: o cadastro e o histórico
            continuam, e dá pra reativar depois. O sistema recusa a desativação se esta for a última
            conta de administração ativa.
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
            Desativar usuário
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function AcaoSenhaTemporaria({ usuario }: { usuario: Usuario }) {
  const gerar = useSenhaTemporaria()
  const [senha, setSenha] = useState<string | null>(null)

  const copiar = (texto: string) => {
    if (!('clipboard' in navigator)) {
      toast.error('Não foi possível copiar. Copie a senha manualmente.')
      return
    }
    void navigator.clipboard.writeText(texto).then(
      () => {
        toast.success('Senha copiada')
      },
      () => {
        toast.error('Não foi possível copiar. Copie manualmente.')
      },
    )
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="outline" disabled={gerar.isPending}>
            Gerar senha temporária
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gerar senha temporária para {usuario.nome}?</AlertDialogTitle>
            <AlertDialogDescription>
              A senha anterior deixa de valer na hora. A nova senha aparece uma única vez, para você
              repassar à pessoa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                gerar.mutate(usuario.id, {
                  onSuccess: (resposta) => {
                    setSenha(resposta.senha_temporaria)
                  },
                  onError: (erro) => toast.error(erroTexto(erro, 'gerar a senha temporária')),
                })
              }}
            >
              Gerar senha
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={senha !== null}
        onOpenChange={(aberto) => {
          if (aberto) return
          setSenha(null)
          gerar.reset()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Senha temporária de {usuario.nome}</DialogTitle>
            <DialogDescription>
              Esta senha não será mostrada de novo. Copie e repasse agora.
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-lg bg-muted p-4 text-center font-mono text-2xl font-bold select-all">
            {senha}
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Fechar
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => {
                if (senha !== null) copiar(senha)
              }}
            >
              Copiar senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function AcoesDeConta({ usuario, aoFechar }: { usuario: Usuario; aoFechar: () => void }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-5">
      <RotuloDeDado>Acesso ao sistema</RotuloDeDado>
      <AcaoSenhaTemporaria usuario={usuario} />
      <AcoesDeAtivacao usuario={usuario} aoFechar={aoFechar} />
    </div>
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
      if (erro.message === 'Registro duplicado') {
        formulario.setError('email', { message: 'E-mail já cadastrado' })
        return
      }
      if (erro.message === 'Referência inexistente') {
        formulario.setError('cargo_id', { message: 'Cargo não encontrado' })
        return
      }
      toast.error(mensagemDeErro(erro))
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
  const ajudaDeSenha = usuario
    ? 'Deixe em branco para manter a senha atual.'
    : 'Mínimo de 8 caracteres.'

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
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
                      {rotuloDeCargo(cargo.nome)}
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
              <FieldLabel htmlFor="usuario-senha">{usuario ? 'Nova senha' : 'Senha'}</FieldLabel>
              <CampoDeSenha
                {...field}
                id="usuario-senha"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>{ajudaDeSenha}</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : usuario ? 'Salvar alterações' : 'Cadastrar usuário'}
        </Button>
      </DialogFooter>
    </form>
  )
}

interface ListaProps {
  usuarios: Usuario[]
  aoAbrir: (usuario: Usuario) => void
}

function ListaDeCartoes({ usuarios, aoAbrir }: ListaProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:hidden">
      {usuarios.map((usuario) => (
        <li key={usuario.id}>
          <CartaoDeUsuario
            nome={usuario.nome}
            cargo={rotuloDeCargo(usuario.cargo)}
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
    <Card className="hidden overflow-hidden py-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead className="hidden xl:table-cell">Telefone</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((usuario) => (
            <TableRow key={usuario.id}>
              <TableCell className="font-semibold">
                <span className="block max-w-xs truncate" title={usuario.nome}>
                  {usuario.nome}
                </span>
              </TableCell>
              <TableCell>
                <span className="block max-w-xs truncate" title={usuario.email}>
                  {usuario.email}
                </span>
              </TableCell>
              <TableCell className="hidden xl:table-cell">{usuario.telefone ?? '—'}</TableCell>
              <TableCell>{rotuloDeCargo(usuario.cargo)}</TableCell>
              <TableCell>
                <SeloDeStatus status={usuario.ativo ? 'ativo' : 'inativo'} />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar ${usuario.nome}`}
                  onClick={() => {
                    aoAbrir(usuario)
                  }}
                >
                  <Pencil aria-hidden />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function EsqueletoDeUsuarios() {
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:hidden">
        {Array.from({ length: 6 }, (_, indice) => (
          <li key={indice}>
            <Skeleton className="h-52" />
          </li>
        ))}
      </ul>
      <Card className="hidden gap-3 px-6 md:flex">
        {Array.from({ length: 8 }, (_, indice) => (
          <Skeleton key={indice} className="h-11" />
        ))}
      </Card>
    </>
  )
}

interface ConteudoProps {
  busca: string
  papel: string
  situacao: string
  aoAbrir: (usuario: Usuario) => void
  aoLimparFiltros: () => void
  aoCadastrar: () => void
}

function ConteudoDeUsuarios({
  busca,
  papel,
  situacao,
  aoAbrir,
  aoLimparFiltros,
  aoCadastrar,
}: ConteudoProps) {
  const filtroDePapel = OPCOES_DE_PAPEL.find((opcao) => opcao.valor === papel)?.valor
  const filtroDeAtivo = situacao === 'todos' ? undefined : situacao === 'ativos'
  const {
    data: usuarios,
    isPending,
    error,
    refetch,
  } = useUsuarios({ busca, papel: filtroDePapel, ativo: filtroDeAtivo })

  if (isPending) return <EsqueletoDeUsuarios />

  if (error) {
    return (
      <ErroDeCarregamento
        error={error}
        aoTentarDeNovo={() => {
          void refetch()
        }}
      />
    )
  }

  if (usuarios.length === 0) {
    const filtrando = busca !== '' || papel !== 'todos' || situacao !== 'todos'
    if (filtrando) {
      return (
        <EstadoVazio
          icone={SearchX}
          titulo="Nenhum resultado para esta busca"
          descricao="Nenhum usuário combina com o termo e os filtros escolhidos. Troque o termo ou limpe os filtros."
          acao={
            <Button variant="outline" onClick={aoLimparFiltros}>
              Limpar filtros
            </Button>
          }
        />
      )
    }
    return (
      <EstadoVazio
        icone={Users}
        titulo="Nenhum usuário cadastrado"
        descricao="Cadastre a primeira pessoa para dar acesso ao sistema."
        acao={
          <Button onClick={aoCadastrar}>
            <UserPlus aria-hidden />
            Cadastrar usuário
          </Button>
        }
      />
    )
  }

  return (
    <>
      <ListaDeCartoes usuarios={usuarios} aoAbrir={aoAbrir} />
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
  const [busca, setBusca] = useState('')
  const [papel, setPapel] = useState('todos')
  const [situacao, setSituacao] = useState('todos')

  const abrirCadastro = () => {
    setEmEdicao('novo')
  }
  const fechar = () => {
    setEmEdicao(null)
  }
  const limparFiltros = () => {
    setBusca('')
    setPapel('todos')
    setSituacao('todos')
  }

  return (
    <>
      <CabecalhoDeTela
        title="Usuários"
        apoio="Quem entra no sistema e com qual nível de acesso."
        actions={
          <Button onClick={abrirCadastro}>
            <UserPlus aria-hidden />
            Cadastrar usuário
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Input
          type="search"
          className="col-span-2"
          aria-label="Buscar usuário por nome ou e-mail"
          placeholder="Buscar por nome ou e-mail"
          value={busca}
          onChange={(evento) => {
            setBusca(evento.target.value)
          }}
        />
        <Select value={papel} onValueChange={setPapel}>
          <SelectTrigger aria-label="Filtrar por nível de acesso" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os níveis</SelectItem>
            {OPCOES_DE_PAPEL.map((opcao) => (
              <SelectItem key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={situacao} onValueChange={setSituacao}>
          <SelectTrigger aria-label="Filtrar por situação" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {OPCOES_DE_SITUACAO.map((opcao) => (
              <SelectItem key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ConteudoDeUsuarios
        busca={busca}
        papel={papel}
        situacao={situacao}
        aoAbrir={setEmEdicao}
        aoLimparFiltros={limparFiltros}
        aoCadastrar={abrirCadastro}
      />

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
                <span className="flex flex-wrap items-center gap-2">
                  {rotuloDeCargo(usuarioEmEdicao.cargo)}
                  <SeloDeStatus status={usuarioEmEdicao.ativo ? 'ativo' : 'inativo'} />
                </span>
              ) : (
                'Cria o acesso de um funcionário ou de um cliente.'
              )}
            </DialogDescription>
          </DialogHeader>

          <FormularioComCargos
            key={usuarioEmEdicao?.id ?? 'novo'}
            usuario={usuarioEmEdicao}
            aoFechar={fechar}
          />

          {usuarioEmEdicao && <AcoesDeConta usuario={usuarioEmEdicao} aoFechar={fechar} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
