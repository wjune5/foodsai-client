import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        // Custom theme variants
        cute: 
          'bg-gradient-to-r from-pink-400 to-pink-600 text-white border-none rounded-full font-semibold shadow-lg hover:shadow-xl hover:from-pink-500 hover:to-pink-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300',
        cuteOutline:
          'border-2 border-pink-400 text-pink-600 bg-transparent rounded-full font-semibold hover:bg-pink-50 hover:border-pink-500 transition-all duration-300',
        glass:
          'bg-white/25 backdrop-blur-md border border-white/30 text-gray-800 rounded-xl font-medium shadow-lg hover:bg-white/35 hover:shadow-xl transition-all duration-300',
        gradient:
          'bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 text-white border-none rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-pink-500 hover:via-purple-600 hover:to-indigo-700 transition-all duration-300',
        success:
          'bg-green-500 text-white border-none rounded-lg font-medium shadow-md hover:bg-green-600 hover:shadow-lg transition-all duration-300',
        warning:
          'bg-yellow-500 text-white border-none rounded-lg font-medium shadow-md hover:bg-yellow-600 hover:shadow-lg transition-all duration-300',
        error:
          'bg-red-500 text-white border-none rounded-lg font-medium shadow-md hover:bg-red-600 hover:shadow-lg transition-all duration-300',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-full gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-12 rounded-md px-6 has-[>svg]:px-4',
        xl: 'h-16 rounded-lg px-6 has-[>svg]:px-4',
        icon: 'size-9',
        // Custom cute sizes
        cute: 'h-10 px-6 py-2 rounded-full text-sm font-semibold',
        cuteLg: 'h-12 px-8 py-3 rounded-full text-base font-semibold',
        cuteXl: 'h-14 px-10 py-4 rounded-full text-lg font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants } 