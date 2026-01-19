'use client'

import * as React from 'react'
import { Checkbox as MuiCheckbox, FormControlLabel, CheckboxProps as MuiCheckboxProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Check } from 'lucide-react'

interface CheckboxProps extends Omit<MuiCheckboxProps, 'icon' | 'checkedIcon'> {
  label?: string
}

const StyledCheckbox = styled(MuiCheckbox)(({ theme }) => ({
  padding: 0,
  width: '16px',
  height: '16px',
  borderRadius: '4px',
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
  '&.Mui-focusVisible': {
    outline: `3px solid ${theme.palette.primary.main}20`,
  },
  '& .MuiSvgIcon-root': {
    fontSize: '16px',
  },
}))

const CheckIcon = styled(Check)(({ theme }) => ({
  width: '14px',
  height: '14px',
  color: theme.palette.primary.contrastText,
}))

function Checkbox({ label, ...props }: CheckboxProps) {
  const checkbox = (
    <StyledCheckbox
      icon={<div style={{ 
        width: 16, 
        height: 16, 
        border: '1px solid #d1d5db', 
        borderRadius: '4px',
        backgroundColor: 'transparent'
      }} />}
      checkedIcon={<div style={{ 
        width: 16, 
        height: 16, 
        backgroundColor: 'currentColor', 
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CheckIcon />
      </div>}
      {...props}
    />
  )

  if (label) {
    return (
      <FormControlLabel
        control={checkbox}
        label={label}
        sx={{ margin: 0, alignItems: 'flex-start' }}
      />
    )
  }

  return checkbox
}

export { Checkbox }
