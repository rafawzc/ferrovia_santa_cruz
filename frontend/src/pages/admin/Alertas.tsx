import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { BellOff, Plus } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
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
  DialogTrigger,
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
import { SeloDeStatus, opcoesDeStatus } from '@/components/ui/selo-de-status'
import { Skeleton } from '@/components/ui/skeleton'
import { useAlertas, useCriarAlerta, useTratarAlerta } from '@/hooks/alertas'
import { useLinhas } from '@/hooks/linhas'
import {
  ApiError,
  tratouErrosDeCampo,
  type Alerta,
  type FiltroAlertas,
  type Severidade,
} from '@/lib/api'
import { cn, dataHora } from '@/lib/utils'

const esquema = z.object({
  linha_id: z.string().min(1, 'Escolha a rota'),
  tipo: z.string().trim().min(1, 'Informe o tipo').max(40, 'Máximo de 40 caracteres'),
  severidade: z.enum(['normal', 'atencao', 'critico']),
  tempo_espera: z.string().trim().max(40, 'Máximo de 40 caracteres'),
  motivo: z.string().trim().min(1, 'Informe o motivo').max(200, 'Máximo de 200 caracteres'),
  status: z.string().trim().min(1, 'Informe o status').max(40, 'Máximo de 40 caracteres'),
})

type ValoresDoFormulario = z.infer<typeof esquema>

const SEVERIDADES: Severidade[] = ['normal', 'atencao', 'critico']

const OPCOES_DE_SEVERIDADE = opcoesDeStatus(SEVERIDADES)

const VAZIO: ValoresDoFormulario = {
  linha_id: '',
  tipo: '',
  severidade: 'normal',
  tempo_espera: '',
  motivo: '',
  status: '',
}

const CAMPOS_DE_TEXTO = [
  { nome: 'tipo', rotulo: 'Tipo', placeholder: 'Ex: via, clima, operacional' },
  { nome: 'motivo', rotulo: 'Motivo', placeholder: 'Ex: manutenção no trilho' },
  { nome: 'status', rotulo: 'Status', placeholder: 'Ex: Parado' },
  { nome: 'tempo_espera', rotulo: 'Tempo de espera (opcional)', placeholder: 'Ex: 15 a 30 min' },
] as const

function FormularioDeAlerta({ aoEnviar }: { aoEnviar: () => void }) {
  const linhas = useLinhas()
  const criar = useCriarAlerta()
  const formulario = useForm<ValoresDoFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: VAZIO,
  })

  const enviar = formulario.handleSubmit((v) => {
    criar.mutate(
      {
        linha_id: Number(v.linha_id),
        tipo: v.tipo,
        severidade: v.severidade,
        motivo: v.motivo,
        status: v.status,
        ...(v.tempo_espera && { tempo_espera: v.tempo_espera }),
      },
      {
        onSuccess: () => {
          toast.success('Alerta enviado')
          aoEnviar()
        },
        onError: (error) => {
          const rotaNaoExisteMais = error instanceof ApiError && error.status === 409
          if (rotaNaoExisteMais) {
            formulario.setError('linha_id', {
              message: 'Essa rota não existe mais. Recarregue a página e escolha outra.',
            })
            return
          }
          if (tratouErrosDeCampo(error, formulario)) return
          toast.error(`Não foi possível enviar: ${mensagemDeErro(error)}`)
        },
      },
    )
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        void enviar(e)
      }}
    >
      <FieldGroup>
        <Controller
          name="linha_id"
          control={formulario.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="alerta-rota">Rota</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                disabled={linhas.isPending || !!linhas.error}
              >
                <SelectTrigger
                  id="alerta-rota"
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue
                    placeholder={linhas.isPending ? 'Carregando rotas…' : 'Selecione a rota'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {linhas.data?.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      Rota {l.numero}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {linhas.error && (
                <FieldDescription role="alert">
                  Não foi possível carregar as rotas: {mensagemDeErro(linhas.error)}. Feche e abra
                  de novo para tentar outra vez.
                </FieldDescription>
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="severidade"
          control={formulario.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="alerta-severidade">Severidade</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="alerta-severidade" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPCOES_DE_SEVERIDADE.map((o) => (
                    <SelectItem key={o.valor} value={o.valor}>
                      {o.rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        {CAMPOS_DE_TEXTO.map(({ nome, rotulo, placeholder }) => {
          const erro = formulario.formState.errors[nome]
          return (
            <Field key={nome} data-invalid={!!erro}>
              <FieldLabel htmlFor={`alerta-${nome}`}>{rotulo}</FieldLabel>
              <Input
                id={`alerta-${nome}`}
                placeholder={placeholder}
                aria-invalid={!!erro}
                {...formulario.register(nome)}
              />
              {erro && <FieldError errors={[erro]} />}
            </Field>
          )
        })}
      </FieldGroup>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={criar.isPending}>
          {criar.isPending ? 'Enviando…' : 'Enviar alerta'}
        </Button>
      </DialogFooter>
    </form>
  )
}

function NovoAlerta() {
  const [aberto, setAberto] = useState(false)
  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden />
          Novo alerta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-dvh overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo alerta</DialogTitle>
          <DialogDescription>Registra uma ocorrência na central de alertas.</DialogDescription>
        </DialogHeader>
        <FormularioDeAlerta
          aoEnviar={() => {
            setAberto(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

type Situacao = 'abertos' | 'tratados' | 'todos'

const TRATADO_DA_SITUACAO: Record<Situacao, boolean | undefined> = {
  abertos: false,
  tratados: true,
  todos: undefined,
}

interface FiltrosProps {
  severidade: Severidade | 'todas'
  tipo: string
  situacao: Situacao
  aoMudarSeveridade: (valor: Severidade | 'todas') => void
  aoMudarTipo: (valor: string) => void
  aoMudarSituacao: (valor: Situacao) => void
}

function Filtros({
  severidade,
  tipo,
  situacao,
  aoMudarSeveridade,
  aoMudarTipo,
  aoMudarSituacao,
}: FiltrosProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Field>
        <FieldLabel htmlFor="filtro-severidade">Severidade</FieldLabel>
        <Select
          value={severidade}
          onValueChange={(v) => {
            aoMudarSeveridade(SEVERIDADES.find((s) => s === v) ?? 'todas')
          }}
        >
          <SelectTrigger id="filtro-severidade" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {OPCOES_DE_SEVERIDADE.map((o) => (
              <SelectItem key={o.valor} value={o.valor}>
                {o.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="filtro-tipo">Tipo</FieldLabel>
        <Input
          id="filtro-tipo"
          value={tipo}
          placeholder="Ex: via"
          onChange={(e) => {
            aoMudarTipo(e.target.value)
          }}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="filtro-situacao">Situação</FieldLabel>
        <Select
          value={situacao}
          onValueChange={(v) => {
            if (v === 'abertos' || v === 'tratados' || v === 'todos') aoMudarSituacao(v)
          }}
        >
          <SelectTrigger id="filtro-situacao" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="abertos">Não tratados</SelectItem>
            <SelectItem value="tratados">Tratados</SelectItem>
            <SelectItem value="todos">Todos</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}

function CartaoDeAlerta({ alerta: a }: { alerta: Alerta }) {
  const tratar = useTratarAlerta()

  function alternar() {
    tratar.mutate(
      { id: a.id, tratado: !a.tratado },
      {
        onError: (error) => {
          toast.error(`Não foi possível atualizar: ${mensagemDeErro(error)}`)
        },
      },
    )
  }

  const critico = a.severidade === 'critico' && !a.tratado
  const origem = a.linha_numero === null ? `${a.tipo} (sensor)` : `Rota ${a.linha_numero}`

  return (
    <Card className={cn('gap-4 p-5', critico && 'border-danger')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <SeloDeStatus status={a.severidade} />
            {a.tratado && <Badge variant="secondary">Tratado</Badge>}
          </div>
          <h2 className="text-lg leading-snug font-bold">{origem}</h2>
        </div>
        <time dateTime={a.criado_em} className="text-rotulo text-muted-foreground tabular-nums">
          {dataHora(a.criado_em)}
        </time>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <RotuloDeDado como="dt">Motivo</RotuloDeDado>
          <dd className="text-sm">{a.motivo}</dd>
        </div>
        <div>
          <RotuloDeDado como="dt">Tipo</RotuloDeDado>
          <dd className="text-sm">{a.tipo}</dd>
        </div>
        <div>
          <RotuloDeDado como="dt">Status</RotuloDeDado>
          <dd className="text-sm">{a.status}</dd>
        </div>
        {a.tempo_espera && (
          <div>
            <RotuloDeDado como="dt">Tempo de espera</RotuloDeDado>
            <dd className="text-sm">{a.tempo_espera}</dd>
          </div>
        )}
      </dl>
      <Button
        variant={a.tratado ? 'outline' : 'default'}
        className="sm:self-end"
        disabled={tratar.isPending}
        onClick={alternar}
      >
        {a.tratado ? 'Reabrir alerta' : 'Marcar como tratado'}
      </Button>
    </Card>
  )
}

function ListaDeAlertas({
  filtro,
  aoLimparFiltros,
}: {
  filtro: FiltroAlertas
  aoLimparFiltros: () => void
}) {
  const { data: alertas, isPending, error, refetch } = useAlertas(filtro)

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    )
  }

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

  if (alertas.length === 0) {
    return (
      <EstadoVazio
        icone={BellOff}
        titulo="Nenhum alerta encontrado"
        descricao="Nenhuma ocorrência corresponde aos filtros atuais."
        acao={
          <Button variant="outline" onClick={aoLimparFiltros}>
            Limpar filtros
          </Button>
        }
      />
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {alertas.map((a) => (
        <li key={a.id}>
          <CartaoDeAlerta alerta={a} />
        </li>
      ))}
    </ul>
  )
}

export default function Alertas() {
  const [severidade, setSeveridade] = useState<Severidade | 'todas'>('todas')
  const [tipo, setTipo] = useState('')
  const [situacao, setSituacao] = useState<Situacao>('abertos')
  const tipoLimpo = tipo.trim()

  return (
    <>
      <CabecalhoDeTela
        title="Alertas e Notificações"
        apoio="Ocorrências da operação, da mais recente para a mais antiga."
        actions={<NovoAlerta />}
      />
      <section aria-label="Central de alertas" className="flex flex-col gap-5">
        <Filtros
          severidade={severidade}
          tipo={tipo}
          situacao={situacao}
          aoMudarSeveridade={setSeveridade}
          aoMudarTipo={setTipo}
          aoMudarSituacao={setSituacao}
        />
        <ListaDeAlertas
          filtro={{
            ...(severidade !== 'todas' && { severidade }),
            ...(tipoLimpo && { tipo: tipoLimpo }),
            tratado: TRATADO_DA_SITUACAO[situacao],
          }}
          aoLimparFiltros={() => {
            setSeveridade('todas')
            setTipo('')
            setSituacao('todos')
          }}
        />
      </section>
    </>
  )
}
