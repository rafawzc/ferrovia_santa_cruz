import successImg from './success.png'
import yallowImg from './yallow.png'
import errorImg from './error.png'

export default function WagonIcon({ letter, percentage = 0, onClick, className = '' }) {
  const getStatusImage = () => {
    if (percentage >= 90) return errorImg
    if (percentage >= 70) return yallowImg
    return successImg
  }

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform ${className}`}
    >
      <div className="relative">
        <img src={getStatusImage()} alt={`Vagão ${letter}`} className="w-20 h-auto" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-texto2 text-sm font-bold drop-shadow-lg">
          {letter}
        </span>
      </div>
      <span className="text-texto2 text-xs font-semibold">{percentage}%</span>
    </button>
  )
}
