import * as React from 'react'
import { cn } from '@/lib/utils'
import { Switch as SwitchPrimitive } from 'radix-ui'

function Switch({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default'
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'peer group/switch relative inline-flex shrink-0 items-center rounded-full border-2 border-border-forte transition-[background-color,border-color] duration-150 ease-out outline-none before:absolute before:top-1/2 before:left-0 before:h-11 before:w-full before:-translate-y-1/2 before:content-[""] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-6 data-[size=default]:w-11 data-[size=sm]:h-5 data-[size=sm]:w-9 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block rounded-full ring-0 transition-transform duration-150 ease-out group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-4 data-[state=checked]:bg-primary-foreground group-data-[size=default]/switch:data-[state=checked]:translate-x-5 group-data-[size=sm]/switch:data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-border-forte',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
