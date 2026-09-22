import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import ScreenHeader from '../components/ScreenHeader/ScreenHeader'
import FormField from '../components/FormField/FormField'
import Button from '../components/Button/Button'
import BottomNav from '../components/BottomNav/BottomNav'

export default function Perfil() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nome: 'Monique Fodi Wohl',
    email: 'monique_f_wohl@gmail.com',
    senha: '**********',
    telefone: '8332668632',
  })

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
  }

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg-base pb-28">
      <div className="mx-auto max-w-2xl px-6 pt-8">
        <ScreenHeader title="" showBack={true} />

        <div className="mb-6 flex justify-center">
          <div className="h-64 w-64 overflow-hidden rounded-2xl bg-componente3">
            <img
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop"
              alt="Foto de perfil"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <h2 className="mb-8 text-center text-xl font-bold text-texto1">Informações do Cliente</h2>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <FormField id="nome" label="Nome" value={formData.nome} onChange={handleChange('nome')} />
          <FormField
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
          />
          <FormField
            id="senha"
            label="Senha"
            type="password"
            value={formData.senha}
            onChange={handleChange('senha')}
          />
          <FormField
            id="telefone"
            label="Telefone"
            value={formData.telefone}
            onChange={handleChange('telefone')}
          />

          <div className="mt-4">
            <Button type="submit">Salvar</Button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-red-400 px-6 py-3 text-sm font-semibold text-red-500 transition-all duration-200 hover:bg-red-50 active:scale-[0.98]"
          >
            <LogOut size={18} />
            Sair da Conta
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  )
}
