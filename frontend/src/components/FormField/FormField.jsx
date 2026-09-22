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
        <label
          htmlFor={id}
          className={`text-sm font-medium ${labelDark ? 'text-primary-foreground' : 'text-foreground'}`}
        >
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
          className={`w-full rounded-full bg-input px-5 py-3 text-sm text-foreground placeholder-foreground/60 transition-all duration-200 focus:ring-2 focus:ring-primary/30 ${
            error ? 'ring-2 ring-destructive' : ''
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-foreground/60 transition-colors hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
      {helperText && !error && <span className="text-xs text-foreground/60">{helperText}</span>}
    </div>
  )
}
