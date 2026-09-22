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

export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    throw new ApiError(res.status, (await res.json().catch(() => null)) as ErroBody | null)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
