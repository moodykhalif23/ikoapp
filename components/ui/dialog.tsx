"use client"

import * as React from "react"
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  IconButton,
  Typography,
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

interface DialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface DialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const StyledDialog = styled(MuiDialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '8px',
    padding: 0,
  },
}))

const StyledDialogContent = styled(MuiDialogContent)(({ theme }) => ({
  padding: '24px',
  '&:first-of-type': {
    paddingTop: '24px',
  },
}))

const DialogContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

function Dialog({ children, open, onOpenChange }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const isOpen = open !== undefined ? open : internalOpen
  
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [open, onOpenChange])

  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({ children, asChild }: DialogTriggerProps) {
  const { setOpen } = React.useContext(DialogContext)
  
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

function DialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DialogOverlay() {
  return null // Material-UI handles overlay automatically
}

function DialogContent({ 
  children, 
  className, 
  maxWidth = 'sm',
  ...props 
}: DialogContentProps) {
  const { open, setOpen } = React.useContext(DialogContext)

  return (
    <StyledDialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth={maxWidth}
      fullWidth
      TransitionComponent={Transition}
      {...props}
    >
      <StyledDialogContent className={className}>
        {children}
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
      </StyledDialogContent>
    </StyledDialog>
  )
}

function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <DialogActions
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <MuiDialogTitle
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function DialogClose({ children, ...props }: { children?: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = React.useContext(DialogContext)
  
  if (children && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => setOpen(false),
      ...children.props,
    })
  }

  return (
    <button onClick={() => setOpen(false)} {...props}>
      {children}
    </button>
  )
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}