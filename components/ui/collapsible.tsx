'use client'

import * as React from 'react'
import { Collapse, Box } from '@mui/material'
import { styled } from '@mui/material/styles'

interface CollapsibleProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

interface CollapsibleTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface CollapsibleContentProps {
  children: React.ReactNode
  className?: string
}

const StyledBox = styled(Box)({
  width: '100%',
})

const CollapsibleContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  disabled: boolean
}>({
  open: false,
  setOpen: () => {},
  disabled: false,
})

function Collapsible({ 
  children, 
  open, 
  onOpenChange, 
  disabled = false 
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const isOpen = open !== undefined ? open : internalOpen
  
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (disabled) return
    
    if (open === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }, [open, onOpenChange, disabled])

  return (
    <CollapsibleContext.Provider value={{ 
      open: isOpen, 
      setOpen, 
      disabled 
    }}>
      <StyledBox>
        {children}
      </StyledBox>
    </CollapsibleContext.Provider>
  )
}

function CollapsibleTrigger({ children, asChild }: CollapsibleTriggerProps) {
  const { open, setOpen, disabled } = React.useContext(CollapsibleContext)
  
  const handleClick = () => {
    if (!disabled) {
      setOpen(!open)
    }
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      'aria-expanded': open,
      'aria-disabled': disabled,
      ...children.props,
    })
  }

  return (
    <button 
      onClick={handleClick}
      aria-expanded={open}
      aria-disabled={disabled}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function CollapsibleContent({ 
  children, 
  className,
  ...props 
}: CollapsibleContentProps) {
  const { open } = React.useContext(CollapsibleContext)

  return (
    <Collapse in={open} timeout="auto" unmountOnExit>
      <Box className={className} {...props}>
        {children}
      </Box>
    </Collapse>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }