import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Boxes, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RotuloDeDado } from '@/components/ui/rotulo-de-dado'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCargas, useCriarCarga } from '@/hooks/cargas'
import { ApiError, tratouErrosDeCampo, type Carga } from '@/lib/api'
import { dataHora, formatarNumero } from '@/lib/utils'

const numero = (s: string) => Number(s.replace(',', '.'))

const esquema = z.object({
  tipo: z.string().trim().min(1, 'Informe o tipo').max(80, 'Até 80 caracteres'),
  peso_t: z
    .string()
    .trim()
    .refine((s) => numero(s) > 0 && numero(s) < 10000, 'Peso entre 0 e 10.000 t'),
  local_partida: z.string().trim().min(1, 'Informe a partida').max(120, 'Até 120 caracteres'),
  destino: z.string().trim().min(1, 'Informe o destino').max(120, 'Até 120 caracteres'),
  vagao: z.string().trim().max(20, 'Até 20 caracteres'),
  trem_id: z.string().trim().regex(/^\d*$/, 'Só números'),
})

type ValoresDoFormulario = z.infer<typeof esquema>

const CAMPOS: { nome: keyof ValoresDoFormulario; rotulo: string; modo?: 'decimal' | 'numeric' }[] =
  [
    { nome: 'tipo', rotulo: 'Tipo de carga' },
    { nome: 'peso_t', rotulo: 'Peso (t)', modo: 'decimal' },
    { nome: 'local_partida', rotulo: 'Local de partida' },
    { nome: 'destino', rotulo: 'Destino' },
    { nome: 'vagao', rotulo: 'Vagão (opcional)' },
    { nome: 'trem_id', rotulo: 'Nº do trem (opcional)', modo: 'numeric' },
  ]

const peso = (carga: Carga) => `${formatarNumero(carga.peso_t)} t`

function FormularioDeCarga({ aoSalvar }: { aoSalvar: () => void }) {
  const criar = useCriarCarga()
  const formulario = useForm<ValoresDoFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      tipo: '',
      peso_t: '',
      local_partida: '',
      destino: '',
      vagao: '',
      trem_id: '',
    },
  })

  const enviar = formulario.handleSubmit((v) => {
    criar.mutate(
      {
        tipo: v.tipo,
        peso_t: numero(v.peso_t),
        local_partida: v.local_partida,
        destino: v.destino,
        vagao: v.vagao || undefined,
        trem_id: v.trem_id ? Number(v.trem_id) : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Carga cadastrada')
          aoSalvar()
        },
        onError: (e) => {
          const tremNaoEncontrado = e instanceof ApiError && e.status === 409
          if (tremNaoEncontrado) {
            formulario.setError('trem_id', { message: 'Trem não encontrado' })
            return
          }
          if (tratouErrosDeCampo(e, formulario)) return
          toast.error(mensagemDeErro(e))
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
        {CAMPOS.map(({ nome, rotulo, modo }) => {
          const erro = formulario.formState.errors[nome]
          return (
            <Field key={nome} data-invalid={!!erro}>
              <FieldLabel htmlFor={`carga-${nome}`}>{rotulo}</FieldLabel>
              <Input
                id={`carga-${nome}`}
                inputMode={modo}
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
          {criar.isPending ? 'Cadastrando…' : 'Cadastrar carga'}
        </Button>
      </DialogFooter>
    </form>
  )
}

function CadastroDeCarga({
  aberto,
  aoMudarAbertura,
}: {
  aberto: boolean
  aoMudarAbertura: (valor: boolean) => void
}) {
  return (
    <Dialog open={aberto} onOpenChange={aoMudarAbertura}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden />
          Cadastrar carga
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-dvh overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastro de carga</DialogTitle>
          <DialogDescription>Registra a carga no histórico.</DialogDescription>
        </DialogHeader>
        <FormularioDeCarga
          aoSalvar={() => {
            aoMudarAbertura(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function Cartoes({ cargas }: { cargas: Carga[] }) {
  return (
    <ul className="flex flex-col gap-3 lg:hidden">
      {cargas.map((c) => (
        <li
          key={c.id}
          className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 text-lg leading-snug font-bold">{c.tipo}</h2>
            <p className="shrink-0 text-lg leading-snug font-bold tabular-nums">{peso(c)}</p>
          </div>
          <dl className="grid grid-cols-2 gap-3">
            <div>
              <RotuloDeDado como="dt">Partida</RotuloDeDado>
              <dd className="text-sm">{c.local_partida}</dd>
            </div>
            <div>
              <RotuloDeDado como="dt">Destino</RotuloDeDado>
              <dd className="text-sm">{c.destino}</dd>
            </div>
            <div>
              <RotuloDeDado como="dt">Vagão</RotuloDeDado>
              <dd className="text-sm">{c.vagao ?? '—'}</dd>
            </div>
            <div>
              <RotuloDeDado como="dt">Trem</RotuloDeDado>
              <dd className="text-sm tabular-nums">{c.trem_id ?? '—'}</dd>
            </div>
          </dl>
          <p className="text-rotulo text-muted-foreground">
            Cadastro em{' '}
            <time dateTime={c.criado_em} className="tabular-nums">
              {dataHora(c.criado_em)}
            </time>
          </p>
        </li>
      ))}
    </ul>
  )
}

function Tabela({ cargas }: { cargas: Carga[] }) {
  return (
    <Card className="hidden gap-0 px-2 py-2 lg:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Carga</TableHead>
            <TableHead className="text-right">Peso</TableHead>
            <TableHead>Partida</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Vagão</TableHead>
            <TableHead>Trem</TableHead>
            <TableHead>Cadastro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cargas.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-semibold whitespace-normal">{c.tipo}</TableCell>
              <TableCell className="text-right tabular-nums">{peso(c)}</TableCell>
              <TableCell className="whitespace-normal">{c.local_partida}</TableCell>
              <TableCell className="whitespace-normal">{c.destino}</TableCell>
              <TableCell>{c.vagao ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{c.trem_id ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{dataHora(c.criado_em)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

function Conteudo({ aoCadastrar }: { aoCadastrar: () => void }) {
  const { data: cargas, isPending, error, refetch } = useCargas()

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-lg lg:h-12" />
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

  if (cargas.length === 0) {
    return (
      <EstadoVazio
        icone={Boxes}
        titulo="Nenhuma carga cadastrada"
        descricao="O histórico de carga começa no primeiro registro."
        acao={
          <Button variant="outline" onClick={aoCadastrar}>
            Cadastrar carga
          </Button>
        }
      />
    )
  }

  return (
    <>
      <Cartoes cargas={cargas} />
      <Tabela cargas={cargas} />
    </>
  )
}

export default function CargaLista() {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <CabecalhoDeTela
        title="Monitoramento de Carga"
        apoio="Cargas registradas, da mais recente para a mais antiga."
        actions={<CadastroDeCarga aberto={aberto} aoMudarAbertura={setAberto} />}
      />
      <Conteudo
        aoCadastrar={() => {
          setAberto(true)
        }}
      />
    </>
  )
}
