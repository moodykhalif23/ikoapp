'use client'

import * as React from 'react'
import { FormLabel, FormLabelProps } from '@mui/material'
import { styled } from '@mui/material/styles'

interface LabelProps extends FormLabelProps {
  className?: string
}

const StyledLabel = styled(FormLabel)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  userSelect: 'none',
  color: theme.palette.text.primary,
  '&.Mui-disabled': {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  '&.Mui-error': {
    color: theme.palette.error.main,
  },
}))

function Label({ className, ...props }: LabelProps) {
  return (
    <StyledLabel className={className} {...props} />
  )
}

export { Label }
