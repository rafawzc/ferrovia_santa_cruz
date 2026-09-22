import { useParams } from 'react-router-dom'
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader'
import BottomNav from '../../components/BottomNav/BottomNav'

const funcionarios = {
  1: { nome: 'Anna Rossi', email: 'anna_rossi@gmail.com', telefone: '8332668632', cargo: 'RH', foto: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop' },
  2: { nome: 'Sérgio Santana', email: 'sergio.santana@email.com', telefone: '8399999888', cargo: 'Maquinista', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
  3: { nome: 'Juliana Ribeiro Costa', email: 'juliana.costa@email.com', telefone: '8388888777', cargo: 'RH', foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop' },
  4: { nome: 'André Gurgel', email: 'andre.gurgel@email.com', telefone: '8377777666', cargo: 'Auxiliar de Maquinista', foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop' },
  5: { nome: 'Rodrigo Alencar Castro', email: 'rodrigo.castro@email.com', telefone: '8366666555', cargo: 'Maquinista', foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop' },
  6: { nome: 'André Gurgel', email: 'andre.gurgel2@email.com', telefone: '8355555444', cargo: 'Agente de Trem', foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop' },
}

export default function UsuarioDetalhe() {
  const { id } = useParams()
  const func = funcionarios[id] || funcionarios[1]

  return (
    <div className="min-h-screen bg-bg-base pb-28">
      <div className="px-6 pt-8 max-w-2xl mx-auto">
        <ScreenHeader title="" showBack={true} />

        <div className="flex justify-center mb-6">
          <div className="w-64 h-64 rounded-2xl overflow-hidden bg-componente3">
            <img src={func.foto} alt={func.nome} className="w-full h-full object-cover" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-texto1 text-center mb-8">Informações do funcionário</h2>

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-semibold text-texto1 block mb-1.5">Nome</label>
            <div className="w-full rounded-full bg-input-bg px-5 py-3 text-sm text-texto1">{func.nome}</div>
          </div>
          <div>
            <label className="text-sm font-semibold text-texto1 block mb-1.5">Email</label>
            <div className="w-full rounded-full bg-input-bg px-5 py-3 text-sm text-texto1">{func.email}</div>
          </div>
          <div>
            <label className="text-sm font-semibold text-texto1 block mb-1.5">Telefone</label>
            <div className="w-full rounded-full bg-input-bg px-5 py-3 text-sm text-texto1">{func.telefone}</div>
          </div>
          <div>
            <label className="text-sm font-semibold text-texto1 block mb-1.5">Cargo atual</label>
            <div className="w-full rounded-full bg-input-bg px-5 py-3 text-sm text-texto1">{func.cargo}</div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
