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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAutenticacao } from '@/contexts/Autenticacao'
import { useAtualizarSensor, useCriarSensor, useExcluirSensor, useSensores } from '@/hooks/sensores'
import { useTrens } from '@/hooks/trens'
import { ApiError, tratouErrosDeCampo, type Sensor, type Trem } from '@/lib/api'
import { dataHora, formatarNumero } from '@/lib/utils'

const TIPOS_DE_SENSOR = [
  { valor: 'velocidade', rotulo: 'Velocidade' },
  { valor: 'temperatura', rotulo: 'Temperatura' },
  { valor: 'falha', rotulo: 'Falha' },
  { valor: 'energia', rotulo: 'Energia' },
  { valor: 'localizacao', rotulo: 'Localização' },
] as const

const UNIDADE_DO_TIPO: Partial<Record<Sensor['tipo_dado'], string>> = {
  velocidade: 'km/h',
}

const esquema = z.object({
  codigo: z.string().trim().min(1, 'Informe o código').max(20, 'Até 20 caracteres'),
  nome: z.string().trim().min(1, 'Informe o nome').max(80, 'Até 80 caracteres'),
  tipo_dado: z.enum(['velocidade', 'temperatura', 'falha', 'energia', 'localizacao']),
  localizacao: z.string().trim().min(1, 'Informe a localização').max(120, 'Até 120 caracteres'),
  segmento: z.string().trim().max(80, 'Até 80 caracteres'),
  trem_id: z.string().min(1, 'Selecione o trem'),
})

type ValoresDoFormulario = z.infer<typeof esquema>

interface CampoTextoProps {
  formulario: UseFormReturn<ValoresDoFormulario>
  name: 'codigo' | 'nome' | 'localizacao' | 'segmento'
  rotulo: string
}

function CampoTexto({ formulario, name, rotulo }: CampoTextoProps) {
  const id = `sensor-${name}`
  const erro = formulario.formState.errors[name]
  return (
    <Field data-invalid={!!erro}>
      <FieldLabel htmlFor={id}>{rotulo}</FieldLabel>
      <Input id={id} aria-invalid={!!erro} {...formulario.register(name)} />
      {erro && <FieldError errors={[erro]} />}
    </Field>
  )
}

interface FormularioDeSensorProps {
  sensor: Sensor | null
  trens: Trem[]
  aoFechar: () => void
}

