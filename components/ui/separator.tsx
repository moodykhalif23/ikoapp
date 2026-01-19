'use client'

import * as React from 'react'
import { Divider, DividerProps } from '@mui/material'
import { styled } from '@mui/material/styles'

interface SeparatorProps extends Omit<DividerProps, 'orientation'> {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}

const StyledDivider = styled(Divider)(({ theme }) => ({
  borderColor: theme.palette.divider,
}))

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <StyledDivider
      orientation={orientation}
      className={className}
      role={decorative ? 'presentation' : 'separator'}
      {...props}
    />
  )
}

export { Separator }
