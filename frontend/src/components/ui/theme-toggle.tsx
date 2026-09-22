import { Moon, Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme()
  return (
    <div className={cn('flex items-center gap-2 text-foreground', className)}>
      <Sun className="size-4" aria-hidden />
      <Switch checked={isDark} onCheckedChange={toggleTheme} aria-label="Tema escuro" />
      <Moon className="size-4" aria-hidden />
    </div>
  )
}
