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
  
  // Variant styles
  ...(customVariant === 'default' && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
  ...(customVariant === 'destructive' && {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  }),
  ...(customVariant === 'outline' && {
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }),
  ...(customVariant === 'secondary' && {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  }),
  ...(customVariant === 'ghost' && {
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }),
  ...(customVariant === 'link' && {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
    '&:hover': {
      backgroundColor: 'transparent',
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
