import { useState } from 'react'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { ErroDeCarregamento } from '@/components/ui/erro-de-carregamento'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ListaDeViagens } from '@/components/ui/lista-de-viagens'
import { SeloDeStatus, STATUS_DE_VIAGEM } from '@/components/ui/selo-de-status'
import { Skeleton } from '@/components/ui/skeleton'
import { useViagens } from '@/hooks/viagens'

const TODOS = 'todos'

export default function Viagens() {
  const [filtroDeStatus, setFiltroDeStatus] = useState(TODOS)
  const [filtroDeData, setFiltroDeData] = useState('')
  const {
    data: viagens,
    isPending,
    error,
  } = useViagens({
    status: STATUS_DE_VIAGEM.find((item) => item === filtroDeStatus),
    data: filtroDeData || undefined,
  })

  return (
    <>
      <CabecalhoDeTela title="Viagens" />
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select value={filtroDeStatus} onValueChange={setFiltroDeStatus}>
            <SelectTrigger className="w-full" aria-label="Filtrar por status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos os status</SelectItem>
              {STATUS_DE_VIAGEM.map((item) => (
                <SelectItem key={item} value={item}>
                  <SeloDeStatus status={item} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            aria-label="Filtrar por dia"
            value={filtroDeData}
            onChange={(evento) => {
              setFiltroDeData(evento.target.value)
            }}
          />
        </div>

        {isPending && (
          <div className="grid gap-3">
            {Array.from({ length: 4 }, (_, indice) => (
              <Skeleton key={indice} className="h-32 md:h-10" />
            ))}
          </div>
        )}
        {error && <ErroDeCarregamento error={error} />}
        {viagens?.length === 0 && (
          <p className="text-muted-foreground">Nenhuma viagem encontrada.</p>
        )}
        {viagens && viagens.length > 0 && <ListaDeViagens viagens={viagens} />}
      </div>
    </>
  )
}
