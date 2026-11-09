import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Radio } from 'lucide-react'
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
  const rotuloDeEnvio = sensor ? 'Salvar alterações' : 'Cadastrar sensor'

  return (
    <form
      noValidate
      className="grid gap-6"
      onSubmit={(evento) => {
        void enviar(evento)
      }}
    >
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
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
        <CampoTexto formulario={formulario} name="localizacao" rotulo="Localização" />
        <CampoTexto formulario={formulario} name="segmento" rotulo="Segmento (opcional)" />
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

interface FormularioComTrensProps {
  sensor: Sensor | null
  aoFechar: () => void
}

function FormularioComTrens({ sensor, aoFechar }: FormularioComTrensProps) {
  const trens = useTrens()

  if (trens.isPending) return <Skeleton className="h-80" />
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

  return <FormularioDeSensor sensor={sensor} trens={trens.data} aoFechar={aoFechar} />
}

const rotuloDoTipo = (tipo: Sensor['tipo_dado']) =>
  TIPOS_DE_SENSOR.find((opcao) => opcao.valor === tipo)?.rotulo ?? tipo

const valorDaLeitura = (sensor: Sensor) => {
  if (sensor.ultima_leitura_valor === null) return '—'
  const unidade = UNIDADE_DO_TIPO[sensor.tipo_dado]
  const valor = formatarNumero(sensor.ultima_leitura_valor)
  return unidade ? `${valor} ${unidade}` : valor
}

const momentoDaLeitura = (sensor: Sensor) =>
  sensor.ultima_leitura_data ? dataHora(sensor.ultima_leitura_data) : '—'

function EstadoDaLeitura({ sensor }: { sensor: Sensor }) {
  if (!sensor.ultima_leitura_status) {
    return <span className="text-rotulo text-muted-foreground">Sem leitura</span>
  }
  return <SeloDeStatus status={sensor.ultima_leitura_status} />
}

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
        <li key={sensor.id}>
          <Card className="gap-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xl leading-tight font-semibold">{sensor.codigo}</p>
                <p className="text-rotulo text-muted-foreground">{sensor.nome}</p>
              </div>
              <EstadoDaLeitura sensor={sensor} />
            </div>
            <dl className="grid gap-2 text-corpo">
              <Dado rotulo="Última leitura" valor={valorDaLeitura(sensor)} />
              <Dado rotulo="Medida em" valor={momentoDaLeitura(sensor)} />
              <Dado rotulo="Trem" valor={sensor.trem_prefixo} />
              <Dado rotulo="Tipo" valor={rotuloDoTipo(sensor.tipo_dado)} />
              <Dado rotulo="Localização" valor={sensor.localizacao} />
              <Dado rotulo="Segmento" valor={sensor.segmento ?? '—'} />
            </dl>
            {podeEscrever && (
              <AcoesDeLinha
                nome={`sensor ${sensor.codigo}`}
                aoEditar={() => {
                  aoEditar(sensor)
                }}
                aoExcluir={() => {
                  aoExcluir(sensor)
                }}
              />
            )}
          </Card>
        </li>
      ))}
    </ul>
  )
}

