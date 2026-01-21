'use client'

import * as React from 'react'
import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'

interface AspectRatioProps {
  ratio?: number
  children: React.ReactNode
  className?: string
}

const StyledBox = styled(Box)<{ aspectRatio: number }>(({ aspectRatio }) => ({
  position: 'relative',
  width: '100%',
  paddingBottom: `${(1 / aspectRatio) * 100}%`,
  '& > *': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}))

function AspectRatio({ 
  ratio = 1, 
  children, 
  className,
  ...props 
}: AspectRatioProps) {
  return (
    <StyledBox
      aspectRatio={ratio}
      data-slot="aspect-ratio"
      className={className}
      {...props}
    >
      {children}
    </StyledBox>
  )
}

export { AspectRatio }