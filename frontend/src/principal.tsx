import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import Aplicacao from '@/Aplicacao'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ProvedorDeAutenticacao } from '@/contexts/Autenticacao'
import { ProvedorDeTema } from '@/contexts/Tema'
import { clienteDeConsultas } from '@/lib/cliente-de-consultas'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={clienteDeConsultas}>
      <ProvedorDeTema>
        <ProvedorDeAutenticacao>
          <TooltipProvider>
            <Aplicacao />
            <Toaster />
          </TooltipProvider>
        </ProvedorDeAutenticacao>
      </ProvedorDeTema>
    </QueryClientProvider>
  </StrictMode>,
)
