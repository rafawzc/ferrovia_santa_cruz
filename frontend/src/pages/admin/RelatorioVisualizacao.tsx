import { Download, FileText, Printer } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErroDeCarregamento } from '@/components/ui/erro-de-carregamento'
import { EstadoVazio } from '@/components/ui/estado-vazio'
import { GraficoDeBarras } from '@/components/ui/grafico-de-barras'
import { RotuloDeDado } from '@/components/ui/rotulo-de-dado'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRelatorio } from '@/hooks/relatorios'
import { useTrens } from '@/hooks/trens'
import { api, type CelulaDeRelatorio, type FiltroRelatorio } from '@/lib/api'
import { opcoesDeTipoDeRelatorio, rotuloDeTipoDeRelatorio } from '@/lib/rotulos'
import { cn, dataBrasileira, formatarNumero } from '@/lib/utils'

const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/

function celula(valor: CelulaDeRelatorio | undefined) {
  if (valor === null || valor === undefined) return '—'
  if (typeof valor === 'number') return formatarNumero(valor)
  return FORMATO_DATA.test(valor) ? dataBrasileira(valor) : valor
}

function lerFiltro(parametros: URLSearchParams): FiltroRelatorio | null {
  const tipo = opcoesDeTipoDeRelatorio.find(({ valor }) => valor === parametros.get('tipo'))?.valor
  const inicio = parametros.get('inicio') ?? ''
  const fim = parametros.get('fim') ?? ''
  const trem = parametros.get('trem_id') ?? ''
  const valido =
    tipo !== undefined &&
    FORMATO_DATA.test(inicio) &&
    FORMATO_DATA.test(fim) &&
    fim >= inicio &&
    /^\d*$/.test(trem)
  if (!valido) return null
  return trem ? { tipo, inicio, fim, trem_id: Number(trem) } : { tipo, inicio, fim }
}

function NovoRelatorio() {
  return (
    <Button variant="outline" asChild className="nao-imprime">
      <Link to="/admin/relatorios">Novo relatório</Link>
    </Button>
  )
}

export default function RelatorioVisualizacao() {
  const [parametros] = useSearchParams()
  const filtro = lerFiltro(parametros)
  const { data: relatorio, isPending, error, refetch } = useRelatorio(filtro)
  const { data: trens } = useTrens()

  if (filtro === null) {
    return (
      <>
        <CabecalhoDeTela title="Relatório" actions={<NovoRelatorio />} />
        <EstadoVazio
          icone={FileText}
          titulo="Sem período definido"
          descricao="Escolha o tipo e o período para gerar o relatório."
        />
      </>
    )
  }

  const prefixo = trens?.find(({ id }) => id === filtro.trem_id)?.prefixo
  const alvo =
    filtro.trem_id === undefined ? 'Todos os trens' : `Trem ${prefixo ?? String(filtro.trem_id)}`
  const titulo = `Relatório de ${rotuloDeTipoDeRelatorio(filtro.tipo)}`
  const periodo = `De ${dataBrasileira(filtro.inicio)} a ${dataBrasileira(filtro.fim)} · ${alvo}`

  if (error) {
    return (
      <>
        <CabecalhoDeTela title={titulo} apoio={periodo} actions={<NovoRelatorio />} />
        <ErroDeCarregamento
          error={error}
          aoTentarDeNovo={() => {
            void refetch()
          }}
        />
      </>
    )
  }

  if (isPending) {
    return (
      <>
        <CabecalhoDeTela title={titulo} apoio={periodo} actions={<NovoRelatorio />} />
        <Card className="gap-3 p-4">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </Card>
      </>
    )
  }

  const { colunas, linhas, grafico } = relatorio

  return (
    <>
      <CabecalhoDeTela
        title={titulo}
        apoio={periodo}
        actions={
          <>
            <Button asChild className="nao-imprime">
              <a href={api.relatorios.enderecoCsv(filtro)} download>
                <Download aria-hidden />
                Exportar CSV
              </a>
            </Button>
            <Button
              variant="outline"
              className="nao-imprime"
              onClick={() => {
                window.print()
              }}
            >
              <Printer aria-hidden />
              Imprimir
            </Button>
            <NovoRelatorio />
          </>
        }
      />

      {linhas.length === 0 ? (
        <EstadoVazio
          icone={FileText}
          titulo="Nenhum dado no período"
          descricao="Não há registros deste tipo no período escolhido."
        />
      ) : (
        <>
          <Card className="hidden overflow-hidden py-0 md:block print:block print:overflow-visible">
            <Table>
              <TableHeader>
                <TableRow>
                  {colunas.map(({ chave, rotulo }, coluna) => (
                    <TableHead
                      key={chave}
                      className={cn('print:whitespace-normal', coluna > 0 && 'text-right')}
                    >
                      {rotulo}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {linhas.map((linha, indice) => (
                  <TableRow key={indice}>
                    {colunas.map(({ chave }, coluna) => (
                      <TableCell
                        key={chave}
                        className={cn('tabular-nums', coluna > 0 && 'text-right')}
                      >
                        {celula(linha[chave])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="flex flex-col gap-4 md:hidden print:hidden">
            {linhas.map((linha, indice) => (
              <Card key={indice} className="p-4">
                <dl className="flex flex-col gap-2">
                  {colunas.map(({ chave, rotulo }) => (
                    <div key={chave} className="flex items-baseline justify-between gap-3">
                      <RotuloDeDado como="dt">{rotulo}</RotuloDeDado>
                      <dd className="text-right font-semibold tabular-nums">
                        {celula(linha[chave])}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Card>
            ))}
          </div>

          <Card className="gap-4 print:break-inside-avoid">
            <CardHeader>
              <CardTitle>
                <h2>{grafico.rotulo}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GraficoDeBarras barras={grafico.itens} formatar={formatarNumero} />
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}
