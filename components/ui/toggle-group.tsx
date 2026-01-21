'use client'

import * as React from 'react'
import { ToggleButtonGroup, ToggleButton } from '@mui/material'
import { styled } from '@mui/material/styles'
import { type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { toggleVariants } from '@/components/ui/toggle'

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: 'default',
  variant: 'default',
})

interface ToggleGroupProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  type?: 'single' | 'multiple'
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  disabled?: boolean
}

interface ToggleGroupItemProps {
  children: React.ReactNode
  value: string
  className?: string
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  disabled?: boolean
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: 0,
    border: 0,
    borderRadius: '6px !important',
    '&:not(:first-of-type)': {
      borderLeft: `1px solid ${theme.palette.divider}`,
      borderRadius: 0,
    },
    '&:first-of-type': {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    '&:last-of-type': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
    '&:not(:first-of-type):not(:last-of-type)': {
      borderRadius: 0,
    },
  },
}))

const StyledToggleButton = styled(ToggleButton)<{ 
  customVariant?: 'default' | 'outline'
  customSize?: 'default' | 'sm' | 'lg'
}>(({ theme, customVariant, customSize }) => ({
  textTransform: 'none',
  fontWeight: 500,
  gap: '8px',
  transition: 'all 0.2s ease-in-out',
  
  // Size variants
  ...(customSize === 'sm' && {
    height: '32px',
    padding: '6px 12px',
    fontSize: '0.875rem',
  }),
  ...(customSize === 'lg' && {
    height: '40px',
    padding: '8px 20px',
    fontSize: '0.875rem',
  }),
  ...(customSize === 'default' && {
    height: '36px',
    padding: '8px 16px',
    fontSize: '0.875rem',
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

function ToggleGroup({
  className,
  variant = 'default',
  size = 'default',
  type = 'single',
  value,
  onValueChange,
  children,
  disabled,
  ...props
}: ToggleGroupProps) {
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string | string[]
  ) => {
    if (type === 'single') {
      onValueChange?.(newValue as string)
    } else {
      onValueChange?.(newValue as string[])
    }
  }

  return (
    <ToggleGroupContext.Provider value={{ variant, size }}>
      <StyledToggleButtonGroup
        value={value}
        onChange={handleChange}
        exclusive={type === 'single'}
        disabled={disabled}
        className={cn(
          'flex w-fit items-center rounded-md',
          variant === 'outline' && 'shadow-sm',
          className
        )}
        {...props}
      >
        {children}
      </StyledToggleButtonGroup>
    </ToggleGroupContext.Provider>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  value,
  disabled,
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <StyledToggleButton
      value={value}
      disabled={disabled}
      customVariant={context.variant || variant}
      customSize={context.size || size}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        'min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10',
        className,
      )}
      {...props}
    >
      {children}
    </StyledToggleButton>
  )
}

export { ToggleGroup, ToggleGroupItem }