import { Fingerprint } from 'lucide-react'

export default function Button({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  icon = false,
  className = '',
}) {
  const base =
    'w-full flex items-center justify-center gap-2 rounded-full font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-componente1 text-texto2 py-3.5 px-6 hover:bg-componente1/90 active:scale-[0.98]',
    secondary:
      'bg-componente4 text-texto1 py-3 px-6 hover:bg-componente3 active:scale-[0.98]',
    outline:
      'bg-transparent border-2 border-componente3 text-texto1 py-3 px-6 hover:bg-componente3/10 active:scale-[0.98]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {icon === true ? <Fingerprint size={20} /> : icon}
      {children}
    </button>
  )
}
