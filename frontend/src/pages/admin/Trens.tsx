import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
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
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
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
import { opcoesDeStatus, SeloDeStatus } from '@/components/ui/selo-de-status'
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
import { useLinhas } from '@/hooks/linhas'
import { useAtualizarTrem, useCriarTrem, useExcluirTrem, useTrens } from '@/hooks/trens'
import { ApiError, tratouErrosDeCampo, type Linha, type Trem, type TremStatus } from '@/lib/api'
import { dataBrasileira } from '@/lib/utils'

const STATUS_DE_TREM: TremStatus[] = ['ativo', 'manutencao', 'parado']
const OPCOES_DE_STATUS = opcoesDeStatus(STATUS_DE_TREM)

const numero = (texto: string) => Number(texto.replace(',', '.'))

const esquema = z.object({
  prefixo: z.string().trim().min(1, 'Informe o prefixo').max(20, 'Até 20 caracteres'),
  modelo: z.string().trim().min(1, 'Informe o modelo').max(80, 'Até 80 caracteres'),
  ano: z
    .string()
    .trim()
    .refine(
      (texto) => Number.isInteger(numero(texto)) && numero(texto) >= 1900 && numero(texto) <= 2100,
      'Ano entre 1900 e 2100',
    ),
  capacidade_t: z
    .string()
    .trim()
    .refine((texto) => numero(texto) > 0, 'Capacidade maior que zero'),
  status: z.enum(['ativo', 'manutencao', 'parado']),
  ultima_inspecao: z.string(),
  linha_id: z.string(),
})

type ValoresDoFormulario = z.infer<typeof esquema>

interface CampoTextoProps {
  formulario: UseFormReturn<ValoresDoFormulario>
  name: 'prefixo' | 'modelo' | 'ano' | 'capacidade_t' | 'ultima_inspecao'
  rotulo: string
  type?: string
  inputMode?: 'decimal' | 'numeric'
}

function CampoTexto({ formulario, name, rotulo, type = 'text', inputMode }: CampoTextoProps) {
  const id = `trem-${name}`
  const erro = formulario.formState.errors[name]
  return (
    <Field data-invalid={!!erro}>
      <FieldLabel htmlFor={id}>{rotulo}</FieldLabel>
      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        aria-invalid={!!erro}
        {...formulario.register(name)}
      />
      {erro && <FieldError errors={[erro]} />}
    </Field>
  )
}

interface FormularioDeTremProps {
  trem: Trem | null
  linhas: Linha[]
  aoFechar: () => void
}