function TabelaDeSensores({ sensores, podeEscrever, aoEditar, aoExcluir }: ListaProps) {
  return (
    <Card className="hidden gap-0 px-2 py-2 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sensor</TableHead>
            <TableHead>Trem</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Local</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Última leitura</TableHead>
            {podeEscrever && <TableHead className="text-right">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sensores.map((sensor) => (
            <TableRow key={sensor.id}>
              <TableCell>
                <span className="font-bold">{sensor.codigo}</span>
                <span className="block text-rotulo text-muted-foreground">{sensor.nome}</span>
              </TableCell>
              <TableCell>{sensor.trem_prefixo}</TableCell>
              <TableCell>{rotuloDoTipo(sensor.tipo_dado)}</TableCell>
              <TableCell>
                <span className="block">{sensor.localizacao}</span>
                <span className="block text-rotulo text-muted-foreground">
                  {sensor.segmento ?? '—'}
                </span>
              </TableCell>
              <TableCell>
                <EstadoDaLeitura sensor={sensor} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <span className="block">{valorDaLeitura(sensor)}</span>
                <span className="block text-rotulo text-muted-foreground">
                  {momentoDaLeitura(sensor)}
                </span>
              </TableCell>
              {podeEscrever && (
                <TableCell>
                  <AcoesDeLinha
                    nome={`sensor ${sensor.codigo}`}
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
    </Card>
  )
}

function EsqueletoDeSensores() {
  return (
    <div role="status" aria-label="Carregando" className="grid gap-3">
      {Array.from({ length: 5 }, (_, indice) => (
        <Skeleton key={indice} className="h-56 md:h-16" />
      ))}
    </div>
  )
}

interface VazioProps {
  temFiltro: boolean
  podeEscrever: boolean
  aoLimparFiltro: () => void
  aoCadastrar: () => void
}

function SemSensores({ temFiltro, podeEscrever, aoLimparFiltro, aoCadastrar }: VazioProps) {
  return (
    <EstadoVazio
      icone={Radio}
      titulo={temFiltro ? 'Nenhum sensor desse tipo' : 'Nenhum sensor cadastrado'}
      descricao={
        temFiltro
          ? 'Escolha outro tipo para ver os sensores instalados nos trens.'
          : 'Os sensores instalados nos trens aparecem aqui depois do cadastro.'
      }
      acao={
        temFiltro ? (
          <Button variant="outline" onClick={aoLimparFiltro}>
            Ver todos os tipos
          </Button>
        ) : (
          podeEscrever && (
            <Button onClick={aoCadastrar}>
              <Plus aria-hidden />
              Cadastrar primeiro sensor
            </Button>
          )
        )
      }
    />
  )
}

interface ConteudoProps {
  tipo: string
  podeEscrever: boolean
  aoEditar: (sensor: Sensor) => void
  aoExcluir: (sensor: Sensor) => void
  aoLimparFiltro: () => void
  aoCadastrar: () => void
}

function ConteudoDeSensores({
  tipo,
  podeEscrever,
  aoEditar,
  aoExcluir,
  aoLimparFiltro,
  aoCadastrar,
}: ConteudoProps) {
  const filtroDeTipo = TIPOS_DE_SENSOR.find((opcao) => opcao.valor === tipo)?.valor
  const { data: sensores, isPending, error, refetch } = useSensores({ tipo: filtroDeTipo })

  if (isPending) return <EsqueletoDeSensores />
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
  if (sensores.length === 0) {
    return (
      <SemSensores
        temFiltro={tipo !== 'todos'}
        podeEscrever={podeEscrever}
        aoLimparFiltro={aoLimparFiltro}
        aoCadastrar={aoCadastrar}
      />
    )
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

  const abrirCadastro = () => {
    setEmEdicao('novo')
  }

  const limparFiltro = () => {
    setTipo('todos')
  }

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
        apoio={podeEscrever ? undefined : 'Cadastro e edição de sensores são da gestão.'}
        actions={
          podeEscrever && (
            <Button onClick={abrirCadastro}>
              <Plus aria-hidden />
              Cadastrar sensor
            </Button>
          )
        }
      />

      <Select value={tipo} onValueChange={setTipo}>
        <SelectTrigger aria-label="Filtrar por tipo" className="w-full md:w-64">
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

      <ConteudoDeSensores
        tipo={tipo}
        podeEscrever={podeEscrever}
        aoEditar={setEmEdicao}
        aoExcluir={setParaExcluir}
        aoLimparFiltro={limparFiltro}
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
              {sensorEmEdicao ? `Editar o sensor ${sensorEmEdicao.codigo}` : 'Cadastrar sensor'}
            </DialogTitle>
            <DialogDescription>
              {sensorEmEdicao
                ? 'Altere os dados do sensor e salve.'
                : 'Informe os dados do novo sensor e o trem onde ele está instalado.'}
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
            <AlertDialogDescription>
              A exclusão é recusada se o sensor já registrou leituras. A ação não se desfaz.
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
              Excluir sensor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
