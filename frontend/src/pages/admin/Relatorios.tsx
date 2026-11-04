import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TIPOS = [
  { valor: 'desempenho', rotulo: 'Desempenho' },
  { valor: 'consumo', rotulo: 'Consumo de energia' },
  { valor: 'eficiencia', rotulo: 'Eficiência operacional' },
  { valor: 'manutencao', rotulo: 'Manutenção' },
] as const

const esquema = z
  .object({
    tipo: z.enum(['desempenho', 'consumo', 'eficiencia', 'manutencao'], {
      message: 'Escolha o tipo',
    }),
    inicio: z.string().min(1, 'Informe a data inicial'),
    fim: z.string().min(1, 'Informe a data final'),
    trem_id: z.string().trim().regex(/^\d*$/, 'Só números'),
  })
  .refine((v) => v.fim >= v.inicio, { path: ['fim'], message: 'Fim antes do início' })

type ValoresDoFormulario = z.input<typeof esquema>

export default function Relatorios() {
  const navigate = useNavigate()
  const formulario = useForm<ValoresDoFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: { inicio: '', fim: '', trem_id: '' },
  })
  const erros = formulario.formState.errors

  const gerar = formulario.handleSubmit((v) => {
    const parametros = new URLSearchParams({ tipo: v.tipo, inicio: v.inicio, fim: v.fim })
    if (v.trem_id) parametros.set('trem_id', v.trem_id)
    void navigate(`/admin/relatorios/ver?${parametros.toString()}`)
  })

  return (
    <>
      <CabecalhoDeTela title="Relatórios" />
      <form
        noValidate
        className="max-w-xl rounded-xl bg-card p-4 lg:p-6"
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
                  <SelectTrigger id="relatorio-tipo" className="w-full" aria-invalid={!!erros.tipo}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map(({ valor, rotulo }) => (
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
          <Field data-invalid={!!erros.trem_id}>
            <FieldLabel htmlFor="relatorio-trem">Nº do trem (opcional)</FieldLabel>
            <Input
              id="relatorio-trem"
              inputMode="numeric"
              aria-invalid={!!erros.trem_id}
              {...formulario.register('trem_id')}
            />
            {erros.trem_id && <FieldError errors={[erros.trem_id]} />}
          </Field>
          <Button type="submit">Gerar relatório</Button>
        </FieldGroup>
      </form>
    </>
  )
}
