'use client'

import * as React from 'react'
import { 
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions,
  IconButton,
  DialogProps as MuiDialogProps
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { X } from 'lucide-react'

interface DialogProps extends Omit<MuiDialogProps, 'open'> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface DialogContentProps {
  children: React.ReactNode
  showCloseButton?: boolean
  className?: string
}

const StyledDialog = styled(MuiDialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '8px',
    padding: '24px',
    minWidth: '400px',
    maxWidth: 'calc(100vw - 32px)',
    margin: '16px',
  },
}))

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: '16px',
  top: '16px',
  color: theme.palette.grey[500],
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

function Dialog({ open, onOpenChange, children, ...props }: DialogProps) {
  return (
    <StyledDialog
      open={open || false}
      onClose={() => onOpenChange?.(false)}
      {...props}
    >
      {children}
    </StyledDialog>
  )
}

function DialogTrigger({ children, ...props }: { children: React.ReactNode }) {
  return <div {...props}>{children}</div>
}

function DialogContent({ 
  children, 
  showCloseButton = true, 
  className,
  ...props 
}: DialogContentProps) {
  return (
    <>
      <MuiDialogContent sx={{ padding: 0, position: 'relative' }} {...props}>
        {showCloseButton && (
          <CloseButton size="small">
            <X size={16} />
          </CloseButton>
        )}
        {children}
      </MuiDialogContent>
    </>
  )
}

function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogTitle sx={{ padding: 0, marginBottom: '16px', fontSize: '1.125rem', fontWeight: 600 }}>
      {children}
    </DialogTitle>
  )
}

function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '16px' }}>
      {children}
    </div>
  )
}

function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogActions sx={{ padding: 0, marginTop: '24px', gap: '8px' }}>
      {children}
    </DialogActions>
  )
}

function DialogClose({ children, ...props }: { children: React.ReactNode }) {
  return <div {...props}>{children}</div>
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
}
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
