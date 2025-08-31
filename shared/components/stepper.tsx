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
  precision?: number
  formatValue?: (value: number) => string
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
    precision = 0,
    formatValue,
    "aria-invalid": ariaInvalid,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value)
    const [displayValue, setDisplayValue] = React.useState(formatValue ? formatValue(value) : value.toFixed(precision))

    React.useEffect(() => {
      setInternalValue(value)
      setDisplayValue(formatValue ? formatValue(value) : value.toFixed(precision))
    }, [value, formatValue, precision])

    const handleIncrement = () => {
      const newValue = Math.min(Number((internalValue + step).toFixed(precision)), max)
      setInternalValue(newValue)
      setDisplayValue(formatValue ? formatValue(newValue) : newValue.toFixed(precision))
      onChange?.(newValue)
    }

    const handleDecrement = () => {
      const newValue = Math.max(Number((internalValue - step).toFixed(precision)), min)
      setInternalValue(newValue)
      setDisplayValue(formatValue ? formatValue(newValue) : newValue.toFixed(precision))
      onChange?.(newValue)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      setDisplayValue(inputValue)
      
      // Allow empty string for user input
      if (inputValue === '') {
        setInternalValue(0)
        onChange?.(0)
        return
      }

      // Allow decimal input even if it's not a complete number yet
      if (inputValue.endsWith('.') || inputValue.includes('.')) {
        const numValue = parseFloat(inputValue)
        if (!isNaN(numValue)) {
          const clampedValue = Math.min(Math.max(numValue, min), max)
          const roundedValue = Number(clampedValue.toFixed(precision))
          setInternalValue(roundedValue)
          onChange?.(roundedValue)
        }
        return
      }

      const numValue = parseFloat(inputValue)
      if (!isNaN(numValue)) {
        const clampedValue = Math.min(Math.max(numValue, min), max)
        const roundedValue = Number(clampedValue.toFixed(precision))
        setInternalValue(roundedValue)
        onChange?.(roundedValue)
      }
    }

    const handleInputBlur = () => {
      // Format the display value when user finishes editing
      setDisplayValue(formatValue ? formatValue(internalValue) : internalValue.toFixed(precision))
    }

    const isInvalid = ariaInvalid === true || ariaInvalid === "true"

    return (
      <div className={cn("relative", className)} key={`stepper-${precision}`}>
        <Input
          ref={ref}
          type="number"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          min={min}
          max={max}
          step={precision > 0 ? Math.pow(10, -precision) : step}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          inputMode="decimal"
          className={cn(
            "text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
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