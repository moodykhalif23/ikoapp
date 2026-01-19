'use client'

import * as React from 'react'
import { Slider as MuiSlider, SliderProps as MuiSliderProps } from '@mui/material'
import { styled } from '@mui/material/styles'

interface SliderProps extends Omit<MuiSliderProps, 'onChange'> {
  onValueChange?: (value: number | number[]) => void
  className?: string
}

const StyledSlider = styled(MuiSlider)(({ theme }) => ({
  color: theme.palette.primary.main,
  height: 6,
  '& .MuiSlider-track': {
    border: 'none',
    height: 6,
    borderRadius: 3,
  },
  '& .MuiSlider-rail': {
    backgroundColor: theme.palette.grey[300],
    height: 6,
    borderRadius: 3,
  },
  '& .MuiSlider-thumb': {
    height: 16,
    width: 16,
    backgroundColor: '#fff',
    border: `2px solid ${theme.palette.primary.main}`,
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: `0 0 0 4px ${theme.palette.primary.main}20`,
    },
    '&:before': {
      display: 'none',
    },
  },
  '&.Mui-disabled': {
    opacity: 0.5,
  },
}))

function Slider({ 
  onValueChange, 
  className, 
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props 
}: SliderProps) {
  const handleChange = (event: Event, newValue: number | number[]) => {
    onValueChange?.(newValue)
  }

  return (
    <StyledSlider
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      onChange={handleChange}
      className={className}
      {...props}
    />
  )
}

export { Slider }
