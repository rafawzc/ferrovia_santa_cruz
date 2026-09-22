import { zodResolver } from '@hookform/resolvers/zod'
import { Fingerprint } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { AuthLayout } from '@/components/ui/auth-layout'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'

const schema = z.object({
  email: z.email('Email inválido'),
  senha: z.string().min(1, 'Informe a senha'),
})

type FormValues = z.infer<typeof schema>

function mensagemDeErro(erro: Error) {
  if (erro instanceof ApiError) {
    if (erro.status === 401) return 'E-mail ou senha incorretos'
    if (erro.status === 403) return 'Usuário desativado. Fale com a gestão.'
  }
  return 'Não foi possível entrar. Tente de novo.'
}

export default function Login() {
  const { login } = useAuth()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', senha: '' },
  })

  return (
    <AuthLayout title="Entrar na Conta">
      <form
        noValidate
        onSubmit={(e) => {
          void form.handleSubmit((dados) => {
            login.mutate(dados)
          })(e)
        }}
      >
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="senha"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="login-senha">Senha</FieldLabel>
                <PasswordInput
                  {...field}
                  id="login-senha"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                <Link
                  to="/recuperar-senha"
                  className="w-fit text-xs font-semibold text-foreground hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </Field>
            )}
          />
          {login.error && <FieldError>{mensagemDeErro(login.error)}</FieldError>}
          <Button type="submit" size="lg" disabled={login.isPending}>
            <Fingerprint />
            {login.isPending ? 'Entrando…' : 'Entrar'}
          </Button>
        </FieldGroup>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não tem uma conta?{' '}
        <Link to="/cadastro" className="font-semibold text-primary hover:underline">
          Criar Conta
        </Link>
      </p>
    </AuthLayout>
  )
}
