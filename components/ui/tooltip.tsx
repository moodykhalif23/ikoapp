'use client'

import * as React from 'react'
import { Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps } from '@mui/material'
import { styled } from '@mui/material/styles'

interface TooltipProps extends Omit<MuiTooltipProps, 'title'> {
  content?: string
  delayDuration?: number
  sideOffset?: number
}

interface TooltipProviderProps {
  delayDuration?: number
  children: React.ReactNode
}

interface TooltipTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface TooltipContentProps {
  children: React.ReactNode
  className?: string
  sideOffset?: number
}

const StyledTooltip = styled(MuiTooltip)(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.palette.text.primary,
    color: theme.palette.background.paper,
    fontSize: '0.75rem',
    borderRadius: '6px',
    padding: '6px 12px',
    maxWidth: 'fit-content',
  },
  '& .MuiTooltip-arrow': {
    color: theme.palette.text.primary,
  },
}))

function TooltipProvider({ children, delayDuration = 0 }: TooltipProviderProps) {
  return <>{children}</>
}

function Tooltip({ 
  content, 
  delayDuration = 0, 
  children, 
  ...props 
}: TooltipProps) {
  return (
    <StyledTooltip
      title={content || ''}
      enterDelay={delayDuration}
      arrow
      {...props}
    >
      {children}
    </StyledTooltip>
  )
}

function TooltipTrigger({ children, asChild }: TooltipTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return children
  }
  return <span>{children}</span>
}

function TooltipContent({ children, className, sideOffset }: TooltipContentProps) {
  return <>{children}</>
}

export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent }
