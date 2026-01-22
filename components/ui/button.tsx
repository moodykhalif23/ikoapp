import * as React from 'react'
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material'
import { styled } from '@mui/material/styles'

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'

interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'customVariant' && prop !== 'customSize',
})<{ customVariant?: ButtonVariant; customSize?: ButtonSize }>(({ theme, customVariant, customSize }) => ({
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
    gap: '6px',
  }),
  ...(customSize === 'lg' && {
    height: '40px',
    padding: '8px 24px',
    fontSize: '0.875rem',
  }),
  ...(customSize === 'icon' && {
    width: '36px',
    height: '36px',
    minWidth: '36px',
    padding: 0,
  }),
  ...(customSize === 'icon-sm' && {
    width: '32px',
    height: '32px',
    minWidth: '32px',
    padding: 0,
  }),
  ...(customSize === 'icon-lg' && {
    width: '40px',
    height: '40px',
    minWidth: '40px',
    padding: 0,
  }),
  
  // Brand color variants
  ...(customVariant === 'default' && {
    backgroundColor: '#2d6a4f', // Brand green
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#1e4a35', // Darker green
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(45, 106, 79, 0.3)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 4px rgba(45, 106, 79, 0.3)',
    },
  }),
  ...(customVariant === 'secondary' && {
    backgroundColor: '#ff8c00', // Brand orange
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#e67c00', // Darker orange
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(255, 140, 0, 0.3)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 4px rgba(255, 140, 0, 0.3)',
    },
  }),
  ...(customVariant === 'destructive' && {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#b91c1c',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(220, 38, 38, 0.3)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
    },
  }),
  ...(customVariant === 'outline' && {
    backgroundColor: 'transparent',
    color: '#2d6a4f', // Brand green text
    border: '1px solid #2d6a4f', // Brand green border
    '&:hover': {
      backgroundColor: '#2d6a4f', // Brand green background on hover
      color: '#ffffff',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(45, 106, 79, 0.2)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 4px rgba(45, 106, 79, 0.2)',
    },
  }),
  ...(customVariant === 'ghost' && {
    backgroundColor: 'transparent',
    color: '#2d6a4f', // Brand green text
    '&:hover': {
      backgroundColor: 'rgba(45, 106, 79, 0.1)', // Light brand green background
      color: '#1e4a35', // Darker green text
    },
  }),
  ...(customVariant === 'link' && {
    backgroundColor: 'transparent',
    color: '#2d6a4f', // Brand green text
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#ff8c00', // Brand orange on hover
      textDecoration: 'underline',
    },
  }),
}))

function Button({
  variant = 'default',
  size = 'default',
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
    })
  }

  return (
    <StyledButton
      customVariant={variant}
      customSize={size}
      {...props}
    >
      {children}
    </StyledButton>
  )
}

export { Button }
export type { ButtonProps }

// Export buttonVariants for compatibility
export const buttonVariants = (props: { variant?: ButtonVariant; size?: ButtonSize }) => {
  return `button-${props.variant || 'default'} button-${props.size || 'default'}`
}
