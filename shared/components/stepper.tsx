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
    "aria-invalid": ariaInvalid,
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

    const isInvalid = ariaInvalid === true || ariaInvalid === "true"

    return (
      <div className={cn("relative", className)}>
        <Input
          ref={ref}
          type="number"
          value={internalValue}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "pr-16 pl-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            "focus-visible:z-10"
          )}
          {...props}
        />
        
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || internalValue <= min}
          className={cn(
            "absolute left-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded bg-background transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "active:bg-accent/80",
            isInvalid && "border-destructive"
          )}
          aria-label="Decrease value"
        >
          <Minus className="h-3 w-3" />
        </button>
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || internalValue >= max}
          className={cn(
            "absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded bg-background transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "active:bg-accent/80",
            isInvalid && "border-destructive"
          )}
          aria-label="Increase value"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    )
  }
)

Stepper.displayName = "Stepper"

export { Stepper }
export type { StepperProps } 