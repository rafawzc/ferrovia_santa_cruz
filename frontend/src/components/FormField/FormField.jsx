import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function FormField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  id,
  onDark = false,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  // Cor do texto que fica SOBRE o container (label/helper). O input é uma pílula
  // clara autossuficiente, legível em qualquer fundo. onDark = container escuro (bg-primary).
  const labelColor = onDark ? 'text-on-primary' : 'text-text'
  const helperColor = onDark ? 'text-on-primary/70' : 'text-text-muted'

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={`text-sm font-medium ${labelColor}`}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full rounded-full bg-field px-5 py-3 text-sm text-text placeholder-text-muted transition-all duration-200 focus:ring-2 focus:ring-primary/30 ${
            error ? 'ring-2 ring-error' : ''
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-error">{error}</span>}
      {helperText && !error && (
        <span className={`text-xs ${helperColor}`}>{helperText}</span>
      )}
    </div>
  )
}
