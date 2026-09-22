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
    primary: 'bg-primary text-foreground py-3.5 px-6 hover:bg-primary/90 active:scale-[0.98]',
    secondary: 'bg-accent text-foreground py-3 px-6 hover:bg-secondary active:scale-[0.98]',
    outline:
      'bg-transparent border-2 border-secondary text-foreground py-3 px-6 hover:bg-secondary/10 active:scale-[0.98]',
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
