'use client'

import * as React from 'react'
import { Switch as MuiSwitch, FormControlLabel, SwitchProps as MuiSwitchProps } from '@mui/material'
import { styled } from '@mui/material/styles'

interface SwitchProps extends Omit<MuiSwitchProps, 'size'> {
  className?: string
  label?: string
}

const StyledSwitch = styled(MuiSwitch)(({ theme }) => ({
  width: 32,
  height: 18,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '200ms',
    '&.Mui-checked': {
      transform: 'translateX(14px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: theme.palette.primary.main,
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.grey[100],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 14,
    height: 14,
  },
  '& .MuiSwitch-track': {
    borderRadius: 18 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 200,
    }),
  },
}))

function Switch({ className, label, ...props }: SwitchProps) {
  const switchComponent = (
    <StyledSwitch className={className} {...props} />
  )

  if (label) {
    return (
      <FormControlLabel
        control={switchComponent}
        label={label}
        sx={{ margin: 0 }}
      />
    )
  }

  return switchComponent
}

export { Switch }