function FormularioDeTrem({ trem, linhas, aoFechar }: FormularioDeTremProps) {
  const criar = useCriarTrem()
  const atualizar = useAtualizarTrem(trem?.id ?? 0)
  const formulario = useForm<ValoresDoFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      prefixo: trem?.prefixo ?? '',
      modelo: trem?.modelo ?? '',
      ano: trem ? String(trem.ano) : '',
      capacidade_t: trem ? String(trem.capacidade_t) : '',
      status: trem?.status ?? 'ativo',
      ultima_inspecao: trem?.ultima_inspecao ?? '',
      linha_id: trem?.linha_id ? String(trem.linha_id) : '',
    },
  })

  const aoErrar = (erro: Error) => {
    if (erro instanceof ApiError && erro.status === 409) {
      formulario.setError('prefixo', { message: 'Já existe um trem com esse prefixo.' })
      return
    }
    if (tratouErrosDeCampo(erro, formulario)) return
    toast.error(`Não foi possível salvar: ${mensagemDeErro(erro)}`)
  }

  const enviar = formulario.handleSubmit((valores) => {
    if (trem?.ultima_inspecao && !valores.ultima_inspecao) {
      formulario.setError('ultima_inspecao', {
        message: 'Não é possível remover a última inspeção; informe outra data.',
      })
      return
    }
    if (trem?.linha_id && !valores.linha_id) {
      formulario.setError('linha_id', {
        message: 'Não é possível remover a rota do trem; selecione outra rota.',
      })
      return
    }
    const dados = {
      prefixo: valores.prefixo,
      modelo: valores.modelo,
      ano: Number(valores.ano),
      capacidade_t: numero(valores.capacidade_t),
      status: valores.status,
      ultima_inspecao: valores.ultima_inspecao || undefined,
      linha_id: valores.linha_id ? Number(valores.linha_id) : undefined,
    }
    const opcoes = {
      onSuccess: () => {
        toast.success(trem ? 'Trem atualizado' : 'Trem cadastrado')
        aoFechar()
      },
      onError: aoErrar,
    }
    if (trem) {
      atualizar.mutate(dados, opcoes)
      return
    }
    criar.mutate(dados, opcoes)
  })

  const salvando = criar.isPending || atualizar.isPending
  const rotuloDeEnvio = trem ? 'Salvar' : 'Cadastrar'

  return (
    <form
      noValidate
      onSubmit={(evento) => {
        void enviar(evento)
      }}
    >
      <FieldGroup>
        <CampoTexto formulario={formulario} name="prefixo" rotulo="Prefixo" />
        <CampoTexto formulario={formulario} name="modelo" rotulo="Modelo" />
        <CampoTexto formulario={formulario} name="ano" rotulo="Ano" inputMode="numeric" />
        <CampoTexto
          formulario={formulario}
          name="capacidade_t"
          rotulo="Capacidade (t)"
          inputMode="decimal"
        />
        <Controller
          name="status"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="trem-status">Status</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="trem-status"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPCOES_DE_STATUS.map((opcao) => (
                    <SelectItem key={opcao.valor} value={opcao.valor}>
                      {opcao.rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <CampoTexto
          formulario={formulario}
          name="ultima_inspecao"
          rotulo="Última inspeção (opcional)"
          type="date"
        />
        <Controller
          name="linha_id"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="trem-linha">Rota (opcional)</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="trem-linha" className="w-full">
                  <SelectValue placeholder="Sem rota" />
                </SelectTrigger>
                <SelectContent>
                  {linhas.map((linha) => (
                    <SelectItem key={linha.id} value={String(linha.id)}>
                      {linha.numero} · {linha.origem} → {linha.destino}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : rotuloDeEnvio}
        </Button>
      </FieldGroup>
    </form>
  )
}

function FormularioComLinhas({ trem, aoFechar }: { trem: Trem | null; aoFechar: () => void }) {
  const linhas = useLinhas()

  if (linhas.isPending) return <Skeleton className="h-80" />
  if (linhas.error) return <ErroDeCarregamento error={linhas.error} />

  return <FormularioDeTrem trem={trem} linhas={linhas.data} aoFechar={aoFechar} />
}

interface AcoesProps {
  podeEscrever: boolean
  aoEditar: () => void
  aoExcluir: () => void
}

function Acoes({ podeEscrever, aoEditar, aoExcluir }: AcoesProps) {
  if (!podeEscrever) return null
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={aoEditar}>
        <Pencil />
        Editar
      </Button>
      <Button size="sm" variant="destructive" onClick={aoExcluir}>
        <Trash2 />
        Excluir
      </Button>
    </div>
  )
}

interface ListaProps {
  trens: Trem[]
  podeEscrever: boolean
  aoEditar: (trem: Trem) => void
  aoExcluir: (trem: Trem) => void
}

function ListaDeCartoes({ trens, podeEscrever, aoEditar, aoExcluir }: ListaProps) {
  return (
    <ul className="grid gap-3 md:hidden">
      {trens.map((trem) => (
        <li key={trem.id} className="grid gap-3 rounded-xl bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold">{trem.prefixo}</span>
            <SeloDeStatus status={trem.status} />
          </div>
          <dl className="grid grid-cols-2 gap-1 text-sm">
            <dt className="text-muted-foreground">Modelo</dt>
            <dd>{trem.modelo}</dd>
            <dt className="text-muted-foreground">Ano</dt>
            <dd>{trem.ano}</dd>
            <dt className="text-muted-foreground">Capacidade</dt>
            <dd>{trem.capacidade_t} t</dd>
            <dt className="text-muted-foreground">Última inspeção</dt>
            <dd>{trem.ultima_inspecao ? dataBrasileira(trem.ultima_inspecao) : '—'}</dd>
            <dt className="text-muted-foreground">Rota</dt>
            <dd>{trem.linha_numero ?? '—'}</dd>
            <dt className="text-muted-foreground">Sensores</dt>
            <dd>{trem.total_sensores}</dd>
          </dl>
          <Acoes
            podeEscrever={podeEscrever}
            aoEditar={() => {
              aoEditar(trem)
            }}
            aoExcluir={() => {
              aoExcluir(trem)
            }}
          />
        </li>
      ))}
    </ul>
  )
}

function TabelaDeTrens({ trens, podeEscrever, aoEditar, aoExcluir }: ListaProps) {
  return (
    <div className="hidden rounded-xl bg-card p-4 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prefixo</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>Capacidade (t)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Última inspeção</TableHead>
            <TableHead>Rota</TableHead>
            <TableHead>Sensores</TableHead>
            {podeEscrever && <TableHead>Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {trens.map((trem) => (
            <TableRow key={trem.id}>
              <TableCell className="font-bold">{trem.prefixo}</TableCell>
              <TableCell>{trem.modelo}</TableCell>
              <TableCell>{trem.ano}</TableCell>
              <TableCell>{trem.capacidade_t}</TableCell>
              <TableCell>
                <SeloDeStatus status={trem.status} />
              </TableCell>
              <TableCell>
                {trem.ultima_inspecao ? dataBrasileira(trem.ultima_inspecao) : '—'}
              </TableCell>
              <TableCell>{trem.linha_numero ?? '—'}</TableCell>
              <TableCell>{trem.total_sensores}</TableCell>
              {podeEscrever && (
                <TableCell>
                  <Acoes
                    podeEscrever
                    aoEditar={() => {
                      aoEditar(trem)
                    }}
                    aoExcluir={() => {
                      aoExcluir(trem)
                    }}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface ConteudoProps {
  busca: string
  status: string
  podeEscrever: boolean
  aoEditar: (trem: Trem) => void
  aoExcluir: (trem: Trem) => void
}

function ConteudoDeTrens({ busca, status, podeEscrever, aoEditar, aoExcluir }: ConteudoProps) {
  const filtroDeStatus = STATUS_DE_TREM.find((item) => item === status)
  const { data: trens, isPending, error } = useTrens({ busca, status: filtroDeStatus })

  if (isPending) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 6 }, (_, indice) => (
          <Skeleton key={indice} className="h-12" />
        ))}
      </div>
    )
  }
  if (error) return <ErroDeCarregamento error={error} />
  if (trens.length === 0) {
    return <p className="text-muted-foreground">Nenhum trem encontrado.</p>
  }

  return (
    <>
      <ListaDeCartoes
        trens={trens}
        podeEscrever={podeEscrever}
        aoEditar={aoEditar}
        aoExcluir={aoExcluir}
      />
      <TabelaDeTrens
        trens={trens}
        podeEscrever={podeEscrever}
        aoEditar={aoEditar}
        aoExcluir={aoExcluir}
      />
    </>
  )
}

export default function Trens() {
  const { usuario } = useAutenticacao()
  const podeEscrever = usuario?.papel === 'gestao'
  const excluir = useExcluirTrem()
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('todos')
  const [emEdicao, setEmEdicao] = useState<Trem | 'novo' | null>(null)
  const [paraExcluir, setParaExcluir] = useState<Trem | null>(null)
  const tremEmEdicao = emEdicao === 'novo' ? null : emEdicao

  const confirmarExclusao = (trem: Trem) => {
    excluir.mutate(trem.id, {
      onSuccess: () => {
        toast.success('Trem excluído')
      },
      onError: (erro) => {
        if (erro instanceof ApiError && erro.status === 409) {
          toast.error('Este trem tem sensores vinculados. Exclua ou transfira os sensores antes.')
          return
        }
        toast.error(`Não foi possível excluir: ${mensagemDeErro(erro)}`)
      },
    })
  }

  return (
    <>
      <CabecalhoDeTela
        title="Trens"
        actions={
          podeEscrever && (
            <Button
              size="sm"
              onClick={() => {
                setEmEdicao('novo')
              }}
            >
              <Plus />
              Cadastrar
            </Button>
          )
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <Input
          type="search"
          aria-label="Buscar trem"
          placeholder="Buscar por prefixo ou modelo"
          value={busca}
          onChange={(evento) => {
            setBusca(evento.target.value)
          }}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="Filtrar por status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {OPCOES_DE_STATUS.map((opcao) => (
              <SelectItem key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ConteudoDeTrens
        busca={busca}
        status={status}
        podeEscrever={podeEscrever}
        aoEditar={setEmEdicao}
        aoExcluir={setParaExcluir}
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
              {tremEmEdicao ? `Editar ${tremEmEdicao.prefixo}` : 'Cadastrar trem'}
            </DialogTitle>
            <DialogDescription>
              {tremEmEdicao ? 'Altere os dados do trem.' : 'Informe os dados do novo trem.'}
            </DialogDescription>
          </DialogHeader>
          <FormularioComLinhas
            key={tremEmEdicao?.id ?? 'novo'}
            trem={tremEmEdicao}
            aoFechar={() => {
              setEmEdicao(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={paraExcluir !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setParaExcluir(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir o trem {paraExcluir?.prefixo}?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (paraExcluir) confirmarExclusao(paraExcluir)
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
