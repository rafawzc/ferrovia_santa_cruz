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
  hideLabel = false,
  labelDark = false,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      {!hideLabel && (
        <label htmlFor={id} className={`text-sm font-medium ${labelDark ? 'text-texto2' : 'text-texto1'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder || label}
          value={value}
          onChange={onChange}
          className={`w-full rounded-full bg-white/60 px-5 py-3 text-sm text-texto1 placeholder-texto1/40 transition-all duration-200 focus:ring-2 focus:ring-componente1/30 ${
            error ? 'ring-2 ring-error' : ''
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-texto1/40 hover:text-texto1 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-error">{error}</span>}
      {helperText && !error && (
        <span className="text-xs text-texto1/50">{helperText}</span>
      )}
    </div>
  )
}
