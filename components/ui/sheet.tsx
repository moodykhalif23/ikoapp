"use client"

import * as React from "react"
import {
  Drawer,
  DrawerProps,
  IconButton,
  Typography,
  Box
} from '@mui/material'
import { Close } from "@mui/icons-material"
import { styled } from '@mui/material/styles'

import { cn } from "@/lib/utils"

interface SheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface SheetTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface SheetContentProps {
  children: React.ReactNode
  className?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    padding: '24px',
    minWidth: '400px',
    maxWidth: '90vw',
  },
}))

const SheetContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

function Sheet({ children, open, onOpenChange }: SheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const isOpen = open !== undefined ? open : internalOpen
  
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [open, onOpenChange])

  return (
    <SheetContext.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

function SheetTrigger({ children, asChild }: SheetTriggerProps) {
  const { setOpen } = React.useContext(SheetContext)
  
  const handleClick = () => {
    setOpen(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      ...(children.props as any),
    })
  }

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  )
}

function SheetPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function SheetOverlay() {
  return null // Material-UI handles overlay automatically
}

function SheetContent({ 
  children, 
  className, 
  side = 'right',
  ...props 
}: SheetContentProps & React.HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = React.useContext(SheetContext)

  return (
    <StyledDrawer
      anchor={side}
      open={open}
      onClose={() => setOpen(false)}
      className={className}
      {...props}
    >
      <Box sx={{ position: 'relative', height: '100%' }}>
        <IconButton
          onClick={() => setOpen(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
        {children}
      </Box>
    </StyledDrawer>
  )
}

function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left mb-6",
        className
      )}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: SheetFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
        className
      )}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <Typography
      variant="h6"
      component="h2"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function SheetClose({ children, ...props }: { children?: React.ReactNode } & React.HTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = React.useContext(SheetContext)
  
  if (children && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => setOpen(false),
      ...(children.props as any),
    })
  }

  return (
    <button onClick={() => setOpen(false)} {...props}>
      {children}
    </button>
  )
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}