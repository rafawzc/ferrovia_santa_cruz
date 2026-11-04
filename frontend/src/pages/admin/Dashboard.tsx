import { Gauge, Radio, Route } from 'lucide-react'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CartaoDeMetrica } from '@/components/ui/cartao-de-metrica'
import { ErroDeCarregamento } from '@/components/ui/erro-de-carregamento'
import { GraficoDeBarras, type BarraDeGrafico } from '@/components/ui/grafico-de-barras'
import { Skeleton } from '@/components/ui/skeleton'
import { useAutenticacao } from '@/contexts/Autenticacao'
import { useDashboard } from '@/hooks/dashboard'
import type { Dashboard as DadosDoPainel, Severidade, TremStatus } from '@/lib/api'

const ROTULO_DO_TREM: Record<TremStatus, string> = {
  ativo: 'Ativo',
  manutencao: 'Manutenção',
  parado: 'Parado',
}

const ROTULO_DA_SEVERIDADE: Record<Severidade, string> = {
  normal: 'Normal',
  atencao: 'Atenção',
  critico: 'Crítico',
}

const VARIANTE_DA_SEVERIDADE: Record<Severidade, BarraDeGrafico['variant']> = {
  normal: 'success',
  atencao: 'warning',
  critico: 'danger',
}

function barrasDeTrens(dados: DadosDoPainel['trens_por_status']): BarraDeGrafico[] {
  return (dados ?? []).map((c) => ({
    rotulo: ROTULO_DO_TREM[c.status],
    valor: c.quantidade,
    variant: 'default',
  }))
}

function barrasDeAlertas(dados: DadosDoPainel['alertas_ativos_por_severidade']): BarraDeGrafico[] {
  return (dados ?? []).map((c) => ({
    rotulo: ROTULO_DA_SEVERIDADE[c.severidade],
    valor: c.quantidade,
    variant: VARIANTE_DA_SEVERIDADE[c.severidade],
  }))
}

function statusDosSensores(criticos: number | null) {
  if (criticos === null) return undefined
  return criticos > 0 ? 'falha' : 'normal'
}

function Grafico({ titulo, barras }: { titulo: string; barras: BarraDeGrafico[] }) {
  return (
    <Card className="bg-accent text-accent-foreground">
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <GraficoDeBarras barras={barras} />
      </CardContent>
    </Card>
  )
}

function Painel() {
  const { usuario } = useAutenticacao()
  const { data, isPending, error } = useDashboard()
  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }
  if (error) return <ErroDeCarregamento error={error} />

  const soViagens = usuario?.papel === 'cliente'

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CartaoDeMetrica
          icon={Route}
          label="Viagens em andamento"
          value={data.viagens_em_andamento}
        />
        {!soViagens && (
          <>
            <CartaoDeMetrica
              icon={Gauge}
              label="Velocidade média"
              value={
                data.velocidade_media === null
                  ? 'Sem leitura'
                  : `${data.velocidade_media.toFixed(0)} km/h`
              }
            />
            <CartaoDeMetrica
              icon={Radio}
              label="Sensores críticos"
              value={data.sensores_criticos ?? 'Sem dados'}
              status={statusDosSensores(data.sensores_criticos)}
            />
          </>
        )}
      </div>
      {!soViagens && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Grafico titulo="Trens por status" barras={barrasDeTrens(data.trens_por_status)} />
          <Grafico
            titulo="Alertas ativos por severidade"
            barras={barrasDeAlertas(data.alertas_ativos_por_severidade)}
          />
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { usuario } = useAutenticacao()
  const titulo = usuario?.papel === 'operacional' ? 'Dashboard do seu trem' : 'Dashboard'
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoDeTela title={titulo} />
      <Painel />
    </div>
  )
}
