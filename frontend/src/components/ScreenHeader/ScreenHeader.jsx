import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ScreenHeader({ title, showBack = true, onBack }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <div className="flex items-center gap-4 mb-6">
      {showBack && (
        <button
          onClick={handleBack}
          className="text-texto1 hover:opacity-70 transition-opacity cursor-pointer"
        >
          <ArrowLeft size={28} />
        </button>
      )}
      <h1 className="text-xl lg:text-2xl font-bold text-texto1">{title}</h1>
    </div>
  )
}
