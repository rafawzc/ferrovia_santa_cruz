import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../../components/FormField/FormField'
import Button from '../../components/Button/Button'
import Toggle from '../../components/Toggle/Toggle'
import logo from '../../assets/logo.svg'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  })
  const [errors, setErrors] = useState({})
  const [acceptTerms, setAcceptTerms] = useState(true)
  const [allowLocation, setAllowLocation] = useState(false)

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      navigate('/admin')
    }
  }

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted lg:flex-row">
      <div className="flex flex-col bg-muted lg:w-[45%]">
        <div className="flex justify-center bg-muted px-8 pt-10 pb-14 lg:justify-start lg:pb-20">
          <img src={logo} alt="Ferrovia Santa Cruz" className="w-52 lg:w-56" />
        </div>
        <div className="-mt-6 flex-1 rounded-tl-[3rem] rounded-tr-[3rem] bg-card px-8 pt-10 pb-8 lg:-mt-0 lg:rounded-tl-none lg:rounded-tr-[3rem] lg:rounded-br-[3rem] lg:rounded-bl-[3rem] lg:px-14 lg:pt-12">
          <h1 className="mb-8 text-2xl font-bold text-foreground lg:text-3xl">Entrar na Conta</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange('email')}
              error={errors.email}
            />
            <FormField
              id="senha"
              label="Senha"
              type="password"
              placeholder="********"
              value={formData.senha}
              onChange={handleChange('senha')}
              error={errors.senha}
            />
            <Link
              to="/recuperar-senha"
              className="-mt-1 self-start text-xs font-medium text-foreground hover:underline"
            >
              Esqueceu sua senha?
            </Link>
            <div className="mt-1 flex flex-col gap-3">
              <Toggle
                id="terms"
                label="Aceito os termos e a política de privacidade."
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <Toggle
                id="location"
                label="Permitir acesso a localização"
                checked={allowLocation}
                onChange={(e) => setAllowLocation(e.target.checked)}
              />
            </div>
            <div className="mt-2">
              <Button type="submit">Entrar</Button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-foreground/70">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="font-semibold text-primary hover:underline">
              Criar Conta
            </Link>
          </p>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-primary lg:block lg:w-[55%]">
        <img
          src="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=80"
          alt="Trem em movimento"
          className="h-full w-full object-cover opacity-80"
        />
      </div>
    </div>
  )
}
