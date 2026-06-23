import { useNavigate } from 'react-router-dom'
import UserCard from '../../components/UserCard/UserCard'
import BottomNav from '../../components/BottomNav/BottomNav'

const funcionarios = [
  { id: 1, nome: 'Anna Rossi', cargo: 'RH', status: 'Ativo', foto: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop' },
  { id: 2, nome: 'Sérgio Santana', cargo: 'Maquinista', status: 'Ativo', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { id: 3, nome: 'Juliana Ribeiro Costa', cargo: 'RH', status: 'Inativo', foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop' },
  { id: 4, nome: 'André Gurgel', cargo: 'Auxiliar de Maquinista', status: 'Ativo', foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' },
  { id: 5, nome: 'Rodrigo Alencar Castro', cargo: 'Maquinista', status: 'Inativo', foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' },
  { id: 6, nome: 'André Gurgel', cargo: 'Agente de Trem', status: 'Ativo', foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
]

export default function UsuariosLista() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg-base pb-28">
      <div className="px-6 pt-8">
        <h1 className="text-2xl font-bold text-texto1 text-center mb-8">Lista de Funcionários</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {funcionarios.map((func) => (
            <UserCard
              key={func.id}
              nome={func.nome}
              cargo={func.cargo}
              status={func.status}
              foto={func.foto}
              onClick={() => navigate(`/admin/funcionarios/${func.id}`)}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
