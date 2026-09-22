import { zodResolver } from '@hookform/resolvers/zod'
import { Fingerprint } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { AuthLayout } from '@/components/ui/auth-layout'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Switch } from '@/components/ui/switch'
import { useCadastro } from '@/hooks/auth'
import { ApiError, marcarErrosDeCampo } from '@/lib/api'

const schema = z
  .object({
    nome: z.string().trim().min(1, 'Informe o nome').max(120, 'Máximo de 120 caracteres'),
    email: z.email('Email inválido').max(160, 'Máximo de 160 caracteres'),
    senha: z.string().min(8, 'Mínimo de 8 caracteres').max(128, 'Máximo de 128 caracteres'),
    confirmarSenha: z.string(),
    termos: z.boolean().refine((v) => v, 'Aceite os termos pra criar a conta'),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não coincidem',
  })

type FormValues = z.infer<typeof schema>

export default function Cadastro() {
  const navigate = useNavigate()
  const cadastro = useCadastro()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '', termos: false },
  })

  function enviar({ nome, email, senha }: FormValues) {
    cadastro.mutate(
      { nome, email, senha },
      {
        onSuccess: () => {
          toast.success('Conta criada. Entre com seu e-mail e senha.')
          void navigate('/login')
        },
        onError: (erro) => {
          if (erro instanceof ApiError && erro.status === 409) {
            form.setError('email', { message: 'Este e-mail já está cadastrado' })
            return
          }
          if (marcarErrosDeCampo(erro, form)) return
          toast.error('Não foi possível criar a conta. Tente de novo.')
        },
      },
    )
  }

  return (
    <AuthLayout title="Crie sua Conta">
      <form
        noValidate
        onSubmit={(e) => {
          void form.handleSubmit(enviar)(e)
        }}
      >
        <FieldGroup>
          <Controller
            name="nome"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="cadastro-nome">Nome</FieldLabel>
                <Input
                  {...field}
                  id="cadastro-nome"
                  autoComplete="name"
                  placeholder="Seu nome completo"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="cadastro-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="cadastro-email"
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
                <FieldLabel htmlFor="cadastro-senha">Senha</FieldLabel>
                <PasswordInput
                  {...field}
                  id="cadastro-senha"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription>A senha deve ter no mínimo 8 caracteres.</FieldDescription>
                )}
              </Field>
            )}
          />
          <Controller
            name="confirmarSenha"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="cadastro-confirmar">Confirmar Senha</FieldLabel>
                <PasswordInput
                  {...field}
                  id="cadastro-confirmar"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="termos"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                <Switch
                  id="cadastro-termos"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                <FieldLabel htmlFor="cadastro-termos">
                  Aceito os termos e a política de privacidade.
                </FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Button type="submit" size="lg" disabled={cadastro.isPending}>
            <Fingerprint />
            {cadastro.isPending ? 'Criando…' : 'Criar'}
          </Button>
        </FieldGroup>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
