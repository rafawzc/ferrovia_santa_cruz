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
    <div className="flex min-h-dvh flex-col bg-muted lg:flex-row">
      <div className="flex flex-1 flex-col lg:w-[45%] lg:flex-none">
        <div className="flex justify-center px-8 pt-10 pb-14 lg:justify-start lg:pb-20">
          <img src={logo} alt="Ferrovia Santa Cruz" className="w-52 lg:w-56" />
        </div>
        <main className="-mt-6 flex-1 rounded-t-[3rem] bg-card px-8 pt-10 pb-8 text-card-foreground lg:mt-0 lg:rounded-tl-none lg:rounded-r-[3rem] lg:rounded-bl-[3rem] lg:px-14 lg:pt-12">
          <h1 className="text-2xl font-bold lg:text-3xl">{title}</h1>
          {description && <p className="mt-3 text-sm text-muted-foreground">{description}</p>}
          <div className="mt-8">{children}</div>
        </main>
      </div>
      <div className="hidden overflow-hidden bg-primary lg:block lg:w-[55%]">
        <img src={ferrovia} alt="" className="size-full object-cover opacity-80" />
      </div>
    </div>
  )
}
