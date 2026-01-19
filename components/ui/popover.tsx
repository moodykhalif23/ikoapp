'use client'

import * as React from 'react'
import { Popover as MuiPopover, PopoverProps as MuiPopoverProps } from '@mui/material'
import { styled } from '@mui/material/styles'

interface PopoverProps extends Omit<MuiPopoverProps, 'open'> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface PopoverTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface PopoverContentProps {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

const StyledPopover = styled(MuiPopover)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    border: `1px solid ${theme.palette.divider}`,
    padding: '16px',
    minWidth: '288px',
    maxWidth: 'calc(100vw - 32px)',
  },
}))

const PopoverContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  anchorEl: HTMLElement | null
  setAnchorEl: (el: HTMLElement | null) => void
}>({
  open: false,
  setOpen: () => {},
  anchorEl: null,
  setAnchorEl: () => {},
})

function Popover({ open, onOpenChange, children, ...props }: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
  
  const isOpen = open !== undefined ? open : internalOpen
  
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
    if (!newOpen) {
      setAnchorEl(null)
    }
  }, [open, onOpenChange])

  return (
    <PopoverContext.Provider value={{ open: isOpen, setOpen, anchorEl, setAnchorEl }}>
      {children}
    </PopoverContext.Provider>
  )
}

function PopoverTrigger({ children, asChild }: PopoverTriggerProps) {
  const { setOpen, setAnchorEl } = React.useContext(PopoverContext)
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
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

function PopoverContent({ 
  children, 
  className, 
  align = 'center',
  sideOffset = 4,
  ...props 
}: PopoverContentProps) {
  const { open, setOpen, anchorEl } = React.useContext(PopoverContext)

  const getAnchorOrigin = () => {
    switch (align) {
      case 'start':
        return { vertical: 'bottom' as const, horizontal: 'left' as const }
      case 'end':
        return { vertical: 'bottom' as const, horizontal: 'right' as const }
      default:
        return { vertical: 'bottom' as const, horizontal: 'center' as const }
    }
  }

  const getTransformOrigin = () => {
    switch (align) {
      case 'start':
        return { vertical: 'top' as const, horizontal: 'left' as const }
      case 'end':
        return { vertical: 'top' as const, horizontal: 'right' as const }
      default:
        return { vertical: 'top' as const, horizontal: 'center' as const }
    }
  }

  return (
    <StyledPopover
      open={open}
      anchorEl={anchorEl}
      onClose={() => setOpen(false)}
      anchorOrigin={getAnchorOrigin()}
      transformOrigin={getTransformOrigin()}
      className={className}
      {...props}
    >
      {children}
    </StyledPopover>
  )
}

function PopoverAnchor({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
