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
import { SeloDeStatus } from '@/components/ui/selo-de-status'
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
  type ViagemStatus,
} from '@/lib/api'
import { dataHora } from '@/lib/utils'

const STATUS_DE_ROTA = [
  'na_estacao',
  'ja_partiu',
  'atraso',
  'manutencao',
  'fechado',
] as const satisfies readonly LinhaStatus[]
const STATUS_DE_VIAGEM = [
  'programada',
  'em_andamento',
  'atrasada',
  'concluida',
  'cancelada',
] as const satisfies readonly ViagemStatus[]
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

interface Chamadas {
  onSuccess: () => void
  onError: (erro: Error) => void
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
      onSubmit={(evento) => {
        void enviar(evento)
      }}
    >
      <FieldGroup>
        <CampoTexto formulario={formulario} name="numero" rotulo="Número" />
        <CampoTexto formulario={formulario} name="origem" rotulo="Origem" />
        <CampoTexto formulario={formulario} name="destino" rotulo="Destino" />
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
              <FieldLabel htmlFor="rota-ativo">Rota ativa</FieldLabel>
            </Field>
          )}
        />
        <Button type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : rota ? 'Salvar' : 'Cadastrar'}
        </Button>
      </FieldGroup>
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
          <li key={rota.id} className="flex flex-col gap-3 rounded-xl bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold">Rota {rota.numero}</span>
              <SeloDeStatus status={rota.status} />
            </div>
            <p>
              {rota.origem} → {rota.destino}
            </p>
            {!rota.ativo && <p className="text-sm text-muted-foreground">Inativa</p>}
            <Acoes
              podeEscrever={podeEscrever}
              aoEditar={() => {
                aoEditar(rota)
              }}
              aoExcluir={() => {
                aoExcluir(rota)
              }}
            />
          </li>
        ))}
      </ul>
      <div className="hidden rounded-xl bg-card p-4 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ativa</TableHead>
              {podeEscrever && <TableHead>Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rotas.map((rota) => (
              <TableRow key={rota.id}>
                <TableCell>{rota.numero}</TableCell>
                <TableCell>{rota.origem}</TableCell>
                <TableCell>{rota.destino}</TableCell>
                <TableCell>
                  <SeloDeStatus status={rota.status} />
                </TableCell>
                <TableCell>{rota.ativo ? 'Sim' : 'Não'}</TableCell>
                {podeEscrever && (
                  <TableCell>
                    <Acoes
                      podeEscrever
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
      </div>
    </>
  )
}

function Carregando() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }, (_, indice) => (
        <Skeleton key={indice} className="h-24 md:h-10" />
      ))}
    </div>
  )
}

function SecaoDeRotas({ podeEscrever }: { podeEscrever: boolean }) {
  const { data: rotas, isPending, error } = useLinhas()
  const excluir = useExcluirLinha()
  const [emEdicao, setEmEdicao] = useState<Linha | 'nova' | null>(null)
  const [paraExcluir, setParaExcluir] = useState<Linha | null>(null)
  const rotaEmEdicao = emEdicao === 'nova' ? null : emEdicao

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
    <div className="flex flex-col gap-4">
      {podeEscrever && (
        <div>
          <Button
            size="sm"
            onClick={() => {
              setEmEdicao('nova')
            }}
          >
            <Plus />
            Cadastrar rota
          </Button>
        </div>
      )}

      {isPending && <Carregando />}
      {error && <ErroDeCarregamento error={error} />}
      {rotas?.length === 0 && <p className="text-muted-foreground">Nenhuma rota cadastrada.</p>}
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
              {rotaEmEdicao ? `Rota ${rotaEmEdicao.numero}` : 'Cadastrar rota'}
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
              Excluir
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
        <Button type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : viagem ? 'Salvar' : 'Programar'}
        </Button>
      </FieldGroup>
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
  if (rotas.error) return <ErroDeCarregamento error={rotas.error} />
  if (trens.error) return <ErroDeCarregamento error={trens.error} />

  return (
    <FormularioDeViagem viagem={viagem} rotas={rotas.data} trens={trens.data} aoFechar={aoFechar} />
  )
}

interface ListaDeViagensProps {
  viagens: Viagem[]
  podeEscrever: boolean
  aoEditar: (viagem: Viagem) => void
  aoExcluir: (viagem: Viagem) => void
}

