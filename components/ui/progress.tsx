'use client'

import * as React from 'react'
import { LinearProgress, LinearProgressProps } from '@mui/material'
import { styled } from '@mui/material/styles'

interface ProgressProps extends Omit<LinearProgressProps, 'variant'> {
  value?: number
  className?: string
}

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: '8px',
  borderRadius: '4px',
  backgroundColor: theme.palette.primary.main + '20',
  '& .MuiLinearProgress-bar': {
    borderRadius: '4px',
    backgroundColor: theme.palette.primary.main,
  },
}))

function Progress({ value, className, ...props }: ProgressProps) {
  return (
    <StyledLinearProgress
      variant={value !== undefined ? 'determinate' : 'indeterminate'}
      value={value}
      className={className}
      {...props}
    />
  )
}

export { Progress }
