export default function WagonIcon({ letter, percentage = 0, onClick, className = '' }) {
  const getStatusColor = () => {
    if (percentage >= 90) return 'bg-error'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-success'
  }

  const getRoofColor = () => {
    if (percentage >= 90) return 'bg-error/80'
    if (percentage >= 70) return 'bg-yellow-500/80'
    return 'bg-success/80'
  }

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform ${className}`}
    >
      <div className="relative">
        <div className={`w-16 h-10 ${getRoofColor()} rounded-t-lg flex items-center justify-center`}>
          <span className="text-texto2 text-xs font-bold">{letter}</span>
        </div>
        <div className={`w-16 h-8 ${getStatusColor()} rounded-b-lg flex items-center justify-center`}>
          <span className="text-texto2 text-[10px] font-semibold">{percentage}%</span>
        </div>
        <div className="flex justify-center gap-3 -mt-1">
          <div className="w-4 h-4 rounded-full bg-texto1 border-2 border-texto2" />
          <div className="w-4 h-4 rounded-full bg-texto1 border-2 border-texto2" />
        </div>
      </div>
    </button>
  )
}
