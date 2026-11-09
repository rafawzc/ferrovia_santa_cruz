import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Train } from 'lucide-react'
import { Controller, useForm, type UseFormReturn } from 'react-hook-form'
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
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { Card } from '@/components/ui/card'
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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Dado } from '@/components/ui/rotulo-de-dado'
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
import { dataBrasileira, formatarNumero } from '@/lib/utils'

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
  const rotuloDeEnvio = trem ? 'Salvar alterações' : 'Cadastrar trem'

  return (
    <form
      noValidate
      className="grid gap-6"
      onSubmit={(evento) => {
        void enviar(evento)
      }}
    >
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
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
            <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
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
      </FieldGroup>
      <DialogFooter className="*:w-full sm:*:w-auto">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : rotuloDeEnvio}
        </Button>
      </DialogFooter>
    </form>
  )
}

function FormularioComLinhas({ trem, aoFechar }: { trem: Trem | null; aoFechar: () => void }) {
  const linhas = useLinhas()

  if (linhas.isPending) return <Skeleton className="h-80" />
  if (linhas.error) {
    return (
      <ErroDeCarregamento
        error={linhas.error}
        aoTentarDeNovo={() => {
          void linhas.refetch()
        }}
      />
    )
  }

  return <FormularioDeTrem trem={trem} linhas={linhas.data} aoFechar={aoFechar} />
}

const capacidadeDoTrem = (trem: Trem) => `${formatarNumero(trem.capacidade_t)} t`

const inspecaoDoTrem = (trem: Trem) =>
  trem.ultima_inspecao ? dataBrasileira(trem.ultima_inspecao) : '—'

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
        <li key={trem.id}>
          <Card className="gap-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xl leading-tight font-semibold">{trem.prefixo}</p>
                <p className="text-rotulo text-muted-foreground">{trem.modelo}</p>
              </div>
              <SeloDeStatus status={trem.status} />
            </div>
            <dl className="grid gap-2 text-corpo">
              <Dado rotulo="Ano" valor={trem.ano} />
              <Dado rotulo="Capacidade" valor={capacidadeDoTrem(trem)} />
              <Dado rotulo="Última inspeção" valor={inspecaoDoTrem(trem)} />
              <Dado rotulo="Rota" valor={trem.linha_numero ?? '—'} />
              <Dado rotulo="Sensores" valor={trem.total_sensores} />
            </dl>
            {podeEscrever && (
              <AcoesDeLinha
                nome={`trem ${trem.prefixo}`}
                aoEditar={() => {
                  aoEditar(trem)
                }}
                aoExcluir={() => {
                  aoExcluir(trem)
                }}
              />
            )}
          </Card>
        </li>
      ))}
    </ul>
  )
}

function TabelaDeTrens({ trens, podeEscrever, aoEditar, aoExcluir }: ListaProps) {
  return (
    <Card className="hidden gap-0 px-2 py-2 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trem</TableHead>
            <TableHead className="text-right">Ano</TableHead>
            <TableHead className="text-right">Capacidade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Última inspeção</TableHead>
            <TableHead>Rota</TableHead>
            <TableHead className="text-right">Sensores</TableHead>
            {podeEscrever && <TableHead className="text-right">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {trens.map((trem) => (
            <TableRow key={trem.id}>
              <TableCell>
                <span className="font-bold">{trem.prefixo}</span>
                <span className="block text-rotulo text-muted-foreground">{trem.modelo}</span>
              </TableCell>
              <TableCell className="text-right tabular-nums">{trem.ano}</TableCell>
              <TableCell className="text-right tabular-nums">{capacidadeDoTrem(trem)}</TableCell>
              <TableCell>
                <SeloDeStatus status={trem.status} />
              </TableCell>
              <TableCell>{inspecaoDoTrem(trem)}</TableCell>
              <TableCell>{trem.linha_numero ?? '—'}</TableCell>
              <TableCell className="text-right tabular-nums">{trem.total_sensores}</TableCell>
              {podeEscrever && (
                <TableCell>
                  <AcoesDeLinha
                    nome={`trem ${trem.prefixo}`}
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
    </Card>
  )
}

function EsqueletoDeTrens() {
  return (
    <div role="status" aria-label="Carregando" className="grid gap-3">
      {Array.from({ length: 5 }, (_, indice) => (
        <Skeleton key={indice} className="h-48 md:h-16" />
      ))}
    </div>
  )
}

interface VazioProps {
  temFiltro: boolean
  podeEscrever: boolean
  aoLimparFiltros: () => void
  aoCadastrar: () => void
}

function SemTrens({ temFiltro, podeEscrever, aoLimparFiltros, aoCadastrar }: VazioProps) {
  return (
    <EstadoVazio
      icone={Train}
      titulo={temFiltro ? 'Nenhum trem nesse filtro' : 'Nenhum trem cadastrado'}
      descricao={
        temFiltro
          ? 'Mude a busca ou o status para ver outros trens da frota.'
          : 'A frota aparece aqui assim que o primeiro trem for cadastrado.'
      }
      acao={
        temFiltro ? (
          <Button variant="outline" onClick={aoLimparFiltros}>
            Limpar filtros
          </Button>
        ) : (
          podeEscrever && (
            <Button onClick={aoCadastrar}>
              <Plus aria-hidden />
              Cadastrar primeiro trem
            </Button>
          )
        )
      }
    />
  )
}

interface ConteudoProps {
  busca: string
  status: string
  podeEscrever: boolean
  aoEditar: (trem: Trem) => void
  aoExcluir: (trem: Trem) => void
  aoLimparFiltros: () => void
  aoCadastrar: () => void
}

function ConteudoDeTrens({
  busca,
  status,
  podeEscrever,
  aoEditar,
  aoExcluir,
  aoLimparFiltros,
  aoCadastrar,
}: ConteudoProps) {
  const filtroDeStatus = STATUS_DE_TREM.find((item) => item === status)
  const { data: trens, isPending, error, refetch } = useTrens({ busca, status: filtroDeStatus })

  if (isPending) return <EsqueletoDeTrens />
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
  if (trens.length === 0) {
    return (
      <SemTrens
        temFiltro={busca !== '' || status !== 'todos'}
        podeEscrever={podeEscrever}
        aoLimparFiltros={aoLimparFiltros}
        aoCadastrar={aoCadastrar}
      />
    )
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

  const abrirCadastro = () => {
    setEmEdicao('novo')
  }

  const limparFiltros = () => {
    setBusca('')
    setStatus('todos')
  }

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
        apoio={podeEscrever ? undefined : 'Cadastro, edição e exclusão da frota são da gestão.'}
        actions={
          podeEscrever && (
            <Button onClick={abrirCadastro}>
              <Plus aria-hidden />
              Cadastrar trem
            </Button>
          )
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <Input
          type="search"
          className="md:col-span-2"
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
              {tremEmEdicao ? `Editar o trem ${tremEmEdicao.prefixo}` : 'Cadastrar trem'}
            </DialogTitle>
            <DialogDescription>
              {tremEmEdicao
                ? 'Altere os dados da composição e salve.'
                : 'Informe os dados da nova composição.'}
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
            <AlertDialogDescription>
              Só é possível excluir trens sem sensores vinculados. A ação não se desfaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (paraExcluir) confirmarExclusao(paraExcluir)
              }}
            >
              Excluir trem
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
