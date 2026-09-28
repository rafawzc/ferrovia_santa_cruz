import { zodResolver } from '@hookform/resolvers/zod'
import { LogOut } from 'lucide-react'
import { Controller, useForm, useWatch, type Control } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlternadorDeTema } from '@/components/ui/alternador-de-tema'
import { Button } from '@/components/ui/button'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { CampoDeSenha } from '@/components/ui/campo-de-senha'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { mensagemDeErro } from '@/components/ui/erro-de-carregamento'
import { useAutenticacao } from '@/contexts/Autenticacao'
import { useAtualizarPerfil } from '@/hooks/auth'
import { ApiError, tratouErrosDeCampo, type PerfilEdicao, type Usuario } from '@/lib/api'

const esquema = z
  .object({
    nome: z.string().trim().min(1, 'Informe o nome').max(120, 'Máximo de 120 caracteres'),
    email: z.email('Email inválido').max(160, 'Máximo de 160 caracteres'),
    telefone: z.string().trim().max(20, 'Máximo de 20 caracteres'),
    senha: z
      .string()
      .refine(
        (valor) => valor === '' || (valor.length >= 8 && valor.length <= 128),
        'Entre 8 e 128 caracteres',
      ),
    senha_atual: z.string(),
  })
  .refine((valores) => valores.senha === '' || valores.senha_atual !== '', {
    message: 'Informe a senha atual pra trocar a senha',
    path: ['senha_atual'],
  })

type ValoresDoFormulario = z.infer<typeof esquema>
type NomeDoCampo = keyof ValoresDoFormulario

const EDITAVEIS = ['nome', 'email', 'telefone', 'senha'] as const

function valoresDe(usuario: Usuario): ValoresDoFormulario {
  return {
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone ?? '',
    senha: '',
    senha_atual: '',
  }
}

function dadosAlterados(
  valores: ValoresDoFormulario,
  alterados: Partial<Record<NomeDoCampo, boolean>>,
): PerfilEdicao {
  const dados: PerfilEdicao = Object.fromEntries(
    EDITAVEIS.filter((campo) => alterados[campo]).map((campo) => [campo, valores[campo]]),
  )
  if (dados.senha) dados.senha_atual = valores.senha_atual
  return dados
}

function iniciais(nome: string) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')
}

interface CampoProps {
  control: Control<ValoresDoFormulario>
  name: NomeDoCampo
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
            <CampoDeSenha
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

function FormularioDePerfil({ usuario }: { usuario: Usuario }) {
  const atualizar = useAtualizarPerfil()
  const formulario = useForm<ValoresDoFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: valoresDe(usuario),
  })
  const senha = useWatch({ control: formulario.control, name: 'senha' })

  function aoErrar(erro: Error) {
    if (erro instanceof ApiError && erro.status === 400) {
      formulario.setError('senha_atual', { message: erro.message })
      return
    }
    if (erro instanceof ApiError && erro.status === 409) {
      formulario.setError('email', { message: 'Esse email já está em uso' })
      return
    }
    if (tratouErrosDeCampo(erro, formulario)) return
    toast.error(mensagemDeErro(erro))
  }

  function salvar(valores: ValoresDoFormulario) {
    atualizar.mutate(dadosAlterados(valores, formulario.formState.dirtyFields), {
      onSuccess: (atualizado) => {
        formulario.reset(valoresDe(atualizado))
        toast.success('Perfil atualizado')
      },
      onError: aoErrar,
    })
  }

  const trocandoSenha = senha !== ''

  return (
    <form
      noValidate
      onSubmit={(evento) => {
        void formulario.handleSubmit(salvar)(evento)
      }}
    >
      <FieldGroup>
        <Campo control={formulario.control} name="nome" label="Nome" autoComplete="name" />
        <Campo
          control={formulario.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
        />
        <Campo
          control={formulario.control}
          name="telefone"
          label="Telefone"
          type="tel"
          autoComplete="tel"
        />
        <Campo
          control={formulario.control}
          name="senha"
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          descricao="Deixe em branco pra manter a senha atual."
        />
        {trocandoSenha && (
          <Campo
            control={formulario.control}
            name="senha_atual"
            label="Senha atual"
            type="password"
            autoComplete="current-password"
          />
        )}
        <Button type="submit" disabled={!formulario.formState.isDirty || atualizar.isPending}>
          {atualizar.isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </FieldGroup>
    </form>
  )
}

export default function Perfil() {
  const { usuario, sair } = useAutenticacao()
  if (!usuario) return null

  return (
    <div className="mx-auto w-full max-w-2xl">
      <CabecalhoDeTela title="Perfil" actions={<AlternadorDeTema />} />

      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Avatar className="size-32 lg:size-40">
          {usuario.foto_url && <AvatarImage src={usuario.foto_url} alt="" />}
          <AvatarFallback className="text-3xl font-bold">{iniciais(usuario.nome)}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-bold text-foreground lg:text-xl">Informações do perfil</h2>
      </div>

      <FormularioDePerfil usuario={usuario} />

      <Button
        type="button"
        variant="destructive"
        className="mt-4 w-full"
        disabled={sair.isPending}
        onClick={() => {
          sair.mutate(undefined, {
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
