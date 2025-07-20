import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { Input } from "./ui/input"
import { cn } from "@/lib/utils"

interface StepperProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

const Stepper = React.forwardRef<HTMLInputElement, StepperProps>(
  ({ 
    value = 0, 
    onChange, 
    min = 0, 
    max = 100, 
    step = 1, 
    disabled = false, 
    className,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value)

    React.useEffect(() => {
      setInternalValue(value)
    }, [value])

    const handleIncrement = () => {
      const newValue = Math.min(internalValue + step, max)
      setInternalValue(newValue)
      onChange?.(newValue)
    }

    const handleDecrement = () => {
      const newValue = Math.max(internalValue - step, min)
      setInternalValue(newValue)
      onChange?.(newValue)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      
      // Allow empty string for user input
      if (inputValue === '') {
        setInternalValue(0)
        onChange?.(0)
        return
      }

      const numValue = parseFloat(inputValue)
      if (!isNaN(numValue)) {
        const clampedValue = Math.min(Math.max(numValue, min), max)
        setInternalValue(clampedValue)
        onChange?.(clampedValue)
      }
    }

    return (
      <div className={cn("relative flex items-center", className)}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || internalValue <= min}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-l-md border border-r-0 border-input bg-background transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "active:bg-accent/80"
          )}
          aria-label="Decrease value"
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <Input
          ref={ref}
          type="number"
          value={internalValue}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            "rounded-none border-l-0 border-r-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            "focus-visible:z-10"
          )}
          {...props}
        />
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || internalValue >= max}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-r-md border border-l-0 border-input bg-background transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "active:bg-accent/80"
          )}
          aria-label="Increase value"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    )
  }
)

Stepper.displayName = "Stepper"

export { Stepper }
export type { StepperProps } 