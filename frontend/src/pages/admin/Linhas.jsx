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
    <div className="min-h-screen bg-bg-base pb-28">
      <div className="px-6 pt-8">
        <h1 className="text-2xl font-bold text-texto1 text-center mb-8">Gestão de Rotas</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-componente1 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-texto2 mb-4">Mapa de Rotas</h2>
            <div className="bg-white rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=450&fit=crop"
                alt="Mapa de rotas ferroviárias"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          </div>

          <div className="flex-1 bg-componente1 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-texto2 mb-4">Status das linhas</h2>
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
