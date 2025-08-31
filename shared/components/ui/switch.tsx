"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & {
    showCheckIcon?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
  }
>(({ className, checked, showCheckIcon = false, icon: IconComponent = Check, ...props }, ref) => (
  <SwitchPrimitive.Root
    data-slot="switch"
    className={cn(
      "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    checked={checked}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className={cn(
        "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
        showCheckIcon && "flex items-center justify-center"
      )}
    >
      {showCheckIcon && (
        <IconComponent 
          className={cn(
            "h-2.5 w-2.5 text-primary transition-opacity duration-200",
            checked ? "opacity-100" : "opacity-0"
          )} 
        />
      )}
    </SwitchPrimitive.Thumb>
  </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
