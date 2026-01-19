'use client'

import * as React from 'react'
import { Checkbox as MuiCheckbox, FormControlLabel, CheckboxProps as MuiCheckboxProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Check } from 'lucide-react'

interface CheckboxProps extends Omit<MuiCheckboxProps, 'icon' | 'checkedIcon' | 'onChange'> {
  label?: string
  onCheckedChange?: (checked: boolean) => void
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

const StyledFormControlLabel = styled(FormControlLabel)({
  margin: 0,
  alignItems: 'flex-start',
  gap: '12px', // Add more space between checkbox and label
  '& .MuiFormControlLabel-label': {
    marginLeft: '8px', // Additional space after the checkbox
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
})

function Checkbox({ label, onCheckedChange, ...props }: CheckboxProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(event.target.checked)
  }

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
      onChange={handleChange}
      {...props}
    />
  )

  if (label) {
    return (
      <StyledFormControlLabel
        control={checkbox}
        label={label}
      />
    )
  }

  return checkbox
}

export { Checkbox }
