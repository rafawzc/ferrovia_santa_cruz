import { zodResolver } from '@hookform/resolvers/zod'
import { LogOut } from 'lucide-react'
import { Controller, useForm, useWatch, type Control } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { ScreenHeader } from '@/components/ui/screen-header'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { mensagemDeErro } from '@/components/ui/load-error'
import { useAuth } from '@/contexts/AuthContext'
import { useAtualizarPerfil } from '@/hooks/auth'
import { ApiError, marcarErrosDeCampo, type PerfilEdicao, type Usuario } from '@/lib/api'

const schema = z
  .object({
    nome: z.string().trim().min(1, 'Informe o nome').max(120, 'Máximo de 120 caracteres'),
    email: z.email('Email inválido').max(160, 'Máximo de 160 caracteres'),
    telefone: z.string().trim().max(20, 'Máximo de 20 caracteres'),
    senha: z
      .string()
      .refine((v) => v === '' || (v.length >= 8 && v.length <= 128), 'Entre 8 e 128 caracteres'),
    senha_atual: z.string(),
  })
  .refine((v) => v.senha === '' || v.senha_atual !== '', {
    message: 'Informe a senha atual pra trocar a senha',
    path: ['senha_atual'],
  })

type Valores = z.infer<typeof schema>
type Nome = keyof Valores

const EDITAVEIS = ['nome', 'email', 'telefone', 'senha'] as const

function valoresDe(usuario: Usuario): Valores {
  return {
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone ?? '',
    senha: '',
    senha_atual: '',
  }
}

function iniciais(nome: string) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}

interface CampoProps {
  control: Control<Valores>
  name: Nome
  label: string
  type?: 'text' | 'email' | 'tel' | 'password'
  autoComplete: string
  descricao?: string
}

function Campo({ control, name, label, type = 'text', autoComplete, descricao }: CampoProps) {
  const id = `perfil-${name}`
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {type === 'password' ? (
            <PasswordInput
              {...field}
              id={id}
              autoComplete={autoComplete}
              aria-invalid={fieldState.invalid}
            />
          ) : (
            <Input
              {...field}
              id={id}
              type={type}
              autoComplete={autoComplete}
              aria-invalid={fieldState.invalid}
            />
          )}
          {descricao && <FieldDescription>{descricao}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

function PerfilForm({ usuario }: { usuario: Usuario }) {
  const atualizar = useAtualizarPerfil()
  const form = useForm<Valores>({
    resolver: zodResolver(schema),
    defaultValues: valoresDe(usuario),
  })
  const senha = useWatch({ control: form.control, name: 'senha' })

  function salvar(valores: Valores) {
    const { dirtyFields } = form.formState
    const dados: PerfilEdicao = Object.fromEntries(
      EDITAVEIS.filter((c) => dirtyFields[c]).map((c) => [c, valores[c]]),
    )
    if (dados.senha) dados.senha_atual = valores.senha_atual

    atualizar.mutate(dados, {
      onSuccess: (atualizado) => {
        form.reset(valoresDe(atualizado))
        toast.success('Perfil atualizado')
      },
      onError: (erro) => {
        if (erro instanceof ApiError && erro.status === 400) {
          form.setError('senha_atual', { message: erro.message })
          return
        }
        if (erro instanceof ApiError && erro.status === 409) {
          form.setError('email', { message: 'Esse email já está em uso' })
          return
        }
        if (marcarErrosDeCampo(erro, form)) return
        toast.error(mensagemDeErro(erro))
      },
    })
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        void form.handleSubmit(salvar)(e)
      }}
    >
      <FieldGroup>
        <Campo control={form.control} name="nome" label="Nome" autoComplete="name" />
        <Campo
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
        />
        <Campo
          control={form.control}
          name="telefone"
          label="Telefone"
          type="tel"
          autoComplete="tel"
        />
        <Campo
          control={form.control}
          name="senha"
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          descricao="Deixe em branco pra manter a senha atual."
        />
        {senha !== '' && (
          <Campo
            control={form.control}
            name="senha_atual"
            label="Senha atual"
            type="password"
            autoComplete="current-password"
          />
        )}
        <Button type="submit" disabled={!form.formState.isDirty || atualizar.isPending}>
          {atualizar.isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </FieldGroup>
    </form>
  )
}

export default function Perfil() {
  const { usuario, logout } = useAuth()
  if (!usuario) return null

  return (
    <div className="mx-auto w-full max-w-2xl">
      <ScreenHeader title="Perfil" actions={<ThemeToggle />} />

      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Avatar className="size-32 lg:size-40">
          {usuario.foto_url && <AvatarImage src={usuario.foto_url} alt="" />}
          <AvatarFallback className="text-3xl font-bold">{iniciais(usuario.nome)}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-bold text-foreground lg:text-xl">Informações do perfil</h2>
      </div>

      <PerfilForm usuario={usuario} />

      <Button
        type="button"
        variant="destructive"
        className="mt-4 w-full"
        disabled={logout.isPending}
        onClick={() => {
          logout.mutate(undefined, {
            onError: () => toast.error('Não foi possível sair. Tente de novo.'),
          })
        }}
      >
        <LogOut />
        Sair da conta
      </Button>
    </div>
  )
}
