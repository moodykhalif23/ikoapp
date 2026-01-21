'use client'

import * as React from 'react'
import { ToggleButton, ToggleButtonProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-muted hover:text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
        outline:
          'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-2 min-w-9',
        sm: 'h-8 px-1.5 min-w-8',
        lg: 'h-10 px-2.5 min-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface CustomToggleProps extends Omit<ToggleButtonProps, 'variant' | 'size'> {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

const StyledToggleButton = styled(ToggleButton)<{ 
  customVariant?: 'default' | 'outline'
  customSize?: 'default' | 'sm' | 'lg'
}>(({ theme, customVariant, customSize }) => ({
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: '6px',
  gap: '8px',
  transition: 'all 0.2s ease-in-out',
  
  // Size variants
  ...(customSize === 'sm' && {
    height: '32px',
    padding: '6px 12px',
    fontSize: '0.875rem',
    minWidth: '32px',
  }),
  ...(customSize === 'lg' && {
    height: '40px',
    padding: '8px 20px',
    fontSize: '0.875rem',
    minWidth: '40px',
  }),
  ...(customSize === 'default' && {
    height: '36px',
    padding: '8px 16px',
    fontSize: '0.875rem',
    minWidth: '36px',
  }),
  
  // Variant styles
  ...(customVariant === 'default' && {
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    border: 'none',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.text.secondary,
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.action.selected,
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.action.selected,
      },
    },
  }),
  ...(customVariant === 'outline' && {
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      borderColor: theme.palette.divider,
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.action.selected,
      color: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.action.selected,
      },
    },
  }),
}))

function Toggle({
  className,
  variant = 'default',
  size = 'default',
  selected,
  onChange,
  ...props
}: CustomToggleProps & VariantProps<typeof toggleVariants>) {
  return (
    <StyledToggleButton
      customVariant={variant}
      customSize={size}
      selected={selected}
      onChange={onChange}
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }