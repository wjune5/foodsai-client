"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../Dialog"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface AlertDialogContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextType | null>(null)

const AlertDialog = ({ children, ...props }: React.ComponentProps<typeof Dialog>) => {
  const [open, setOpen] = React.useState(false)

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      <Dialog open={open} onOpenChange={setOpen} {...props}>
        {children}
      </Dialog>
    </AlertDialogContext.Provider>
  )
}

const AlertDialogTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(AlertDialogContext)
  if (!context) {
    throw new Error("AlertDialogTrigger must be used within AlertDialog")
  }

  return (
    <Button
      ref={ref}
      className={className}
      onClick={() => context.setOpen(true)}
      {...props}
    >
      {children}
    </Button>
  )
})
AlertDialogTrigger.displayName = "AlertDialogTrigger"

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent>
>(({ className, ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn("sm:max-w-[425px]", className)}
    {...props}
  />
))
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = React.forwardRef<
  React.ElementRef<typeof DialogHeader>,
  React.ComponentPropsWithoutRef<typeof DialogHeader>
>(({ className, ...props }, ref) => (
  <DialogHeader
    ref={ref}
    className={cn("space-y-2", className)}
    {...props}
  />
))
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogTitle>,
  React.ComponentPropsWithoutRef<typeof DialogTitle>
>(({ className, ...props }, ref) => (
  <DialogTitle
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => {
  const context = React.useContext(AlertDialogContext)
  
  return (
    <Button
      ref={ref}
      className={className}
      onClick={(e) => {
        props.onClick?.(e)
        context?.setOpen(false)
      }}
      {...props}
    />
  )
})
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => {
  const context = React.useContext(AlertDialogContext)
  
  return (
    <Button
      ref={ref}
      variant="outline"
      className={className}
      onClick={(e) => {
        props.onClick?.(e)
        context?.setOpen(false)
      }}
      {...props}
    />
  )
})
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
}
