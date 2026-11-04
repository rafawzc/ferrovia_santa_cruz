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
import { SeloDeStatus } from '@/components/ui/selo-de-status'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useViagens } from '@/hooks/viagens'
import type { Viagem, ViagemStatus } from '@/lib/api'
import { dataHora } from '@/lib/utils'

const STATUS_DE_VIAGEM = [
  'programada',
  'em_andamento',
  'atrasada',
  'concluida',
  'cancelada',
] as const satisfies readonly ViagemStatus[]
const TODOS = 'todos'

function ListaDeViagens({ viagens }: { viagens: Viagem[] }) {
  return (
    <>
      <ul className="grid gap-3 md:hidden">
        {viagens.map((viagem) => (
          <li key={viagem.id} className="flex flex-col gap-2 rounded-xl bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold">Rota {viagem.linha_numero}</span>
              <SeloDeStatus status={viagem.status} />
            </div>
            <p>
              {viagem.origem} → {viagem.destino}
            </p>
            <p className="text-sm text-muted-foreground">Trem {viagem.trem_prefixo}</p>
            <p className="text-sm">Partida: {dataHora(viagem.partida_prevista)}</p>
            <p className="text-sm">Chegada: {dataHora(viagem.chegada_prevista)}</p>
          </li>
        ))}
      </ul>
      <div className="hidden rounded-xl bg-card p-4 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rota</TableHead>
              <TableHead>Trajeto</TableHead>
              <TableHead>Trem</TableHead>
              <TableHead>Partida</TableHead>
              <TableHead>Chegada</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viagens.map((viagem) => (
              <TableRow key={viagem.id}>
                <TableCell>{viagem.linha_numero}</TableCell>
                <TableCell>
                  {viagem.origem} → {viagem.destino}
                </TableCell>
                <TableCell>{viagem.trem_prefixo}</TableCell>
                <TableCell>{dataHora(viagem.partida_prevista)}</TableCell>
                <TableCell>{dataHora(viagem.chegada_prevista)}</TableCell>
                <TableCell>
                  <SeloDeStatus status={viagem.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

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
