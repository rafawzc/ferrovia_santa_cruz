import LineCard from '../../components/LineCard/LineCard'
import BottomNav from '../../components/BottomNav/BottomNav'

const linhas = [
  { id: 1, numero: '1778', status: 'Manutenção', ativo: true },
  { id: 2, numero: '2645', status: 'Atraso', ativo: true },
  { id: 3, numero: '9845', status: 'Fechado', ativo: false },
  { id: 4, numero: '5463', status: 'Na estação', ativo: true },
  { id: 5, numero: '1946', status: 'Já Partiu', ativo: true },
  { id: 6, numero: '1793', status: 'Manutenção', ativo: false },
]

export default function Linhas() {
  return (
    <div className="min-h-screen bg-muted pb-28">
      <div className="px-6 pt-8">
        <h1 className="mb-8 text-center text-2xl font-bold text-foreground">Gestão de Rotas</h1>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 rounded-3xl bg-primary p-6">
            <h2 className="mb-4 text-lg font-bold text-primary-foreground">Mapa de Rotas</h2>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-accent">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=450&fit=crop"
                alt="Mapa de rotas ferroviárias"
                className="h-full w-full object-cover opacity-80"
              />
            </div>
          </div>

          <div className="flex-1 rounded-3xl bg-primary p-6">
            <h2 className="mb-4 text-lg font-bold text-primary-foreground">Status das linhas</h2>
            <div className="grid grid-cols-2 gap-4">
              {linhas.map((l) => (
                <LineCard key={l.id} numero={l.numero} status={l.status} ativo={l.ativo} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
