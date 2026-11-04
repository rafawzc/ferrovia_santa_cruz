import type { ReactNode } from 'react'
import { SeloDeStatus } from '@/components/ui/selo-de-status'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Viagem } from '@/lib/api'
import { dataHora } from '@/lib/utils'

interface ListaDeViagensProps {
  viagens: Viagem[]
  acoes?: (viagem: Viagem) => ReactNode
}

export function ListaDeViagens({ viagens, acoes }: ListaDeViagensProps) {
  return (
    <>
      <ul className="grid gap-3 md:hidden">
        {viagens.map((viagem) => (
          <li key={viagem.id} className="flex flex-col gap-3 rounded-xl bg-card p-4">
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
            {acoes?.(viagem)}
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
              {acoes && <TableHead>Ações</TableHead>}
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
                {acoes && <TableCell>{acoes(viagem)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
