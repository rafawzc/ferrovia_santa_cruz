import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { Controller, useForm, useWatch, type Control } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { CampoDeSenha } from '@/components/ui/campo-de-senha'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BotaoDeSair } from '@/components/ui/casca-de-pagina'
import { mensagemDeErro } from '@/components/ui/erro-de-carregamento'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAutenticacao } from '@/contexts/Autenticacao'
import { useAtualizarPerfil } from '@/hooks/auth'
import { ApiError, tratouErrosDeCampo, type PerfilEdicao, type Usuario } from '@/lib/api'
import { rotuloDeCargo } from '@/lib/rotulos'

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
}

function Campo({ control, name, label, type = 'text', autoComplete }: CampoProps) {
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
      className="flex flex-col gap-6 lg:col-span-2 lg:gap-8"
      onSubmit={(evento) => {
        void formulario.handleSubmit(salvar)(evento)
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Dados da conta</CardTitle>
          <CardDescription>Nome e contato que a equipe vê no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
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
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5" aria-hidden />
            Senha
          </CardTitle>
          <CardDescription>
            Deixe em branco para manter a senha atual. Ao digitar uma nova senha, confirme com a
            senha que você usa hoje.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Campo
              control={formulario.control}
              name="senha"
              label="Nova senha"
              type="password"
              autoComplete="new-password"
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
          </FieldGroup>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full sm:w-auto sm:self-end"
        disabled={!formulario.formState.isDirty || atualizar.isPending}
      >
        {atualizar.isPending ? 'Salvando…' : 'Salvar alterações'}
      </Button>
    </form>
  )
}

export default function Perfil() {
  const { usuario } = useAutenticacao()
  if (!usuario) return null

  return (
    <>
      <CabecalhoDeTela title="Perfil" />

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <Card className="h-fit items-center px-6 text-center">
          <Avatar className="size-24 lg:size-28">
            {usuario.foto_url && (
              <AvatarImage src={usuario.foto_url} alt="" className="object-cover" />
            )}
            <AvatarFallback className="text-2xl font-bold">{iniciais(usuario.nome)}</AvatarFallback>
          </Avatar>

          <div className="flex w-full flex-col items-center gap-2">
            <h2 className="text-xl leading-tight font-semibold">{usuario.nome}</h2>
            <p className="w-full truncate text-sm text-muted-foreground" title={usuario.email}>
              {usuario.email}
            </p>
            <Badge variant="secondary">{rotuloDeCargo(usuario.cargo)}</Badge>
          </div>

          <BotaoDeSair />
        </Card>

        <FormularioDePerfil usuario={usuario} />
      </div>
    </>
  )
}
