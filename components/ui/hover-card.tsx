'use client'

import * as React from 'react'
import { Popover, Paper } from '@mui/material'
import { styled } from '@mui/material/styles'

import { cn } from '@/lib/utils'

interface HoverCardProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  openDelay?: number
  closeDelay?: number
}

interface HoverCardTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface HoverCardContentProps {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '8px',
  padding: '16px',
  maxWidth: '256px',
  boxShadow: theme.shadows[8],
  border: `1px solid ${theme.palette.divider}`,
}))

const HoverCardContext = React.createContext<{
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

function HoverCard({ 
  children, 
  open, 
  onOpenChange, 
  openDelay = 700,
  closeDelay = 300 
}: HoverCardProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
  const openTimeoutRef = React.useRef<NodeJS.Timeout>()
  const closeTimeoutRef = React.useRef<NodeJS.Timeout>()
  
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

  React.useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current)
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  return (
    <HoverCardContext.Provider value={{ 
      open: isOpen, 
      setOpen, 
      anchorEl, 
      setAnchorEl 
    }}>
      {children}
    </HoverCardContext.Provider>
  )
}

function HoverCardTrigger({ children, asChild }: HoverCardTriggerProps) {
  const { setOpen, setAnchorEl } = React.useContext(HoverCardContext)
  const openTimeoutRef = React.useRef<NodeJS.Timeout>()
  const closeTimeoutRef = React.useRef<NodeJS.Timeout>()
  
  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    
    setAnchorEl(event.currentTarget)
    openTimeoutRef.current = setTimeout(() => {
      setOpen(true)
    }, 700)
  }

  const handleMouseLeave = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
    }
    
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 300)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      ...children.props,
    })
  }

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

function HoverCardContent({ 
  children, 
  className, 
  align = 'center',
  sideOffset = 4,
  ...props 
}: HoverCardContentProps) {
  const { open, setOpen, anchorEl } = React.useContext(HoverCardContext)

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

  const handleMouseEnter = () => {
    // Keep the hover card open when hovering over the content
    setOpen(true)
  }

  const handleMouseLeave = () => {
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => setOpen(false)}
      anchorOrigin={getAnchorOrigin()}
      transformOrigin={getTransformOrigin()}
      disableRestoreFocus
      sx={{
        pointerEvents: 'none',
        '& .MuiPopover-paper': {
          pointerEvents: 'auto',
        },
      }}
      {...props}
    >
      <StyledPaper
        className={cn(
          'z-50 w-64 rounded-md border p-4 shadow-md outline-none',
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </StyledPaper>
    </Popover>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }