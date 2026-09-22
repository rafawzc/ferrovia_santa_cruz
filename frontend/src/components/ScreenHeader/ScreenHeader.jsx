import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ScreenHeader({ title, showBack = true, onBack }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <div className="mb-6 flex items-center gap-4">
      {showBack && (
        <button
          onClick={handleBack}
          className="cursor-pointer text-text transition-opacity hover:opacity-70"
        >
          <ArrowLeft size={28} />
        </button>
      )}
      <h1 className="text-xl font-bold text-text lg:text-2xl">{title}</h1>
    </div>
  )
}
