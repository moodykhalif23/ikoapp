import * as React from 'react'
import { TextField, type TextFieldProps } from '@mui/material'
import { styled } from '@mui/material/styles'

interface InputProps extends Omit<TextFieldProps, 'variant'> {
  className?: string
}

const StyledTextField = styled(TextField)(({ theme }: { theme: any }) => ({
  '& .MuiOutlinedInput-root': {
    height: '36px',
    fontSize: '0.875rem',
    borderRadius: '6px',
    backgroundColor: 'transparent !important',
    // Force remove any background colors
    '&::before': {
      display: 'none !important',
    },
    '&::after': {
      display: 'none !important',
    },
    '& fieldset': {
      borderColor: theme.palette.divider,
      backgroundColor: 'transparent !important',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.action.hover,
      backgroundColor: 'transparent !important',
    },
    '&.Mui-focused': {
      backgroundColor: 'transparent !important',
      '& fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '1px',
        boxShadow: 'none !important',
        backgroundColor: 'transparent !important',
      },
    },
    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main,
      backgroundColor: 'transparent !important',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '8px 12px',
    backgroundColor: 'transparent !important',
    // Force transparent on all states
    '&:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
      WebkitTextFillColor: 'inherit !important',
      backgroundColor: 'transparent !important',
      transition: 'background-color 5000s ease-in-out 0s !important',
    },
    '&:-webkit-autofill:hover': {
      WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
      backgroundColor: 'transparent !important',
      transition: 'background-color 5000s ease-in-out 0s !important',
    },
    '&:-webkit-autofill:focus': {
      WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
      backgroundColor: 'transparent !important',
      transition: 'background-color 5000s ease-in-out 0s !important',
    },
    '&::placeholder': {
      color: theme.palette.text.disabled,
      opacity: 1,
    },
    '&:focus': {
      backgroundColor: 'transparent !important',
      boxShadow: 'none !important',
      outline: 'none !important',
    },
    '&:focus-visible': {
      backgroundColor: 'transparent !important',
      boxShadow: 'none !important',
      outline: 'none !important',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    backgroundColor: 'transparent !important',
    '&.Mui-focused': {
      color: theme.palette.primary.main,
      backgroundColor: 'transparent !important',
    },
  },
  // Remove any focus ring or overlay completely
  '&:focus-within': {
    boxShadow: 'none !important',
    backgroundColor: 'transparent !important',
  },
  // Override any Material UI focus styles
  '& .MuiOutlinedInput-notchedOutline': {
    boxShadow: 'none !important',
    backgroundColor: 'transparent !important',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    boxShadow: 'none !important',
    backgroundColor: 'transparent !important',
  },
  // Force override any internal MUI styles
  '& *': {
    backgroundColor: 'transparent !important',
  },
}))

function Input({ className, ...props }: InputProps) {
  return (
    <StyledTextField
      variant="outlined"
      size="small"
      fullWidth
      {...props}
      className={className}
      InputProps={{
        ...props.InputProps,
        style: {
          backgroundColor: 'transparent !important',
          ...props.InputProps?.style,
        },
      }}
      inputProps={{
        ...props.inputProps,
        style: {
          backgroundColor: 'transparent !important',
          ...props.inputProps?.style,
        },
      }}
    />
  )
}

export { Input }
