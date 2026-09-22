import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { AuthLayout } from '@/components/ui/auth-layout'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useRecuperarSenha } from '@/hooks/auth'

const schema = z.object({
  email: z.email('Email inválido'),
})

type FormValues = z.infer<typeof schema>

export default function RecuperarSenha() {
  const recuperar = useRecuperarSenha()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  return (
    <AuthLayout
      title="Recuperar Senha"
      description="Informe o e-mail da sua conta. Se ele estiver cadastrado, enviaremos as instruções pra redefinir a senha."
    >
      {recuperar.isSuccess ? (
        <p role="status" className="rounded-xl bg-success/15 p-4 text-sm font-medium text-success">
          Se o e-mail estiver cadastrado, as instruções serão enviadas.
        </p>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            void form.handleSubmit(({ email }) => {
              recuperar.mutate(email)
            })(e)
          }}
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="recuperar-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="recuperar-email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            {recuperar.isError && (
              <FieldError>Não foi possível enviar agora. Tente de novo.</FieldError>
            )}
            <Button type="submit" size="lg" disabled={recuperar.isPending}>
              {recuperar.isPending ? 'Enviando…' : 'Enviar instruções'}
            </Button>
          </FieldGroup>
        </form>
      )}
      <Button asChild variant="ghost" className="mt-6">
        <Link to="/login">
          <ArrowLeft />
          Voltar para o login
        </Link>
      </Button>
    </AuthLayout>
  )
}
