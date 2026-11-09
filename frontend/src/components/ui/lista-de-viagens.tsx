import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
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

const rotulo = 'text-rotulo font-semibold tracking-wide text-muted-foreground uppercase'

interface ListaDeViagensProps {
  viagens: Viagem[]
  acoes?: (viagem: Viagem) => ReactNode
}

export function ListaDeViagens({ viagens, acoes }: ListaDeViagensProps) {
  return (
    <>
      <ul className="grid gap-3 md:hidden">
        {viagens.map((viagem) => (
          <li
            key={viagem.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={rotulo}>Rota {viagem.linha_numero}</p>
                <p className="text-base leading-snug font-bold">
                  {viagem.origem} → {viagem.destino}
                </p>
              </div>
              <SeloDeStatus status={viagem.status} className="shrink-0" />
            </div>
            <p className="text-rotulo text-muted-foreground">Trem {viagem.trem_prefixo}</p>
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className={rotulo}>Partida</dt>
                <dd className="text-corpo tabular-nums">{dataHora(viagem.partida_prevista)}</dd>
              </div>
              <div>
                <dt className={rotulo}>Chegada</dt>
                <dd className="text-corpo tabular-nums">{dataHora(viagem.chegada_prevista)}</dd>
              </div>
            </dl>
            {acoes?.(viagem)}
          </li>
        ))}
      </ul>
      <Card className="hidden gap-0 px-2 py-2 md:block">
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
                <TableCell className="font-semibold tabular-nums">{viagem.linha_numero}</TableCell>
                <TableCell>
                  {viagem.origem} → {viagem.destino}
                </TableCell>
                <TableCell>{viagem.trem_prefixo}</TableCell>
                <TableCell className="tabular-nums">{dataHora(viagem.partida_prevista)}</TableCell>
                <TableCell className="tabular-nums">{dataHora(viagem.chegada_prevista)}</TableCell>
                <TableCell>
                  <SeloDeStatus status={viagem.status} />
                </TableCell>
                {acoes && <TableCell>{acoes(viagem)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}