function ListaDeViagens({ viagens, podeEscrever, aoEditar, aoExcluir }: ListaDeViagensProps) {
  return (
    <>
      <ul className="grid gap-3 md:hidden">
        {viagens.map((viagem) => (
          <li key={viagem.id} className="flex flex-col gap-3 rounded-xl bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold">Rota {viagem.linha_numero}</span>
              <SeloDeStatus status={viagem.status} />
            </div>
            <p>
              {viagem.origem} → {viagem.destino}
            </p>
            <p className="text-sm text-muted-foreground">Trem {viagem.trem_prefixo}</p>
            <p className="text-sm">Partida: {dataHora(viagem.partida_prevista)}</p>
            <p className="text-sm">Chegada: {dataHora(viagem.chegada_prevista)}</p>
            <Acoes
              podeEscrever={podeEscrever}
              aoEditar={() => {
                aoEditar(viagem)
              }}
              aoExcluir={() => {
                aoExcluir(viagem)
              }}
            />
          </li>
        ))}
      </ul>
      <div className="hidden rounded-xl bg-card p-4 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rota</TableHead>
              <TableHead>Trajeto</TableHead>
              <TableHead>Trem</TableHead>
              <TableHead>Partida</TableHead>
              <TableHead>Chegada</TableHead>
              <TableHead>Status</TableHead>
              {podeEscrever && <TableHead>Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {viagens.map((viagem) => (
              <TableRow key={viagem.id}>
                <TableCell>{viagem.linha_numero}</TableCell>
                <TableCell>
                  {viagem.origem} → {viagem.destino}
                </TableCell>
                <TableCell>{viagem.trem_prefixo}</TableCell>
                <TableCell>{dataHora(viagem.partida_prevista)}</TableCell>
                <TableCell>{dataHora(viagem.chegada_prevista)}</TableCell>
                <TableCell>
                  <SeloDeStatus status={viagem.status} />
                </TableCell>
                {podeEscrever && (
                  <TableCell>
                    <Acoes
                      podeEscrever
                      aoEditar={() => {
                        aoEditar(viagem)
                      }}
                      aoExcluir={() => {
                        aoExcluir(viagem)
                      }}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
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

  const confirmarExclusao = (viagem: Viagem) => {
    excluir.mutate(viagem.id, {
      onSuccess: () => {
        toast.success('Viagem excluída')
      },
      onError: (erro) => toast.error(`Não foi possível excluir: ${mensagemDeErro(erro)}`),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={filtroDeStatus} onValueChange={setFiltroDeStatus}>
          <SelectTrigger className="w-full" aria-label="Filtrar por status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos os status</SelectItem>
            {STATUS_DE_VIAGEM.map((item) => (
              <SelectItem key={item} value={item}>
                <SeloDeStatus status={item} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroDeRota} onValueChange={setFiltroDeRota}>
          <SelectTrigger className="w-full" aria-label="Filtrar por rota">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todas as rotas</SelectItem>
            {rotas.data?.map((rota) => (
              <SelectItem key={rota.id} value={String(rota.id)}>
                {rota.numero} · {rota.origem} → {rota.destino}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroDeTrem} onValueChange={setFiltroDeTrem}>
          <SelectTrigger className="w-full" aria-label="Filtrar por trem">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos os trens</SelectItem>
            {trens.data?.map((trem) => (
              <SelectItem key={trem.id} value={String(trem.id)}>
                {trem.prefixo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          aria-label="Filtrar por dia"
          value={filtroDeData}
          onChange={(evento) => {
            setFiltroDeData(evento.target.value)
          }}
        />
      </div>

      {podeEscrever && (
        <div>
          <Button
            size="sm"
            onClick={() => {
              setEmEdicao('nova')
            }}
          >
            <Plus />
            Programar viagem
          </Button>
        </div>
      )}

      {isPending && <Carregando />}
      {error && <ErroDeCarregamento error={error} />}
      {viagens?.length === 0 && <p className="text-muted-foreground">Nenhuma viagem encontrada.</p>}
      {viagens && viagens.length > 0 && (
        <ListaDeViagens
          viagens={viagens}
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
              Excluir
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
      <CabecalhoDeTela title="Rotas" />
      <Tabs defaultValue="rotas">
        <TabsList>
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