function FormularioDeSensor({ sensor, trens, aoFechar }: FormularioDeSensorProps) {
  const criar = useCriarSensor()
  const atualizar = useAtualizarSensor(sensor?.id ?? 0)
  const formulario = useForm<ValoresDoFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      codigo: sensor?.codigo ?? '',
      nome: sensor?.nome ?? '',
      tipo_dado: sensor?.tipo_dado ?? 'velocidade',
      localizacao: sensor?.localizacao ?? '',
      segmento: sensor?.segmento ?? '',
      trem_id: sensor ? String(sensor.trem_id) : '',
    },
  })

  const aoErrar = (erro: Error) => {
    if (erro instanceof ApiError && erro.status === 409) {
      formulario.setError('codigo', { message: 'Já existe um sensor com esse código.' })
      return
    }
    if (tratouErrosDeCampo(erro, formulario)) return
    toast.error(`Não foi possível salvar: ${mensagemDeErro(erro)}`)
  }

  const enviar = formulario.handleSubmit((valores) => {
    if (sensor?.segmento && !valores.segmento) {
      formulario.setError('segmento', {
        message: 'Não é possível remover o segmento; informe outro valor.',
      })
      return
    }
    const dados = {
      codigo: valores.codigo,
      nome: valores.nome,
      tipo_dado: valores.tipo_dado,
      localizacao: valores.localizacao,
      segmento: valores.segmento || undefined,
      trem_id: Number(valores.trem_id),
    }
    const opcoes = {
      onSuccess: () => {
        toast.success(sensor ? 'Sensor atualizado' : 'Sensor cadastrado')
        aoFechar()
      },
      onError: aoErrar,
    }
    if (sensor) {
      atualizar.mutate(dados, opcoes)
      return
    }
    criar.mutate(dados, opcoes)
  })

  const salvando = criar.isPending || atualizar.isPending
  const rotuloDeEnvio = sensor ? 'Salvar' : 'Cadastrar'

  return (
    <form
      noValidate
      onSubmit={(evento) => {
        void enviar(evento)
      }}
    >
      <FieldGroup>
        <CampoTexto formulario={formulario} name="codigo" rotulo="Código" />
        <CampoTexto formulario={formulario} name="nome" rotulo="Nome" />
        <Controller
          name="tipo_dado"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sensor-tipo">Tipo</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="sensor-tipo"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_DE_SENSOR.map((opcao) => (
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
        <CampoTexto formulario={formulario} name="localizacao" rotulo="Localização" />
        <CampoTexto formulario={formulario} name="segmento" rotulo="Segmento (opcional)" />
        <Controller
          name="trem_id"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sensor-trem">Trem</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="sensor-trem"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Selecione o trem" />
                </SelectTrigger>
                <SelectContent>
                  {trens.map((trem) => (
                    <SelectItem key={trem.id} value={String(trem.id)}>
                      {trem.prefixo} · {trem.modelo}
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

interface FormularioComTrensProps {
  sensor: Sensor | null
  aoFechar: () => void
}

function FormularioComTrens({ sensor, aoFechar }: FormularioComTrensProps) {
  const trens = useTrens()

  if (trens.isPending) return <Skeleton className="h-80" />
  if (trens.error) return <ErroDeCarregamento error={trens.error} />

  return <FormularioDeSensor sensor={sensor} trens={trens.data} aoFechar={aoFechar} />
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

const valorComUnidade = (sensor: Sensor) => {
  if (sensor.ultima_leitura_valor === null) return '—'
  const unidade = UNIDADE_DO_TIPO[sensor.tipo_dado]
  const valor = formatarNumero(sensor.ultima_leitura_valor)
  return unidade ? `${valor} ${unidade}` : valor
}

function UltimaLeitura({ sensor }: { sensor: Sensor }) {
  if (!sensor.ultima_leitura_status || !sensor.ultima_leitura_data) return <span>—</span>
  return (
    <span className="flex flex-wrap items-center gap-2">
      <SeloDeStatus status={sensor.ultima_leitura_status} />
      {valorComUnidade(sensor)} · {dataHora(sensor.ultima_leitura_data)}
    </span>
  )
}

const rotuloDoTipo = (tipo: Sensor['tipo_dado']) =>
  TIPOS_DE_SENSOR.find((opcao) => opcao.valor === tipo)?.rotulo

interface ListaProps {
  sensores: Sensor[]
  podeEscrever: boolean
  aoEditar: (sensor: Sensor) => void
  aoExcluir: (sensor: Sensor) => void
}

function ListaDeCartoes({ sensores, podeEscrever, aoEditar, aoExcluir }: ListaProps) {
  return (
    <ul className="grid gap-3 md:hidden">
      {sensores.map((sensor) => (
        <li key={sensor.id} className="grid gap-3 rounded-xl bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold">{sensor.codigo}</span>
            <span className="text-sm text-muted-foreground">{sensor.nome}</span>
          </div>
          <dl className="grid grid-cols-2 gap-1 text-sm">
            <dt className="text-muted-foreground">Trem</dt>
            <dd>{sensor.trem_prefixo}</dd>
            <dt className="text-muted-foreground">Tipo</dt>
            <dd>{rotuloDoTipo(sensor.tipo_dado)}</dd>
            <dt className="text-muted-foreground">Localização</dt>
            <dd>{sensor.localizacao}</dd>
            <dt className="text-muted-foreground">Segmento</dt>
            <dd>{sensor.segmento ?? '—'}</dd>
            <dt className="text-muted-foreground">Última leitura</dt>
            <dd>
              <UltimaLeitura sensor={sensor} />
            </dd>
          </dl>
          <Acoes
            podeEscrever={podeEscrever}
            aoEditar={() => {
              aoEditar(sensor)
            }}
            aoExcluir={() => {
              aoExcluir(sensor)
            }}
          />
        </li>
      ))}
    </ul>
  )
}

function TabelaDeSensores({ sensores, podeEscrever, aoEditar, aoExcluir }: ListaProps) {
  return (
    <div className="hidden rounded-xl bg-card p-4 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Trem</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Segmento</TableHead>
            <TableHead>Última leitura</TableHead>
            {podeEscrever && <TableHead>Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sensores.map((sensor) => (
            <TableRow key={sensor.id}>
              <TableCell className="font-bold">{sensor.codigo}</TableCell>
              <TableCell>{sensor.nome}</TableCell>
              <TableCell>{sensor.trem_prefixo}</TableCell>
              <TableCell>{rotuloDoTipo(sensor.tipo_dado)}</TableCell>
              <TableCell>{sensor.localizacao}</TableCell>
              <TableCell>{sensor.segmento ?? '—'}</TableCell>
              <TableCell>
                <UltimaLeitura sensor={sensor} />
              </TableCell>
              {podeEscrever && (
                <TableCell>
                  <Acoes
                    podeEscrever
                    aoEditar={() => {
                      aoEditar(sensor)
                    }}
                    aoExcluir={() => {
                      aoExcluir(sensor)
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
  tipo: string
  podeEscrever: boolean
  aoEditar: (sensor: Sensor) => void
  aoExcluir: (sensor: Sensor) => void
}

function ConteudoDeSensores({ tipo, podeEscrever, aoEditar, aoExcluir }: ConteudoProps) {
  const filtroDeTipo = TIPOS_DE_SENSOR.find((opcao) => opcao.valor === tipo)?.valor
  const { data: sensores, isPending, error } = useSensores({ tipo: filtroDeTipo })

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
  if (sensores.length === 0) {
    return <p className="text-muted-foreground">Nenhum sensor encontrado.</p>
  }

  return (
    <>
      <ListaDeCartoes
        sensores={sensores}
        podeEscrever={podeEscrever}
        aoEditar={aoEditar}
        aoExcluir={aoExcluir}
      />
      <TabelaDeSensores
        sensores={sensores}
        podeEscrever={podeEscrever}
        aoEditar={aoEditar}
        aoExcluir={aoExcluir}
      />
    </>
  )
}

export default function Sensores() {
  const { usuario } = useAutenticacao()
  const podeEscrever = usuario?.papel === 'gestao'
  const excluir = useExcluirSensor()
  const [tipo, setTipo] = useState('todos')
  const [emEdicao, setEmEdicao] = useState<Sensor | 'novo' | null>(null)
  const [paraExcluir, setParaExcluir] = useState<Sensor | null>(null)
  const sensorEmEdicao = emEdicao === 'novo' ? null : emEdicao

  const confirmarExclusao = (sensor: Sensor) => {
    excluir.mutate(sensor.id, {
      onSuccess: () => {
        toast.success('Sensor excluído')
      },
      onError: (erro) => {
        if (erro instanceof ApiError && erro.status === 409) {
          toast.error('Este sensor já tem leituras registradas e não pode ser excluído.')
          return
        }
        toast.error(`Não foi possível excluir: ${mensagemDeErro(erro)}`)
      },
    })
  }

  return (
    <>
      <CabecalhoDeTela
        title="Sensores"
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

      <div className="mb-4">
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger aria-label="Filtrar por tipo" className="w-full md:w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {TIPOS_DE_SENSOR.map((opcao) => (
              <SelectItem key={opcao.valor} value={opcao.valor}>
                {opcao.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ConteudoDeSensores
        tipo={tipo}
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
              {sensorEmEdicao ? `Editar ${sensorEmEdicao.codigo}` : 'Cadastrar sensor'}
            </DialogTitle>
            <DialogDescription>
              {sensorEmEdicao ? 'Altere os dados do sensor.' : 'Informe os dados do novo sensor.'}
            </DialogDescription>
          </DialogHeader>
          <FormularioComTrens
            key={sensorEmEdicao?.id ?? 'novo'}
            sensor={sensorEmEdicao}
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
            <AlertDialogTitle>Excluir o sensor {paraExcluir?.codigo}?</AlertDialogTitle>
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
