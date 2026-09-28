import { BarChart3, Gauge, Radio, Train, Wrench } from 'lucide-react'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CartaoDeMetrica } from '@/components/ui/cartao-de-metrica'
import { ErroDeCarregamento } from '@/components/ui/erro-de-carregamento'
import { SeloDeStatus } from '@/components/ui/selo-de-status'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/hooks/dashboard'
import { useLinhas } from '@/hooks/linhas'

function Metricas() {
  const { data, isPending, error } = useDashboard()
  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }
  if (error) return <ErroDeCarregamento error={error} />
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <CartaoDeMetrica icon={BarChart3} label="Rotas ativas" value={data.linhas_ativas} />
      <CartaoDeMetrica
        icon={Wrench}
        label="Em manutenção"
        value={data.linhas_em_manutencao}
        status={data.linhas_em_manutencao > 0 ? 'alerta' : 'normal'}
      />
      <CartaoDeMetrica icon={Radio} label="Sensores" value={data.sensores} />
      <CartaoDeMetrica
        icon={Gauge}
        label="Velocidade média"
        value={
          data.velocidade_media === null
            ? 'Sem leitura'
            : `${data.velocidade_media.toFixed(0)} km/h`
        }
      />
    </div>
  )
}

function ListaDeRotas() {
  const { data: linhas, isPending, error } = useLinhas()

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    )
  }
  if (error) return <ErroDeCarregamento error={error} />
  if (linhas.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma rota cadastrada.</p>
  }

  return (
    <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {linhas.map((l) => (
        <li
          key={l.id}
          className="flex items-center justify-between gap-3 rounded-xl bg-primary p-4 text-primary-foreground"
        >
          <span className="flex items-center gap-3 font-semibold">
            <Train className="size-5" aria-hidden />
            Rota {l.numero}
            {!l.ativo && <span className="text-sm font-normal opacity-80">(inativa)</span>}
          </span>
          <SeloDeStatus status={l.status} />
        </li>
      ))}
    </ul>
  )
}

function StatusRotas() {
  return (
    <Card className="bg-accent text-accent-foreground">
      <CardHeader>
        <CardTitle>Status das rotas</CardTitle>
      </CardHeader>
      <CardContent>
        <ListaDeRotas />
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoDeTela title="Dashboard" />
      <Metricas />
      <StatusRotas />
    </div>
  )
}
