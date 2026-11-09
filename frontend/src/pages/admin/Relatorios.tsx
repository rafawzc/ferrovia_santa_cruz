import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useTrens } from '@/hooks/trens'
import { opcoesDeTipoDeRelatorio } from '@/lib/rotulos'

const TODOS_OS_TRENS = 'todos'

const esquema = z
  .object({
    tipo: z
      .string({ message: 'Escolha o tipo' })
      .refine((tipo) => opcoesDeTipoDeRelatorio.some(({ valor }) => valor === tipo), {
        message: 'Escolha o tipo',
      }),
    inicio: z.string().min(1, 'Informe a data inicial'),
    fim: z.string().min(1, 'Informe a data final'),
    trem_id: z.string(),
  })
  .refine((v) => v.fim >= v.inicio, { path: ['fim'], message: 'Fim antes do início' })

type ValoresDoFormulario = z.input<typeof esquema>

export default function Relatorios() {
  const navegar = useNavigate()
  const trens = useTrens()
  const formulario = useForm<ValoresDoFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: { inicio: '', fim: '', trem_id: TODOS_OS_TRENS },
  })
  const erros = formulario.formState.errors

  const gerar = formulario.handleSubmit((v) => {
    const parametros = new URLSearchParams({ tipo: v.tipo, inicio: v.inicio, fim: v.fim })
    if (v.trem_id !== TODOS_OS_TRENS) parametros.set('trem_id', v.trem_id)
    void navegar(`/admin/relatorios/ver?${parametros.toString()}`)
  })

  return (
    <>
      <CabecalhoDeTela
        title="Relatórios"
        apoio="Desempenho, consumo de energia, eficiência operacional e manutenção da frota."
      />
      <Card className="max-w-2xl">
        <CardContent>
          <form
            noValidate
            onSubmit={(e) => {
              void gerar(e)
            }}
          >
            <FieldGroup>
              <Field data-invalid={!!erros.tipo}>
                <FieldLabel htmlFor="relatorio-tipo">Tipo de relatório</FieldLabel>
                <Controller
                  control={formulario.control}
                  name="tipo"
                  render={({ field }) => (
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="relatorio-tipo"
                        className="w-full"
                        aria-invalid={!!erros.tipo}
                      >
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {opcoesDeTipoDeRelatorio.map(({ valor, rotulo }) => (
                          <SelectItem key={valor} value={valor}>
                            {rotulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {erros.tipo && <FieldError errors={[erros.tipo]} />}
              </Field>

              <FieldSet className="gap-1">
                <FieldLegend>Período</FieldLegend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!erros.inicio}>
                    <FieldLabel htmlFor="relatorio-inicio">Data inicial</FieldLabel>
                    <Input
                      id="relatorio-inicio"
                      type="date"
                      aria-invalid={!!erros.inicio}
                      {...formulario.register('inicio')}
                    />
                    {erros.inicio && <FieldError errors={[erros.inicio]} />}
                  </Field>
                  <Field data-invalid={!!erros.fim}>
                    <FieldLabel htmlFor="relatorio-fim">Data final</FieldLabel>
                    <Input
                      id="relatorio-fim"
                      type="date"
                      aria-invalid={!!erros.fim}
                      {...formulario.register('fim')}
                    />
                    {erros.fim && <FieldError errors={[erros.fim]} />}
                  </Field>
                </div>
              </FieldSet>

              <Field>
                <FieldLabel htmlFor="relatorio-trem">Trem</FieldLabel>
                {trens.isPending ? (
                  <Skeleton className="h-11 w-full rounded-full" />
                ) : (
                  <Controller
                    control={formulario.control}
                    name="trem_id"
                    render={({ field }) => (
                      <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="relatorio-trem" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TODOS_OS_TRENS}>Todos os trens</SelectItem>
                          {trens.data?.map((trem) => (
                            <SelectItem key={trem.id} value={String(trem.id)}>
                              {trem.prefixo} · {trem.modelo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {trens.error && (
                  <FieldDescription>
                    A lista de trens não carregou. O relatório sai com a frota inteira.
                  </FieldDescription>
                )}
              </Field>

              <div className="flex flex-col sm:flex-row sm:justify-end">
                <Button type="submit">Gerar relatório</Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
