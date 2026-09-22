import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader'
import FormField from '../../components/FormField/FormField'
import Button from '../../components/Button/Button'
import BottomNav from '../../components/BottomNav/BottomNav'

const funcionarios = {
  1: { nome: 'Monique Fodi Wohl', email: 'monique_f_wohl@gmail.com', telefone: '8332668632', foto: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop' },
}

export default function UsuarioEditar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const func = funcionarios[id] || funcionarios[1]

  const [formData, setFormData] = useState({
    nome: func.nome,
    email: func.email,
    senha: '**********',
    telefone: func.telefone,
  })

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(-1)
  }

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

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FormField id="nome" label="Nome" value={formData.nome} onChange={handleChange('nome')} />
          <FormField id="email" label="Email" type="email" value={formData.email} onChange={handleChange('email')} />
          <FormField id="senha" label="Senha" type="password" value={formData.senha} onChange={handleChange('senha')} />
          <FormField id="telefone" label="Telefone" value={formData.telefone} onChange={handleChange('telefone')} />
          <div className="mt-4">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </div>

      <BottomNav />
    </div>
  )
}
