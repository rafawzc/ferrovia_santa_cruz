import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import UserCard from '../../components/UserCard/UserCard'
import FuncionarioModal from '../../components/FuncionarioModal/FuncionarioModal'
import Button from '../../components/Button/Button'
import BottomNav from '../../components/BottomNav/BottomNav'
import { useAuth } from '../../contexts/AuthContext'

const funcionariosIniciais = [
  { id: 1, nome: 'Anna Rossi', email: 'anna_rossi@gmail.com', telefone: '8332668632', cargo: 'RH', status: 'Ativo', foto: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop' },
  { id: 2, nome: 'Sérgio Santana', email: 'sergio.santana@email.com', telefone: '8399999888', cargo: 'Maquinista', status: 'Ativo', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { id: 3, nome: 'Juliana Ribeiro Costa', email: 'juliana.costa@email.com', telefone: '8388888777', cargo: 'RH', status: 'Inativo', foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop' },
  { id: 4, nome: 'André Gurgel', email: 'andre.gurgel@email.com', telefone: '8377777666', cargo: 'Auxiliar de Maquinista', status: 'Ativo', foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop' },
  { id: 5, nome: 'Rodrigo Alencar Castro', email: 'rodrigo.castro@email.com', telefone: '8366666555', cargo: 'Maquinista', status: 'Inativo', foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' },
  { id: 6, nome: 'André Gurgel', email: 'andre.gurgel2@email.com', telefone: '8355555444', cargo: 'Agente de Trem', status: 'Ativo', foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
]

export default function UsuariosLista() {
  const { isGestao } = useAuth()
  const [funcionarios, setFuncionarios] = useState(funcionariosIniciais)
  const [selectedFuncionario, setSelectedFuncionario] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isCreateMode, setIsCreateMode] = useState(false)

  const handleCardClick = (func) => {
    if (isGestao) {
      setSelectedFuncionario(func)
      setIsCreateMode(false)
      setShowModal(true)
    }
  }

  const handleCreateClick = () => {
    setSelectedFuncionario(null)
    setIsCreateMode(true)
    setShowModal(true)
  }

  const handleSave = (funcionarioData) => {
    if (isCreateMode) {
      setFuncionarios((prev) => [...prev, funcionarioData])
    } else {
      setFuncionarios((prev) =>
        prev.map((f) => (f.id === funcionarioData.id ? funcionarioData : f))
      )
    }
  }

  return (
    <div className="min-h-screen bg-bg-page pb-28">
      <div className="px-4 pt-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-texto1">Funcionários</h1>
          {isGestao && (
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-1.5 bg-componente1 text-texto2 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-componente1/90 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Cadastrar
            </button>
          )}
        </div>

        <div className="bg-componente4 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-texto1" />
            <h2 className="text-base font-bold text-texto1">Lista</h2>
          </div>

          <div className="flex flex-col gap-2">
            {funcionarios.map((func) => (
              <UserCard
                key={func.id}
                nome={func.nome}
                cargo={func.cargo}
                status={func.status}
                foto={func.foto}
                onClick={() => handleCardClick(func)}
              />
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <FuncionarioModal
          funcionario={selectedFuncionario}
          isCreate={isCreateMode}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      <BottomNav />
    </div>
  )
}
