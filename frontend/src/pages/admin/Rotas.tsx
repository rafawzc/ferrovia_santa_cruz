import { LineCard } from '@/components/ui/line-card'
import { LoadError } from '@/components/ui/load-error'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useLinhas } from '@/hooks/linhas'

const GRADE = 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'

export default function Rotas() {
  const { data: linhas, isPending, error } = useLinhas()
  return (
    <div className="flex flex-col gap-6">
      <ScreenHeader title="Rotas" />
      {isPending ? (
        <div className={GRADE}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <LoadError error={error} />
      ) : linhas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma rota cadastrada.</p>
      ) : (
        <ul className={GRADE}>
          {linhas.map((l) => (
            <li key={l.id}>
              <LineCard numero={l.numero} status={l.status} ativo={l.ativo} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
