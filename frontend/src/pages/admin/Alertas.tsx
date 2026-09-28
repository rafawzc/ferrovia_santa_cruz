import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useAlertas, useCriarAlerta } from '@/hooks/alertas'
import { useLinhas } from '@/hooks/linhas'
import { ApiError, tratouErrosDeCampo } from '@/lib/api'
import { dataHora } from '@/lib/utils'

const esquema = z.object({
  linha_id: z.string().min(1, 'Escolha a rota'),
  tempo_espera: z.string().trim().max(40, 'Máximo de 40 caracteres'),
  motivo: z.string().trim().min(1, 'Informe o motivo').max(200, 'Máximo de 200 caracteres'),
  status: z.string().trim().min(1, 'Informe o status').max(40, 'Máximo de 40 caracteres'),
})

type ValoresDoFormulario = z.infer<typeof esquema>

const VAZIO: ValoresDoFormulario = { linha_id: '', tempo_espera: '', motivo: '', status: '' }

function NovoAlerta() {
  const linhas = useLinhas()
  const criar = useCriarAlerta()
  const formulario = useForm<ValoresDoFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: VAZIO,
  })

  function enviar(v: ValoresDoFormulario) {
    criar.mutate(
      {
        linha_id: Number(v.linha_id),
        motivo: v.motivo,
        status: v.status,
        ...(v.tempo_espera && { tempo_espera: v.tempo_espera }),
      },
      {
        onSuccess: () => {
          toast.success('Alerta enviado')
          formulario.reset(VAZIO)
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
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo alerta</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          onSubmit={(e) => {
            void formulario.handleSubmit(enviar)(e)
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
                  {linhas.error && <ErroDeCarregamento error={linhas.error} />}
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="tempo_espera"
              control={formulario.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="alerta-espera">Tempo de espera (opcional)</FieldLabel>
                  <Input
                    {...field}
                    id="alerta-espera"
                    placeholder="Ex: 15 a 30 min"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="motivo"
              control={formulario.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="alerta-motivo">Motivo</FieldLabel>
                  <Input
                    {...field}
                    id="alerta-motivo"
                    placeholder="Ex: manutenção no trilho"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="status"
              control={formulario.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="alerta-status">Status</FieldLabel>
                  <Input
                    {...field}
                    id="alerta-status"
                    placeholder="Ex: Parado"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Button type="submit" disabled={criar.isPending} className="self-end">
              {criar.isPending ? 'Enviando…' : 'Enviar'}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

function ListaDeAlertas() {
  const { data: alertas, isPending, error } = useAlertas()

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    )
  }
  if (error) return <ErroDeCarregamento error={error} />
  if (alertas.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum alerta enviado ainda.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {alertas.map((a) => (
        <li key={a.id}>
          <Card className="gap-2 bg-accent p-4 text-accent-foreground">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold">Rota {a.linha_numero}</p>
              <time dateTime={a.criado_em} className="text-xs text-muted-foreground">
                {dataHora(a.criado_em)}
              </time>
            </div>
            <p className="text-sm">
              <span className="text-muted-foreground">Status:</span> {a.status}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Motivo:</span> {a.motivo}
            </p>
            {a.tempo_espera && (
              <p className="text-sm">
                <span className="text-muted-foreground">Tempo de espera:</span> {a.tempo_espera}
              </p>
            )}
          </Card>
        </li>
      ))}
    </ul>
  )
}

function Historico() {
  return (
    <section aria-labelledby="historico" className="flex flex-col gap-4">
      <h2 id="historico" className="text-lg font-bold text-foreground">
        Alertas enviados
      </h2>
      <ListaDeAlertas />
    </section>
  )
}

export default function Alertas() {
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoDeTela title="Alertas e Notificações" />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <NovoAlerta />
        <Historico />
      </div>
    </div>
  )
}
