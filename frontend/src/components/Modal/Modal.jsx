import { X } from 'lucide-react'

export default function Modal({ title, onClose, children }) {
  return (
    <div className="mx-auto w-full max-w-lg rounded-3xl bg-primary p-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-primary">{title}</h2>
        <button
          onClick={onClose}
          className="cursor-pointer text-on-primary transition-opacity hover:opacity-70"
        >
          <X size={24} />
        </button>
      </div>
      {children}
    </div>
  )
}
