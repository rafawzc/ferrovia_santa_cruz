import { X } from 'lucide-react'

export default function Modal({ title, onClose, children }) {
  return (
    <div className="bg-componente1 rounded-3xl p-6 w-full max-w-lg mx-auto shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-texto1">{title}</h2>
        <button
          onClick={onClose}
          className="text-texto1 hover:opacity-70 transition-opacity cursor-pointer"
        >
          <X size={24} />
        </button>
      </div>
      {children}
    </div>
  )
}
