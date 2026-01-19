'use client'

import * as React from 'react'
import { 
  RadioGroup as MuiRadioGroup,
  FormControlLabel,
  Radio,
  RadioGroupProps as MuiRadioGroupProps
} from '@mui/material'
import { styled } from '@mui/material/styles'

interface RadioGroupProps extends Omit<MuiRadioGroupProps, 'onChange'> {
  onValueChange?: (value: string) => void
  className?: string
}

interface RadioGroupItemProps {
  value: string
  id?: string
  disabled?: boolean
  className?: string
  children?: React.ReactNode
  label?: string
}

const StyledRadioGroup = styled(MuiRadioGroup)({
  display: 'grid',
  gap: '12px',
})

const StyledRadio = styled(Radio)(({ theme }) => ({
  padding: 0,
  width: '16px',
  height: '16px',
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

function RadioGroup({ 
  onValueChange, 
  className, 
  children,
  ...props 
}: RadioGroupProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange?.(event.target.value)
  }

  return (
    <StyledRadioGroup
      onChange={handleChange}
      className={className}
      {...props}
    >
      {children}
    </StyledRadioGroup>
  )
}

function RadioGroupItem({ 
  value, 
  id, 
  disabled, 
  className, 
  children,
  label 
}: RadioGroupItemProps) {
  const radioComponent = (
    <StyledRadio
      value={value}
      id={id}
      disabled={disabled}
      className={className}
    />
  )

  if (label || children) {
    return (
      <FormControlLabel
        value={value}
        control={radioComponent}
        label={label || children}
        disabled={disabled}
        sx={{ margin: 0, alignItems: 'flex-start' }}
      />
    )
  }

  return radioComponent
}

export { RadioGroup, RadioGroupItem }
