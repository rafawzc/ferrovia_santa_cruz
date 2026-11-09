import { useState } from 'react'
import { TrainFront } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { ErroDeCarregamento } from '@/components/ui/erro-de-carregamento'
import { EstadoVazio } from '@/components/ui/estado-vazio'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ListaDeViagens } from '@/components/ui/lista-de-viagens'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
    refetch,
  } = useViagens({
    status: STATUS_DE_VIAGEM.find((item) => item === filtroDeStatus),
    data: filtroDeData || undefined,
  })
  const temFiltro = filtroDeStatus !== TODOS || filtroDeData !== ''

  return (
    <>
      <CabecalhoDeTela
        title="Viagens"
        apoio="Todas as viagens da malha, da mais recente para a mais antiga."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="filtro-de-status">Status</FieldLabel>
          <Select value={filtroDeStatus} onValueChange={setFiltroDeStatus}>
            <SelectTrigger id="filtro-de-status" className="w-full">
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
        </Field>
        <Field>
          <FieldLabel htmlFor="filtro-de-dia">Dia da partida</FieldLabel>
          <Input
            id="filtro-de-dia"
            type="date"
            value={filtroDeData}
            onChange={(evento) => {
              setFiltroDeData(evento.target.value)
            }}
          />
        </Field>
      </div>

      {isPending && (
        <div className="grid gap-3">
          {Array.from({ length: 4 }, (_, indice) => (
            <Skeleton key={indice} className="h-32 md:h-12" />
          ))}
        </div>
      )}

      {error && (
        <ErroDeCarregamento
          error={error}
          aoTentarDeNovo={() => {
            void refetch()
          }}
        />
      )}

      {viagens?.length === 0 && (
        <EstadoVazio
          icone={TrainFront}
          titulo="Nenhuma viagem encontrada"
          descricao={
            temFiltro ? 'Tente outro status ou outro dia.' : 'Ainda não há viagens programadas.'
          }
          acao={
            temFiltro ? (
              <Button
                variant="outline"
                onClick={() => {
                  setFiltroDeStatus(TODOS)
                  setFiltroDeData('')
                }}
              >
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      )}

      {viagens && viagens.length > 0 && <ListaDeViagens viagens={viagens} />}
    </>
  )
}
