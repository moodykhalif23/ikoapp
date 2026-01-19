'use client'

import * as React from 'react'
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  DialogProps
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { Button } from '@/components/ui/button'

interface AlertDialogProps extends Omit<DialogProps, 'open'> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface AlertDialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogActionProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

interface AlertDialogCancelProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '8px',
    padding: '24px',
    minWidth: '400px',
    maxWidth: 'calc(100vw - 32px)',
    margin: '16px',
  },
}))

const AlertDialogContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

function AlertDialog({ open, onOpenChange, children, ...props }: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const isOpen = open !== undefined ? open : internalOpen
  
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [open, onOpenChange])

  return (
    <AlertDialogContext.Provider value={{ open: isOpen, setOpen }}>
      <StyledDialog
        open={isOpen}
        onClose={() => setOpen(false)}
        {...props}
      >
        {children}
      </StyledDialog>
    </AlertDialogContext.Provider>
  )
}

function AlertDialogTrigger({ children, asChild }: AlertDialogTriggerProps) {
  const { setOpen } = React.useContext(AlertDialogContext)
  
  const handleClick = () => {
    setOpen(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      ...children.props,
    })
  }

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  )
}

function AlertDialogContent({ children, className }: AlertDialogContentProps) {
  return (
    <DialogContent sx={{ padding: 0 }} className={className}>
      {children}
    </DialogContent>
  )
}

function AlertDialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{ marginBottom: '16px' }}>
      {children}
    </div>
  )
}

function AlertDialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogTitle sx={{ padding: 0, fontSize: '1.125rem', fontWeight: 600 }}>
      {children}
    </DialogTitle>
  )
}

function AlertDialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem', margin: 0 }}>
      {children}
    </DialogContentText>
  )
}

function AlertDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogActions sx={{ padding: 0, marginTop: '24px', gap: '8px', flexDirection: 'row-reverse' }}>
      {children}
    </DialogActions>
  )
}

function AlertDialogAction({ children, onClick, className }: AlertDialogActionProps) {
  const { setOpen } = React.useContext(AlertDialogContext)
  
  const handleClick = () => {
    onClick?.()
    setOpen(false)
  }

  return (
    <Button onClick={handleClick} className={className}>
      {children}
    </Button>
  )
}

function AlertDialogCancel({ children, onClick, className }: AlertDialogCancelProps) {
  const { setOpen } = React.useContext(AlertDialogContext)
  
  const handleClick = () => {
    onClick?.()
    setOpen(false)
  }

  return (
    <Button variant="outline" onClick={handleClick} className={className}>
      {children}
    </Button>
  )
}

function AlertDialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function AlertDialogOverlay({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
