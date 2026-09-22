import * as React from 'react'
import { cn } from '@/lib/utils'

function Progress({ className, ...props }: React.ComponentProps<'progress'>) {
  return (
    <progress
      data-slot="progress"
      max={100}
      className={cn(
        'h-2 w-full appearance-none overflow-hidden rounded-full bg-primary/20 [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-primary [&::-webkit-progress-value]:transition-all',
        className,
      )}
      {...props}
    />
  )
}

export { Progress }
