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
      className={`flex cursor-pointer flex-col items-center gap-1 transition-transform hover:scale-105 ${className}`}
    >
      <div className="relative">
        <img
          src={getStatusImage()}
          alt={`Vagão ${letter}`}
          className="h-auto w-20"
          style={{ filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.5))' }}
        />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-foreground drop-shadow-lg">
          {letter}
        </span>
      </div>
      <span className="text-xs font-semibold text-foreground">{percentage}%</span>
    </button>
  )
}
