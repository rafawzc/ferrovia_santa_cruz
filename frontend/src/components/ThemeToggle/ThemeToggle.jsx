import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div
      className={`flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 ${
        isDark
          ? 'bg-bg-page border border-componente3'
          : 'bg-componente4 border border-componente3'
      } ${className}`}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && toggleTheme()}
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={`flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 ${
            isDark
              ? 'transform translate-x-0 bg-componente1'
              : 'transform translate-x-8 bg-componente4'
          }`}
        >
          {isDark ? (
            <Moon
              className="w-4 h-4 text-texto1"
              strokeWidth={1.5}
            />
          ) : (
            <Sun
              className="w-4 h-4 text-texto1"
              strokeWidth={1.5}
            />
          )}
        </div>
        <div
          className={`flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 ${
            isDark
              ? 'bg-transparent'
              : 'transform -translate-x-8'
          }`}
        >
          {isDark ? (
            <Sun
              className="w-4 h-4 text-texto1"
              strokeWidth={1.5}
            />
          ) : (
            <Moon
              className="w-4 h-4 text-texto1"
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>
    </div>
  )
}
