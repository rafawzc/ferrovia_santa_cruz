import type { ReactNode } from 'react'
import ferrovia from '@/assets/ferrovia.jpg'
import logo from '@/assets/logo.svg'

interface LayoutDeAutenticacaoProps {
  title: string
  description?: string
  children: ReactNode
}

export function LayoutDeAutenticacao({ title, description, children }: LayoutDeAutenticacaoProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground lg:flex-row">
      <div className="flex flex-1 flex-col lg:w-[45%] lg:flex-none">
        <div className="flex justify-center px-4 pt-10 pb-12 sm:px-6 lg:justify-start lg:px-12 lg:pb-16">
          <img src={logo} alt="Ferrovia Santa Cruz" className="w-44 sm:w-52" />
        </div>
        <main className="-mt-6 flex-1 rounded-t-xl bg-card px-4 pt-10 pb-10 text-card-foreground sm:px-8 lg:mt-0 lg:rounded-tl-none lg:rounded-tr-xl lg:rounded-br-xl lg:px-12 lg:pt-12">
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-titulo leading-tight font-bold lg:text-destaque">{title}</h1>
            {description && <p className="mt-3 text-corpo text-muted-foreground">{description}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>
      <div className="hidden overflow-hidden bg-marca lg:block lg:w-[55%]">
        <img src={ferrovia} alt="" className="size-full object-cover" />
      </div>
    </div>
  )
}
