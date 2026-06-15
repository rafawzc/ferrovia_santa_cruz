import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../../components/FormField/FormField'
import Button from '../../components/Button/Button'
import Toggle from '../../components/Toggle/Toggle'
import logo from '../../assets/logo.svg'

export default function Cadastro() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  })
  const [errors, setErrors] = useState({})
  const [acceptTerms, setAcceptTerms] = useState(true)
  const [allowLocation, setAllowLocation] = useState(false)

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validate = () => {
    const newErrors = {}
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório'
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória'
    } else if (formData.senha.length < 8) {
      newErrors.senha = 'A senha deve ter no mínimo 8 caracteres'
    }
    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória'
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) navigate('/login')
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
          <h1 className="text-2xl lg:text-3xl font-bold text-texto1 mb-8">
            Crie sua Conta
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <FormField id="nome" label="Nome" type="text" placeholder="Seu nome completo" value={formData.nome} onChange={handleChange('nome')} error={errors.nome} />
            <FormField id="email" label="Email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange('email')} error={errors.email} />
            <FormField id="senha" label="Senha" type="password" placeholder="********" value={formData.senha} onChange={handleChange('senha')} error={errors.senha} helperText="A senha deve ter no mínimo 8 caracteres." />
            <FormField id="confirmarSenha" label="Confirmar Senha" type="password" placeholder="********" value={formData.confirmarSenha} onChange={handleChange('confirmarSenha')} error={errors.confirmarSenha} />
            <div className="flex flex-col gap-3 mt-1">
              <Toggle id="terms" label="Aceito os termos e a política de privacidade." checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
              <Toggle id="location" label="Permitir acesso a localização" checked={allowLocation} onChange={(e) => setAllowLocation(e.target.checked)} />
            </div>
            <div className="mt-2">
              <Button type="submit">Criar</Button>
            </div>
          </form>
          <p className="text-center text-sm text-texto1/60 mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-semibold text-componente1 hover:underline">
              Entrar
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
