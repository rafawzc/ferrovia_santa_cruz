import type { ReactNode } from 'react'

export function BannerDeErro({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-lg bg-destructive px-4 py-3 text-rotulo font-semibold text-destructive-foreground"
    >
      {children}
    </p>
  )
}
