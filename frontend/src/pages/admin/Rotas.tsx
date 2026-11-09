import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Route, Train } from 'lucide-react'
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
import { ListaDeViagens } from '@/components/ui/lista-de-viagens'
import { RotuloDeDado } from '@/components/ui/rotulo-de-dado'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SeloDeStatus, STATUS_DE_VIAGEM } from '@/components/ui/selo-de-status'
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
import { useAutenticacao } from '@/contexts/Autenticacao'
import { useAtualizarLinha, useCriarLinha, useExcluirLinha, useLinhas } from '@/hooks/linhas'
import { useTrens } from '@/hooks/trens'
import { useAtualizarViagem, useCriarViagem, useExcluirViagem, useViagens } from '@/hooks/viagens'
import {
  ApiError,
  tratouErrosDeCampo,
  type Linha,
  type LinhaStatus,
  type Trem,
  type Viagem,
  type ViagemNova,
} from '@/lib/api'

const STATUS_DE_ROTA = [
  'na_estacao',
  'ja_partiu',
  'atraso',
  'manutencao',
  'fechado',
] as const satisfies readonly LinhaStatus[]
const TODOS = 'todos'

const paraCampoDeData = (iso: string) => {
  const data = new Date(`${iso}Z`)
  return new Date(data.getTime() - data.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

const paraApi = (campo: string) => new Date(campo).toISOString().slice(0, 19)

const esquemaDeRota = z.object({
  numero: z.string().trim().min(1, 'Informe o número'),
  origem: z.string().trim().min(1, 'Informe a origem'),
  destino: z.string().trim().min(1, 'Informe o destino'),
  status: z.enum(STATUS_DE_ROTA),
  ativo: z.boolean(),
})

type ValoresDeRota = z.infer<typeof esquemaDeRota>

const esquemaDeViagem = z
  .object({
    linha_id: z.string().min(1, 'Selecione a rota'),
    trem_id: z.string().min(1, 'Selecione o trem'),
    partida_prevista: z.string().min(1, 'Informe a partida'),
    chegada_prevista: z.string().min(1, 'Informe a chegada'),
    status: z.enum(STATUS_DE_VIAGEM),
  })
  .refine((valores) => valores.chegada_prevista > valores.partida_prevista, {
    message: 'A chegada deve ser depois da partida',
    path: ['chegada_prevista'],
  })

type ValoresDeViagem = z.infer<typeof esquemaDeViagem>

interface Chamadas {
  onSuccess: () => void
  onError: (erro: Error) => void
}

function EsqueletoDeLista() {
  return (
    <div role="status" aria-label="Carregando" className="grid gap-3">
      {Array.from({ length: 4 }, (_, indice) => (
        <Skeleton key={indice} className="h-40 md:h-14" />
      ))}
    </div>
  )
}

function RodapeDeFormulario({ salvando, rotulo }: { salvando: boolean; rotulo: string }) {
  return (
    <DialogFooter className="*:w-full sm:*:w-auto">
      <DialogClose asChild>
        <Button type="button" variant="outline">
          Cancelar
        </Button>
      </DialogClose>
      <Button type="submit" disabled={salvando}>
        {salvando ? 'Salvando…' : rotulo}
      </Button>
    </DialogFooter>
  )
}

interface CampoTextoProps {
  formulario: UseFormReturn<ValoresDeRota>
  name: 'numero' | 'origem' | 'destino'
  rotulo: string
}

function CampoTexto({ formulario, name, rotulo }: CampoTextoProps) {
  const id = `rota-${name}`
  const erro = formulario.formState.errors[name]
  return (
    <Field data-invalid={!!erro}>
      <FieldLabel htmlFor={id}>{rotulo}</FieldLabel>
      <Input id={id} aria-invalid={!!erro} {...formulario.register(name)} />
      {erro && <FieldError errors={[erro]} />}
    </Field>
  )
}

interface CorpoDeFormularioDeRotaProps {
  rota: Linha | null
  salvando: boolean
  mutar: (valores: ValoresDeRota, chamadas: Chamadas) => void
  aoFechar: () => void
}

function CorpoDeFormularioDeRota({
  rota,
  salvando,
  mutar,
  aoFechar,
}: CorpoDeFormularioDeRotaProps) {
  const formulario = useForm<ValoresDeRota>({
    resolver: zodResolver(esquemaDeRota),
    defaultValues: {
      numero: rota?.numero ?? '',
      origem: rota?.origem ?? '',
      destino: rota?.destino ?? '',
      status: rota?.status ?? 'na_estacao',
      ativo: rota?.ativo ?? true,
    },
  })

  const aoErrar = (erro: Error) => {
    if (erro instanceof ApiError && erro.status === 409) {
      formulario.setError('numero', { message: 'Já existe uma rota com este número' })
      return
    }
    if (tratouErrosDeCampo(erro, formulario)) return
    toast.error(`Não foi possível salvar: ${mensagemDeErro(erro)}`)
  }

  const enviar = formulario.handleSubmit((valores) => {
    const onSuccess = () => {
      toast.success(rota ? 'Rota atualizada' : 'Rota cadastrada')
      aoFechar()
    }
    mutar(valores, { onSuccess, onError: aoErrar })
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(evento) => {
        void enviar(evento)
      }}
    >
      <FieldGroup>
        <CampoTexto formulario={formulario} name="numero" rotulo="Número" />
        <div className="grid gap-7 sm:grid-cols-2">
          <CampoTexto formulario={formulario} name="origem" rotulo="Origem" />
          <CampoTexto formulario={formulario} name="destino" rotulo="Destino" />
        </div>
        <Controller
          name="status"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="rota-status">Status</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="rota-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_DE_ROTA.map((status) => (
                    <SelectItem key={status} value={status}>
                      <SeloDeStatus status={status} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="ativo"
          control={formulario.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Switch id="rota-ativo" checked={field.value} onCheckedChange={field.onChange} />
              <FieldLabel htmlFor="rota-ativo">Rota ativa na malha</FieldLabel>
            </Field>
          )}
        />
      </FieldGroup>
      <RodapeDeFormulario
        salvando={salvando}
        rotulo={rota ? 'Salvar alterações' : 'Cadastrar rota'}
      />
    </form>
  )
}

function CadastroDeRota({ aoFechar }: { aoFechar: () => void }) {
  const criar = useCriarLinha()
  return (
    <CorpoDeFormularioDeRota
      rota={null}
      salvando={criar.isPending}
      mutar={(valores, chamadas) => {
        criar.mutate(valores, chamadas)
      }}
      aoFechar={aoFechar}
    />
  )
}

function EdicaoDeRota({ rota, aoFechar }: { rota: Linha; aoFechar: () => void }) {
  const atualizar = useAtualizarLinha(rota.id)
  return (
    <CorpoDeFormularioDeRota
      rota={rota}
      salvando={atualizar.isPending}
      mutar={(valores, chamadas) => {
        atualizar.mutate(valores, chamadas)
      }}
      aoFechar={aoFechar}
    />
  )
}

function FormularioDeRota({ rota, aoFechar }: { rota: Linha | null; aoFechar: () => void }) {
  if (rota) return <EdicaoDeRota rota={rota} aoFechar={aoFechar} />
  return <CadastroDeRota aoFechar={aoFechar} />
}

interface ListaDeRotasProps {
  rotas: Linha[]
  podeEscrever: boolean
  aoEditar: (rota: Linha) => void
  aoExcluir: (rota: Linha) => void
}

function ListaDeRotas({ rotas, podeEscrever, aoEditar, aoExcluir }: ListaDeRotasProps) {
  return (
    <>
      <ul className="grid gap-3 md:hidden">
        {rotas.map((rota) => (
          <li key={rota.id}>
            <Card className="gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <RotuloDeDado>Rota</RotuloDeDado>
                  <p className="text-2xl leading-tight font-bold tabular-nums">{rota.numero}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <SeloDeStatus status={rota.status} />
                  <SeloDeStatus status={rota.ativo ? 'ativo' : 'inativo'} />
                </div>
              </div>
              <div>
                <RotuloDeDado>Trajeto</RotuloDeDado>
                <p className="leading-snug break-words">
                  {rota.origem} → {rota.destino}
                </p>
              </div>
              {podeEscrever && (
                <AcoesDeLinha
                  nome={`rota ${rota.numero}`}
                  aoEditar={() => {
                    aoEditar(rota)
                  }}
                  aoExcluir={() => {
                    aoExcluir(rota)
                  }}
                />
              )}
            </Card>
          </li>
        ))}
      </ul>
      <Card className="hidden gap-0 px-2 py-2 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rota</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Situação</TableHead>
              {podeEscrever && <TableHead>Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rotas.map((rota) => (
              <TableRow key={rota.id}>
                <TableCell className="font-semibold tabular-nums">{rota.numero}</TableCell>
                <TableCell>{rota.origem}</TableCell>
                <TableCell>{rota.destino}</TableCell>
                <TableCell>
                  <SeloDeStatus status={rota.status} />
                </TableCell>
                <TableCell>
                  <SeloDeStatus status={rota.ativo ? 'ativo' : 'inativo'} />
                </TableCell>
                {podeEscrever && (
                  <TableCell>
                    <AcoesDeLinha
                      nome={`rota ${rota.numero}`}
                      aoEditar={() => {
                        aoEditar(rota)
                      }}
                      aoExcluir={() => {
                        aoExcluir(rota)
                      }}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}

function SecaoDeRotas({ podeEscrever }: { podeEscrever: boolean }) {
  const { data: rotas, isPending, error, refetch } = useLinhas()
  const excluir = useExcluirLinha()
  const [emEdicao, setEmEdicao] = useState<Linha | 'nova' | null>(null)
  const [paraExcluir, setParaExcluir] = useState<Linha | null>(null)
  const rotaEmEdicao = emEdicao === 'nova' ? null : emEdicao

  const abrirCadastro = () => {
    setEmEdicao('nova')
  }

  const confirmarExclusao = (rota: Linha) => {
    excluir.mutate(rota.id, {
      onSuccess: () => {
        toast.success('Rota excluída')
      },
      onError: (erro) => {
        if (erro instanceof ApiError && erro.status === 409) {
          toast.error('Esta rota tem viagens programadas e não pode ser excluída.')
          return
        }
        toast.error(`Não foi possível excluir: ${mensagemDeErro(erro)}`)
      },
    })
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {podeEscrever && (
        <Button className="w-full sm:w-auto sm:self-end" onClick={abrirCadastro}>
          <Plus aria-hidden />
          Cadastrar rota
        </Button>
      )}

      {isPending && <EsqueletoDeLista />}
      {error && (
        <ErroDeCarregamento
          error={error}
          aoTentarDeNovo={() => {
            void refetch()
          }}
        />
      )}
      {rotas?.length === 0 && (
        <EstadoVazio
          icone={Route}
          titulo="Nenhuma rota cadastrada"
          descricao="A malha ainda não tem rotas. Cadastre a primeira para programar viagens."
          acao={
            podeEscrever && (
              <Button onClick={abrirCadastro}>
                <Plus aria-hidden />
                Cadastrar rota
              </Button>
            )
          }
        />
      )}
      {rotas && rotas.length > 0 && (
        <ListaDeRotas
          rotas={rotas}
          podeEscrever={podeEscrever}
          aoEditar={setEmEdicao}
          aoExcluir={setParaExcluir}
        />
      )}

      <Dialog
        open={emEdicao !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setEmEdicao(null)
        }}
      >
        <DialogContent className="max-h-dvh overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {rotaEmEdicao ? `Editar rota ${rotaEmEdicao.numero}` : 'Cadastrar rota'}
            </DialogTitle>
            <DialogDescription>Trajeto e situação operacional da rota.</DialogDescription>
          </DialogHeader>
          <FormularioDeRota
            key={rotaEmEdicao?.id ?? 'nova'}
            rota={rotaEmEdicao}
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
            <AlertDialogTitle>Excluir a rota {paraExcluir?.numero}?</AlertDialogTitle>
            <AlertDialogDescription>
              A rota some da malha. Não é possível excluir uma rota que tem viagens.
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
              Excluir rota
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface CorpoDeFormularioDeViagemProps {
  viagem: Viagem | null
  rotas: Linha[]
  trens: Trem[]
  salvando: boolean
  mutar: (dados: ViagemNova, chamadas: Chamadas) => void
  aoFechar: () => void
}

function CorpoDeFormularioDeViagem({
  viagem,
  rotas,
  trens,
  salvando,
  mutar,
  aoFechar,
}: CorpoDeFormularioDeViagemProps) {
  const formulario = useForm<ValoresDeViagem>({
    resolver: zodResolver(esquemaDeViagem),
    defaultValues: {
      linha_id: viagem ? String(viagem.linha_id) : '',
      trem_id: viagem ? String(viagem.trem_id) : '',
      partida_prevista: viagem ? paraCampoDeData(viagem.partida_prevista) : '',
      chegada_prevista: viagem ? paraCampoDeData(viagem.chegada_prevista) : '',
      status: viagem?.status ?? 'programada',
    },
  })

  const aoErrar = (erro: Error) => {
    if (tratouErrosDeCampo(erro, formulario)) return
    toast.error(`Não foi possível salvar: ${mensagemDeErro(erro)}`)
  }

  const enviar = formulario.handleSubmit((valores) => {
    const dados = {
      linha_id: Number(valores.linha_id),
      trem_id: Number(valores.trem_id),
      partida_prevista: paraApi(valores.partida_prevista),
      chegada_prevista: paraApi(valores.chegada_prevista),
      status: valores.status,
    }
    const onSuccess = () => {
      toast.success(viagem ? 'Viagem atualizada' : 'Viagem programada')
      aoFechar()
    }
    mutar(dados, { onSuccess, onError: aoErrar })
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(evento) => {
        void enviar(evento)
      }}
    >
      <FieldGroup>
        <Controller
          name="linha_id"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="viagem-rota">Rota</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="viagem-rota"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Selecione a rota" />
                </SelectTrigger>
                <SelectContent>
                  {rotas.map((rota) => (
                    <SelectItem key={rota.id} value={String(rota.id)}>
                      {rota.numero} · {rota.origem} → {rota.destino}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="trem_id"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="viagem-trem">Trem</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="viagem-trem"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Selecione o trem" />
                </SelectTrigger>
                <SelectContent>
                  {trens.map((trem) => (
                    <SelectItem key={trem.id} value={String(trem.id)}>
                      {trem.prefixo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field data-invalid={!!formulario.formState.errors.partida_prevista}>
          <FieldLabel htmlFor="viagem-partida">Partida prevista</FieldLabel>
          <Input
            id="viagem-partida"
            type="datetime-local"
            aria-invalid={!!formulario.formState.errors.partida_prevista}
            {...formulario.register('partida_prevista')}
          />
          {formulario.formState.errors.partida_prevista && (
            <FieldError errors={[formulario.formState.errors.partida_prevista]} />
          )}
        </Field>
        <Field data-invalid={!!formulario.formState.errors.chegada_prevista}>
          <FieldLabel htmlFor="viagem-chegada">Chegada prevista</FieldLabel>
          <Input
            id="viagem-chegada"
            type="datetime-local"
            aria-invalid={!!formulario.formState.errors.chegada_prevista}
            {...formulario.register('chegada_prevista')}
          />
          {formulario.formState.errors.chegada_prevista && (
            <FieldError errors={[formulario.formState.errors.chegada_prevista]} />
          )}
        </Field>
        <Controller
          name="status"
          control={formulario.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="viagem-status">Status</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="viagem-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_DE_VIAGEM.map((status) => (
                    <SelectItem key={status} value={status}>
                      <SeloDeStatus status={status} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </FieldGroup>
      <RodapeDeFormulario
        salvando={salvando}
        rotulo={viagem ? 'Salvar alterações' : 'Programar viagem'}
      />
    </form>
  )
}

interface FormularioDeViagemProps {
  viagem: Viagem | null
  rotas: Linha[]
  trens: Trem[]
  aoFechar: () => void
}

function CadastroDeViagem({ rotas, trens, aoFechar }: Omit<FormularioDeViagemProps, 'viagem'>) {
  const criar = useCriarViagem()
  return (
    <CorpoDeFormularioDeViagem
      viagem={null}
      rotas={rotas}
      trens={trens}
      salvando={criar.isPending}
      mutar={(dados, chamadas) => {
        criar.mutate(dados, chamadas)
      }}
      aoFechar={aoFechar}
    />
  )
}

function EdicaoDeViagem({
  viagem,
  rotas,
  trens,
  aoFechar,
}: Omit<FormularioDeViagemProps, 'viagem'> & { viagem: Viagem }) {
  const atualizar = useAtualizarViagem(viagem.id)
  return (
    <CorpoDeFormularioDeViagem
      viagem={viagem}
      rotas={rotas}
      trens={trens}
      salvando={atualizar.isPending}
      mutar={(dados, chamadas) => {
        atualizar.mutate(dados, chamadas)
      }}
      aoFechar={aoFechar}
    />
  )
}

function FormularioDeViagem({ viagem, rotas, trens, aoFechar }: FormularioDeViagemProps) {
  if (viagem) {
    return <EdicaoDeViagem viagem={viagem} rotas={rotas} trens={trens} aoFechar={aoFechar} />
  }
  return <CadastroDeViagem rotas={rotas} trens={trens} aoFechar={aoFechar} />
}

function FormularioComOpcoes({
  viagem,
  aoFechar,
}: {
  viagem: Viagem | null
  aoFechar: () => void
}) {
  const rotas = useLinhas()
  const trens = useTrens()

  if (rotas.isPending || trens.isPending) return <Skeleton className="h-80" />
  if (rotas.error) {
    return (
      <ErroDeCarregamento
        error={rotas.error}
        aoTentarDeNovo={() => {
          void rotas.refetch()
        }}
      />
    )
  }
  if (trens.error) {
    return (
      <ErroDeCarregamento
        error={trens.error}
        aoTentarDeNovo={() => {
          void trens.refetch()
        }}
      />
    )
  }

  return (
    <FormularioDeViagem viagem={viagem} rotas={rotas.data} trens={trens.data} aoFechar={aoFechar} />
  )
}

function SecaoDeViagens({ podeEscrever }: { podeEscrever: boolean }) {
  const [filtroDeStatus, setFiltroDeStatus] = useState(TODOS)
  const [filtroDeTrem, setFiltroDeTrem] = useState(TODOS)
  const [filtroDeRota, setFiltroDeRota] = useState(TODOS)
  const [filtroDeData, setFiltroDeData] = useState('')
  const status = STATUS_DE_VIAGEM.find((item) => item === filtroDeStatus)
  const {
    data: viagens,
    isPending,
    error,
    refetch,
  } = useViagens({
    status,
    trem_id: filtroDeTrem === TODOS ? undefined : Number(filtroDeTrem),
    linha_id: filtroDeRota === TODOS ? undefined : Number(filtroDeRota),
    data: filtroDeData || undefined,
  })
  const rotas = useLinhas()
  const trens = useTrens()
  const excluir = useExcluirViagem()
  const [emEdicao, setEmEdicao] = useState<Viagem | 'nova' | null>(null)
  const [paraExcluir, setParaExcluir] = useState<Viagem | null>(null)
  const viagemEmEdicao = emEdicao === 'nova' ? null : emEdicao

  const abrirCadastro = () => {
    setEmEdicao('nova')
  }

  const confirmarExclusao = (viagem: Viagem) => {
    excluir.mutate(viagem.id, {
      onSuccess: () => {
        toast.success('Viagem excluída')
      },
      onError: (erro) => toast.error(`Não foi possível excluir: ${mensagemDeErro(erro)}`),
    })
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col gap-4">
        {podeEscrever && (
          <Button className="w-full sm:w-auto sm:self-end" onClick={abrirCadastro}>
            <Plus aria-hidden />
            Programar viagem
          </Button>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field className="gap-2">
            <FieldLabel htmlFor="filtro-status">Status</FieldLabel>
            <Select value={filtroDeStatus} onValueChange={setFiltroDeStatus}>
              <SelectTrigger id="filtro-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                {STATUS_DE_VIAGEM.map((item) => (
                  <SelectItem key={item} value={item}>
                    <SeloDeStatus status={item} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="filtro-rota">Rota</FieldLabel>
            <Select value={filtroDeRota} onValueChange={setFiltroDeRota}>
              <SelectTrigger id="filtro-rota" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todas</SelectItem>
                {rotas.data?.map((rota) => (
                  <SelectItem key={rota.id} value={String(rota.id)}>
                    {rota.numero} · {rota.origem} → {rota.destino}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="filtro-trem">Trem</FieldLabel>
            <Select value={filtroDeTrem} onValueChange={setFiltroDeTrem}>
              <SelectTrigger id="filtro-trem" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                {trens.data?.map((trem) => (
                  <SelectItem key={trem.id} value={String(trem.id)}>
                    {trem.prefixo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="filtro-dia">Dia</FieldLabel>
            <Input
              id="filtro-dia"
              type="date"
              value={filtroDeData}
              onChange={(evento) => {
                setFiltroDeData(evento.target.value)
              }}
            />
          </Field>
        </div>
      </div>

      {isPending && <EsqueletoDeLista />}
      {error && (
        <ErroDeCarregamento
          error={error}
          aoTentarDeNovo={() => {
            void refetch()
          }}
        />
      )}
      {viagens?.length === 0 && (
        <EstadoVazio
          icone={Train}
          titulo="Nenhuma viagem encontrada"
          descricao="Nenhuma viagem bate com os filtros. Troque o filtro ou programe uma viagem."
          acao={
            podeEscrever && (
              <Button onClick={abrirCadastro}>
                <Plus aria-hidden />
                Programar viagem
              </Button>
            )
          }
        />
      )}
      {viagens && viagens.length > 0 && (
        <ListaDeViagens
          viagens={viagens}
          acoes={
            podeEscrever
              ? (viagem) => (
                  <AcoesDeLinha
                    nome={`viagem da rota ${viagem.linha_numero}`}
                    aoEditar={() => {
                      setEmEdicao(viagem)
                    }}
                    aoExcluir={() => {
                      setParaExcluir(viagem)
                    }}
                  />
                )
              : undefined
          }
        />
      )}

      <Dialog
        open={emEdicao !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setEmEdicao(null)
        }}
      >
        <DialogContent className="max-h-dvh overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viagemEmEdicao ? 'Editar viagem' : 'Programar viagem'}</DialogTitle>
            <DialogDescription>Rota, trem e horários previstos.</DialogDescription>
          </DialogHeader>
          <FormularioComOpcoes
            key={viagemEmEdicao?.id ?? 'nova'}
            viagem={viagemEmEdicao}
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
            <AlertDialogTitle>
              Excluir a viagem da rota {paraExcluir?.linha_numero}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              A viagem sai da programação. Para manter o histórico, prefira marcá-la como cancelada.
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
              Excluir viagem
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function Rotas() {
  const { usuario } = useAutenticacao()
  const podeEscrever = usuario?.papel === 'gestao'

  return (
    <>
      <CabecalhoDeTela title="Rotas" apoio="Malha ferroviária e viagens programadas." />
      <Tabs defaultValue="rotas" className="gap-4 lg:gap-6">
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="rotas">Rotas</TabsTrigger>
          <TabsTrigger value="viagens">Viagens</TabsTrigger>
        </TabsList>
        <TabsContent value="rotas">
          <SecaoDeRotas podeEscrever={podeEscrever} />
        </TabsContent>
        <TabsContent value="viagens">
          <SecaoDeViagens podeEscrever={podeEscrever} />
        </TabsContent>
      </Tabs>
    </>
  )
}
