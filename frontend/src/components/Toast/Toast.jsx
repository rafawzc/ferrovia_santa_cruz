import { useEffect, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

export default function Toast({ message, type = 'success', duration = 5000, onClose }) {
  const [progress, setProgress] = useState(100)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const interval = 50
    const step = (interval / duration) * 100
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - step
      })
    }, interval)

    const exitTimer = setTimeout(() => {
      setIsExiting(true)
    }, duration - 300)

    const removeTimer = setTimeout(() => {
      onClose?.()
    }, duration)

    return () => {
      clearInterval(timer)
      clearTimeout(exitTimer)
      clearTimeout(removeTimer)
    }
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle size={20} className="text-success" />,
    error: <XCircle size={20} className="text-error" />,
  }

  const barColors = {
    success: 'bg-success',
    error: 'bg-error',
  }

  return (
    <div
      className={`fixed right-6 bottom-24 z-[100] w-72 overflow-hidden rounded-2xl bg-componente1 text-texto1 shadow-xl transition-all duration-300 ${
        isExiting ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {icons[type]}
        <span className="flex-1 text-sm font-medium">{message}</span>
      </div>
      <div className="h-1 w-full bg-componente3/30">
        <div
          className={`h-full ${barColors[type]} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
