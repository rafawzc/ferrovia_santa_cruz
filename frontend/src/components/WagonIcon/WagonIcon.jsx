import successSvg from './success.svg'
import yellowSvg from './yellow.svg'
import errorSvg from './error.svg'

export default function WagonIcon({ letter, percentage = 0, onClick, className = '' }) {
  const getStatusImage = () => {
    if (percentage >= 90) return errorSvg
    if (percentage >= 70) return yellowSvg
    return successSvg
  }

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform ${className}`}
    >
      <div className="relative">
        <img
          src={getStatusImage()}
          alt={`Vagão ${letter}`}
          className="w-20 h-auto"
          style={{ filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.5))' }}
        />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-texto2 text-sm font-bold drop-shadow-lg">
          {letter}
        </span>
      </div>
      <span className="text-texto2 text-xs font-semibold">{percentage}%</span>
    </button>
  )
}
