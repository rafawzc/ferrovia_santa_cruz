import { Download, Printer } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { ErroDeCarregamento } from '@/components/ui/erro-de-carregamento'
import { GraficoDeBarras } from '@/components/ui/grafico-de-barras'
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
import { api, type CelulaDeRelatorio, type FiltroRelatorio } from '@/lib/api'

const TIPOS = [
  { valor: 'desempenho', rotulo: 'Desempenho' },
  { valor: 'consumo', rotulo: 'Consumo de energia' },
  { valor: 'eficiencia', rotulo: 'Eficiência operacional' },
  { valor: 'manutencao', rotulo: 'Manutenção' },
] as const

const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/

const dataBr = (iso: string) => iso.split('-').reverse().join('/')

const celula = (valor: CelulaDeRelatorio | undefined) =>
  valor === null || valor === undefined ? '—' : String(valor)

function lerFiltro(parametros: URLSearchParams): FiltroRelatorio | null {
  const tipo = TIPOS.find(({ valor }) => valor === parametros.get('tipo'))?.valor
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

function Voltar() {
  return (
    <Button variant="outline" asChild className="nao-imprime">
      <Link to="/admin/relatorios">Novo relatório</Link>
    </Button>
  )
}

export default function RelatorioVisualizacao() {
  const [parametros] = useSearchParams()
  const filtro = lerFiltro(parametros)
  const { data: relatorio, isPending, error } = useRelatorio(filtro)

  if (filtro === null) {
    return (
      <>
        <CabecalhoDeTela title="Relatório" />
        <div className="flex flex-col items-start gap-4">
          <p className="text-muted-foreground">
            Escolha o tipo e o período para gerar o relatório.
          </p>
          <Voltar />
        </div>
      </>
    )
  }
  if (error) return <ErroDeCarregamento error={error} />
  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  const rotuloDoTipo = TIPOS.find(({ valor }) => valor === relatorio.tipo)?.rotulo ?? relatorio.tipo

  return (
    <>
      <CabecalhoDeTela title={`Relatório de ${rotuloDoTipo}`} />

      <dl className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-card p-4 md:grid-cols-4">
        <div>
          <dt className="text-sm text-muted-foreground">Tipo</dt>
          <dd className="font-semibold">{rotuloDoTipo}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Início</dt>
          <dd className="font-semibold">{dataBr(relatorio.inicio)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Fim</dt>
          <dd className="font-semibold">{dataBr(relatorio.fim)}</dd>
        </div>
        {relatorio.trem_id !== null && (
          <div>
            <dt className="text-sm text-muted-foreground">Trem</dt>
            <dd className="font-semibold">{relatorio.trem_id}</dd>
          </div>
        )}
      </dl>

      {relatorio.linhas.length === 0 ? (
        <p className="mb-6 text-muted-foreground">Nenhum dado no período.</p>
      ) : (
        <>
          <div className="mb-6 hidden overflow-x-auto rounded-xl bg-card p-2 md:block lg:p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {relatorio.colunas.map(({ chave, rotulo }) => (
                    <TableHead key={chave}>{rotulo}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorio.linhas.map((linha, i) => (
                  <TableRow key={i}>
                    {relatorio.colunas.map(({ chave }) => (
                      <TableCell key={chave}>{celula(linha[chave])}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mb-6 flex flex-col gap-3 md:hidden">
            {relatorio.linhas.map((linha, i) => (
              <dl key={i} className="flex flex-col gap-1 rounded-xl bg-card p-4">
                {relatorio.colunas.map(({ chave, rotulo }) => (
                  <div key={chave} className="flex justify-between gap-3">
                    <dt className="text-sm text-muted-foreground">{rotulo}</dt>
                    <dd className="text-right font-medium">{celula(linha[chave])}</dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>
        </>
      )}

      <section className="mb-6 rounded-xl bg-card p-4 lg:p-6">
        <h2 className="mb-4 font-bold">{relatorio.grafico.rotulo}</h2>
        <GraficoDeBarras barras={relatorio.grafico.itens} />
      </section>

      <div className="nao-imprime flex flex-wrap gap-3">
        <Button asChild>
          <a href={api.relatorios.enderecoCsv(filtro)} download>
            <Download />
            Exportar CSV
          </a>
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            window.print()
          }}
        >
          <Printer />
          Imprimir
        </Button>
        <Voltar />
      </div>
    </>
  )
}
