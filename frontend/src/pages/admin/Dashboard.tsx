import { Gauge, Radio, Route, TrainFront } from 'lucide-react'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CartaoDeMetrica } from '@/components/ui/cartao-de-metrica'
import { ErroDeCarregamento } from '@/components/ui/erro-de-carregamento'
import { EstadoVazio } from '@/components/ui/estado-vazio'
import { GraficoDeBarras, type BarraDeGrafico } from '@/components/ui/grafico-de-barras'
import { ListaDeViagens } from '@/components/ui/lista-de-viagens'
import { rotuloDeStatus } from '@/components/ui/selo-de-status'
import { Skeleton } from '@/components/ui/skeleton'
import { useAutenticacao } from '@/contexts/Autenticacao'
import { useDashboard } from '@/hooks/dashboard'
import { useViagens } from '@/hooks/viagens'
import type { Dashboard as DadosDoPainel, Severidade } from '@/lib/api'

const VARIANTE_DA_SEVERIDADE: Record<Severidade, BarraDeGrafico['variant']> = {
  normal: 'success',
  atencao: 'warning',
  critico: 'danger',
}

function barrasDeTrens(dados: DadosDoPainel['trens_por_status']): BarraDeGrafico[] {
  return (dados ?? []).map((c) => ({
    rotulo: rotuloDeStatus(c.status),
    valor: c.quantidade,
    variant: 'default',
  }))
}

function barrasDeAlertas(dados: DadosDoPainel['alertas_ativos_por_severidade']): BarraDeGrafico[] {
  return (dados ?? []).map((c) => ({
    rotulo: rotuloDeStatus(c.severidade),
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
    <Card>
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
  const { data, isPending, error, refetch } = useDashboard()

  if (isPending) {
    return (
      <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((indice) => (
            <Skeleton key={indice} className="h-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[0, 1].map((indice) => (
            <Skeleton key={indice} className="h-64" />
          ))}
        </div>
      </>
    )
  }

  if (error) {
    return (
      <ErroDeCarregamento
        error={error}
        aoTentarDeNovo={() => {
          void refetch()
        }}
      />
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CartaoDeMetrica
          icon={Route}
          label="Viagens em andamento"
          value={data.viagens_em_andamento}
        />
        <CartaoDeMetrica
          icon={Radio}
          label="Sensores críticos"
          value={data.sensores_criticos ?? 'Sem dados'}
          status={statusDosSensores(data.sensores_criticos)}
        />
        <CartaoDeMetrica
          icon={Gauge}
          label="Velocidade média"
          value={
            data.velocidade_media === null
              ? 'Sem dados'
              : `${data.velocidade_media.toFixed(0)} km/h`
          }
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Grafico
          titulo="Alertas ativos por severidade"
          barras={barrasDeAlertas(data.alertas_ativos_por_severidade)}
        />
        <Grafico titulo="Trens por status" barras={barrasDeTrens(data.trens_por_status)} />
      </div>
    </>
  )
}

function ViagensAgora({ tremId }: { tremId?: number }) {
  const {
    data: viagens,
    isPending,
    error,
    refetch,
  } = useViagens({ status: 'em_andamento', trem_id: tremId })

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl leading-tight font-semibold">Viagens em andamento</h2>

      {isPending && (
        <div className="grid gap-3">
          {[0, 1, 2].map((indice) => (
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
        <EstadoVazio icone={TrainFront} titulo="Nenhum trem rodando agora." />
      )}

      {viagens && viagens.length > 0 && <ListaDeViagens viagens={viagens} />}
    </section>
  )
}

export default function Dashboard() {
  const { usuario } = useAutenticacao()
  const operacional = usuario?.papel === 'operacional' ? usuario : null
  const semTremVinculado = operacional !== null && operacional.trem_id === null

  return (
    <>
      <CabecalhoDeTela
        title={operacional ? 'Dashboard do seu trem' : 'Dashboard'}
        apoio={operacional ? 'Números do trem vinculado à sua conta.' : undefined}
      />
      <Painel />
      {!semTremVinculado && <ViagensAgora tremId={operacional?.trem_id ?? undefined} />}
    </>
  )
}
