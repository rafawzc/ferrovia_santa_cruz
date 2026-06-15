import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import FormField from '../../components/FormField/FormField'
import Button from '../../components/Button/Button'
import logo from '../../assets/logo.svg'

export default function RecuperarSenha() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    novaSenha: '',
    confirmarSenha: '',
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.novaSenha) {
      newErrors.novaSenha = 'Nova senha é obrigatória'
    } else if (formData.novaSenha.length < 8) {
      newErrors.novaSenha = 'A senha deve ter no mínimo 8 caracteres'
    }
    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória'
    } else if (formData.novaSenha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-bg-base">
      <div className="lg:w-[45%] flex flex-col bg-bg-base">
        <div className="bg-bg-base px-8 pt-10 pb-14 lg:pb-20 flex justify-center lg:justify-start">
          <img src={logo} alt="Ferrovia Santa Cruz" className="w-52 lg:w-56" />
        </div>
        <div className="flex-1 bg-bg-card rounded-tl-[3rem] rounded-tr-[3rem] lg:rounded-tl-none lg:rounded-bl-[3rem] lg:rounded-tr-[3rem] lg:rounded-br-[3rem] -mt-6 lg:-mt-0 px-8 pt-10 pb-8 lg:px-14 lg:pt-12">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-texto1/60 hover:text-texto1 mb-6 transition-colors">
            <ArrowLeft size={16} />
            Voltar para o login
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-texto1 mb-3">
            Recuperar Senha
          </h1>
          <p className="text-sm text-texto1/60 mb-8">
            Informe seu email e crie uma nova senha para acessar sua conta.
          </p>
          {success && (
            <div className="bg-green-100 border border-green-300 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-700 font-medium">
                Senha redefinida com sucesso! Redirecionando para o login...
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <FormField id="email" label="Email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange('email')} error={errors.email} />
            <FormField id="novaSenha" label="Nova Senha" type="password" placeholder="********" value={formData.novaSenha} onChange={handleChange('novaSenha')} error={errors.novaSenha} helperText="A senha deve ter no mínimo 8 caracteres." />
            <FormField id="confirmarSenha" label="Confirmar Nova Senha" type="password" placeholder="********" value={formData.confirmarSenha} onChange={handleChange('confirmarSenha')} error={errors.confirmarSenha} />
            <div className="mt-2">
              <Button type="submit" disabled={success}>Redefinir Senha</Button>
            </div>
          </form>
          <p className="text-center text-sm text-texto1/60 mt-6">
            Lembrou sua senha?{' '}
            <Link to="/login" className="font-semibold text-componente1 hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:block lg:w-[55%] bg-texto1 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=80" alt="Trem em movimento" className="w-full h-full object-cover opacity-80" />
      </div>
    </div>
  )
}
