"use client"

import * as React from "react"
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Slide,
  SlideProps
} from '@mui/material'
import { Close } from "@mui/icons-material"
import { styled } from '@mui/material/styles'

import { cn } from "@/lib/utils"

const Transition = React.forwardRef(function Transition(
  props: SlideProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

interface ToastProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: 'default' | 'destructive'
  duration?: number
}

interface ToastActionProps {
  children: React.ReactNode
  altText: string
  onClick?: () => void
}

interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> {}
interface ToastDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: '8px',
  '& .MuiAlert-message': {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
}))

const ToastContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

function Toast({ 
  children, 
  open, 
  onOpenChange, 
  variant = 'default',
  duration = 6000 
}: ToastProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const isOpen = open !== undefined ? open : internalOpen
  
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [open, onOpenChange])

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const severity = variant === 'destructive' ? 'error' : 'info'

  return (
    <ToastContext.Provider value={{ open: isOpen, setOpen }}>
      <Snackbar
        open={isOpen}
        autoHideDuration={duration}
        onClose={handleClose}
        TransitionComponent={Transition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <StyledAlert
          onClose={handleClose}
          severity={severity}
          variant="filled"
        >
          {children}
        </StyledAlert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

function ToastAction({ children, altText, onClick }: ToastActionProps) {
  return (
    <IconButton
      size="small"
      aria-label={altText}
      color="inherit"
      onClick={onClick}
    >
      {children}
    </IconButton>
  )
}

function ToastClose() {
  const { setOpen } = React.useContext(ToastContext)
  
  return (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={() => setOpen(false)}
    >
      <Close fontSize="small" />
    </IconButton>
  )
}

function ToastTitle({ className, ...props }: ToastTitleProps) {
  return (
    <AlertTitle
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  )
}

function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return (
    <div
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  )
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function ToastViewport() {
  return null // Material-UI handles viewport automatically
}

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}