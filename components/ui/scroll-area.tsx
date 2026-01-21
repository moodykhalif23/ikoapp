'use client'

import * as React from 'react'
import { Box, BoxProps } from '@mui/material'
import { styled } from '@mui/material/styles'

import { cn } from '@/lib/utils'

interface ScrollAreaProps extends BoxProps {
  children: React.ReactNode
  className?: string
}

interface ScrollBarProps {
  className?: string
  orientation?: 'vertical' | 'horizontal'
}

const StyledScrollArea = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    '& .scroll-bar': {
      opacity: 1,
    },
  },
}))

const StyledScrollContent = styled(Box)(({ theme }) => ({
  height: '100%',
  width: '100%',
  overflow: 'auto',
  borderRadius: 'inherit',
  '&:focus-visible': {
    outline: 'none',
    boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
  },
  // Custom scrollbar styles
  '&::-webkit-scrollbar': {
    width: '10px',
    height: '10px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.divider,
    borderRadius: '5px',
    '&:hover': {
      background: theme.palette.action.hover,
    },
  },
  '&::-webkit-scrollbar-corner': {
    background: 'transparent',
  },
  // Firefox scrollbar
  scrollbarWidth: 'thin',
  scrollbarColor: `${theme.palette.divider} transparent`,
}))

function ScrollArea({
  className,
  children,
  ...props
}: ScrollAreaProps) {
  return (
    <StyledScrollArea
      className={cn('relative', className)}
      {...props}
    >
      <StyledScrollContent>
        {children}
      </StyledScrollContent>
    </StyledScrollArea>
  )
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: ScrollBarProps) {
  // Material-UI handles scrollbars automatically through CSS
  // This component is kept for API compatibility but doesn't render anything
  return null
}

export { ScrollArea, ScrollBar }