import { zodResolver } from '@hookform/resolvers/zod'
import { Fingerprint } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { CampoDeSenha } from '@/components/ui/campo-de-senha'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { LayoutDeAutenticacao } from '@/components/ui/layout-de-autenticacao'
import { useAutenticacao } from '@/contexts/Autenticacao'
import { ApiError } from '@/lib/api'

const esquema = z.object({
  email: z.email('Email inválido'),
  senha: z.string().min(1, 'Informe a senha'),
})

type ValoresDoFormulario = z.infer<typeof esquema>

function mensagemDeErro(erro: Error) {
  const status = erro instanceof ApiError ? erro.status : null
  if (status === 401) return 'E-mail ou senha incorretos'
  if (status === 403) return 'Usuário desativado. Fale com a gestão.'
  return 'Não foi possível entrar. Tente de novo.'
}

export default function Login() {
  const { entrar } = useAutenticacao()
  const formulario = useForm<ValoresDoFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: { email: '', senha: '' },
  })

  return (
    <LayoutDeAutenticacao title="Entrar na Conta">
      <form
        noValidate
        onSubmit={(e) => {
          void formulario.handleSubmit((credenciais) => {
            entrar.mutate(credenciais)
          })(e)
        }}
      >
        <FieldGroup>
          <Controller
            name="email"
            control={formulario.control}
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
            control={formulario.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="login-senha">Senha</FieldLabel>
                <CampoDeSenha
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
          {entrar.error && <FieldError>{mensagemDeErro(entrar.error)}</FieldError>}
          <Button type="submit" size="lg" disabled={entrar.isPending}>
            <Fingerprint />
            {entrar.isPending ? 'Entrando…' : 'Entrar'}
          </Button>
        </FieldGroup>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não tem uma conta?{' '}
        <Link to="/cadastro" className="font-semibold text-primary hover:underline">
          Criar Conta
        </Link>
      </p>
    </LayoutDeAutenticacao>
  )
}
