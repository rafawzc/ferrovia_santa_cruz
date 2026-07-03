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
      className={`fixed bottom-24 right-6 z-[100] w-72 rounded-2xl bg-componente1 text-texto1 shadow-xl overflow-hidden transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {icons[type]}
        <span className="text-sm font-medium flex-1">{message}</span>
      </div>
      <div className="h-1 bg-componente3/30 w-full">
        <div
          className={`h-full ${barColors[type]} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
