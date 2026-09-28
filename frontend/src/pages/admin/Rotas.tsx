import { CabecalhoDeTela } from '@/components/ui/cabecalho-de-tela'
import { CartaoDeLinha } from '@/components/ui/cartao-de-linha'
import { ErroDeCarregamento } from '@/components/ui/erro-de-carregamento'
import { Skeleton } from '@/components/ui/skeleton'
import { useLinhas } from '@/hooks/linhas'

const GRADE = 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'

function Lista() {
  const { data: linhas, isPending, error } = useLinhas()

  if (isPending) {
    return (
      <div className={GRADE}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    )
  }
  if (error) return <ErroDeCarregamento error={error} />
  if (linhas.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma rota cadastrada.</p>
  }

  return (
    <ul className={GRADE}>
      {linhas.map((l) => (
        <li key={l.id}>
          <CartaoDeLinha numero={l.numero} status={l.status} ativo={l.ativo} />
        </li>
      ))}
    </ul>
  )
}

export default function Rotas() {
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoDeTela title="Rotas" />
      <Lista />
    </div>
  )
}
