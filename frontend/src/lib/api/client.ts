import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'

export interface ErroValidacao {
  type: string
  loc: (string | number)[]
  msg: string
}

export interface ErroBody {
  detail: string | ErroValidacao[]
}

export class ApiError extends Error {
  readonly status: number
  readonly body: ErroBody | null

  constructor(status: number, body: ErroBody | null) {
    super(typeof body?.detail === 'string' ? body.detail : `Erro ${String(status)}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export async function requisitar<T>(method: string, path: string, body?: unknown): Promise<T> {
  const resposta = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!resposta.ok) {
    throw new ApiError(
      resposta.status,
      (await resposta.json().catch(() => null)) as ErroBody | null,
    )
  }
  if (resposta.status === 204) return undefined as T
  return (await resposta.json()) as T
}

export function tratouErrosDeCampo<T extends FieldValues>(
  erro: unknown,
  formulario: UseFormReturn<T>,
): boolean {
  const detalhe = erro instanceof ApiError && erro.status === 422 ? erro.body?.detail : undefined
  if (!Array.isArray(detalhe)) return false

  const valores = formulario.getValues()
  let marcou = false
  for (const { loc } of detalhe) {
    const [, campo] = loc
    const campoExisteNoFormulario = typeof campo === 'string' && campo in valores
    if (campoExisteNoFormulario) {
      formulario.setError(campo as Path<T>, { message: 'Valor inválido' })
      marcou = true
    }
  }
  return marcou
}
