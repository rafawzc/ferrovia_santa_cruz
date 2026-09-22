import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadError, mensagemDeErro } from '@/components/ui/load-error'
import { useCargas, useCriarCarga } from '@/hooks/cargas'
import { ApiError, marcarErrosDeCampo } from '@/lib/api'
import { dataHora } from '@/lib/utils'

const numero = (s: string) => Number(s.replace(',', '.'))

const schema = z.object({
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

type Valores = z.infer<typeof schema>

const CAMPOS: { nome: keyof Valores; rotulo: string; modo?: 'decimal' | 'numeric' }[] = [
  { nome: 'tipo', rotulo: 'Tipo de carga' },
  { nome: 'peso_t', rotulo: 'Peso (t)', modo: 'decimal' },
  { nome: 'local_partida', rotulo: 'Local de partida' },
  { nome: 'destino', rotulo: 'Destino' },
  { nome: 'vagao', rotulo: 'Vagão (opcional)' },
  { nome: 'trem_id', rotulo: 'Nº do trem (opcional)', modo: 'numeric' },
]

function FormCarga({ onSalvo }: { onSalvo: () => void }) {
  const criar = useCriarCarga()
  const form = useForm<Valores>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: '',
      peso_t: '',
      local_partida: '',
      destino: '',
      vagao: '',
      trem_id: '',
    },
  })

  const enviar = form.handleSubmit((v) => {
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
          onSalvo()
        },
        onError: (e) => {
          if (e instanceof ApiError && e.status === 409) {
            form.setError('trem_id', { message: 'Trem não encontrado' })
          } else if (!marcarErrosDeCampo(e, form)) {
            toast.error(mensagemDeErro(e))
          }
        },
      },
    )
  })

  return (
    <form
      noValidate
      onSubmit={(e) => {
        void enviar(e)
      }}
    >
      <FieldGroup>
        {CAMPOS.map(({ nome, rotulo, modo }) => {
          const erro = form.formState.errors[nome]
          return (
            <Field key={nome} data-invalid={!!erro}>
              <FieldLabel htmlFor={`carga-${nome}`}>{rotulo}</FieldLabel>
              <Input
                id={`carga-${nome}`}
                inputMode={modo}
                aria-invalid={!!erro}
                {...form.register(nome)}
              />
              {erro && <FieldError errors={[erro]} />}
            </Field>
          )
        })}
        <Button type="submit" disabled={criar.isPending}>
          {criar.isPending ? 'Cadastrando…' : 'Cadastrar'}
        </Button>
      </FieldGroup>
    </form>
  )
}

export default function CargaLista() {
  const { data: cargas, isPending, error } = useCargas()
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <ScreenHeader
        title="Monitoramento de Carga"
        actions={
          <Dialog open={aberto} onOpenChange={setAberto}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus />
                Cadastrar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-dvh overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastro de carga</DialogTitle>
                <DialogDescription>Registra a carga no histórico.</DialogDescription>
              </DialogHeader>
              <FormCarga
                onSalvo={() => {
                  setAberto(false)
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : error ? (
        <LoadError error={error} />
      ) : cargas.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma carga cadastrada ainda.</p>
      ) : (
        <div className="rounded-xl bg-card p-2 lg:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Carga</TableHead>
                <TableHead className="text-right">Peso</TableHead>
                <TableHead className="hidden md:table-cell">Partida</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead className="hidden md:table-cell">Vagão</TableHead>
                <TableHead className="hidden md:table-cell">Trem</TableHead>
                <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargas.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium whitespace-normal">{c.tipo}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {c.peso_t.toLocaleString('pt-BR')} t
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{c.local_partida}</TableCell>
                  <TableCell className="whitespace-normal">{c.destino}</TableCell>
                  <TableCell className="hidden md:table-cell">{c.vagao ?? '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">{c.trem_id ?? '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{dataHora(c.criado_em)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
