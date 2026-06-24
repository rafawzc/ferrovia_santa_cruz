import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader'
import FormField from '../../components/FormField/FormField'
import Button from '../../components/Button/Button'
import BottomNav from '../../components/BottomNav/BottomNav'

export default function CargaCadastro() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    tipo: '',
    peso: '',
    partida: '',
    destino: '',
    vagoes: '',
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
        <div className="bg-componente1 rounded-3xl p-6 lg:p-8">
          <ScreenHeader title="Cadastro de carga" showBack={true} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField id="tipo" label="Tipo de carga:" placeholder="" value={formData.tipo} onChange={handleChange('tipo')} />
            <FormField id="peso" label="Peso:" placeholder="" value={formData.peso} onChange={handleChange('peso')} />
            <FormField id="partida" label="Local de partida:" placeholder="" value={formData.partida} onChange={handleChange('partida')} />
            <FormField id="destino" label="Destino:" placeholder="" value={formData.destino} onChange={handleChange('destino')} />
            <FormField id="vagoes" label="Vagão:" placeholder="" value={formData.vagoes} onChange={handleChange('vagoes')} />

            <div className="flex justify-center mt-4">
              <Button type="submit" variant="secondary" className="w-auto px-12">Cadastrar</Button>
            </div>
          </form>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
