import { zodResolver } from '@hookform/resolvers/zod'
import { MailCheck, Send } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { BannerDeErro } from '@/components/ui/banner-de-erro'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { LayoutDeAutenticacao } from '@/components/ui/layout-de-autenticacao'
import { useRecuperarSenha } from '@/hooks/auth'

const esquema = z.object({
  email: z.email('Email inválido'),
})

type ValoresDoFormulario = z.infer<typeof esquema>

export default function RecuperarSenha() {
  const recuperar = useRecuperarSenha()
  const formulario = useForm<ValoresDoFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: { email: '' },
  })

  return (
    <LayoutDeAutenticacao
      title="Recuperar senha"
      description="Informe o e-mail da sua conta. Se ele estiver cadastrado, enviaremos as instruções pra redefinir a senha."
    >
      {recuperar.isSuccess ? (
        <div role="status" className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-success text-success-foreground">
            <MailCheck className="size-6" aria-hidden />
          </span>
          <p className="text-xl leading-tight font-semibold">Verifique seu e-mail</p>
          <p className="text-base text-muted-foreground">
            Se o e-mail estiver cadastrado, as instruções serão enviadas.
          </p>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            void formulario.handleSubmit(({ email }) => {
              recuperar.mutate(email)
            })(e)
          }}
        >
          <FieldGroup>
            {recuperar.isError && (
              <BannerDeErro>Não foi possível enviar agora. Tente de novo.</BannerDeErro>
            )}
            <Controller
              name="email"
              control={formulario.control}
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
            <Button type="submit" size="lg" disabled={recuperar.isPending}>
              <Send aria-hidden />
              {recuperar.isPending ? 'Enviando…' : 'Enviar instruções'}
            </Button>
          </FieldGroup>
        </form>
      )}
      <p className="mt-6 text-center text-rotulo text-muted-foreground lg:mt-8">
        Lembrou sua senha?{' '}
        <Link
          to="/login"
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </LayoutDeAutenticacao>
  )
}
