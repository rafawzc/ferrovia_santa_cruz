import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div
      className={`flex h-8 w-16 cursor-pointer rounded-full p-1 transition-all duration-300 ${
        isDark ? 'border border-secondary bg-background' : 'border border-secondary bg-accent'
      } ${className}`}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && toggleTheme()}
    >
      <div className="flex w-full items-center justify-between">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300 ${
            isDark ? 'translate-x-0 transform bg-primary' : 'translate-x-8 transform bg-accent'
          }`}
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
          ) : (
            <Sun className="h-4 w-4 text-foreground" strokeWidth={1.5} />
          )}
        </div>
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300 ${
            isDark ? 'bg-transparent' : '-translate-x-8 transform'
          }`}
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-foreground" strokeWidth={1.5} />
          ) : (
            <Moon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  )
}
