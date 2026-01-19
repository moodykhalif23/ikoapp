import * as React from 'react'
import { TextField, TextFieldProps } from '@mui/material'
import { styled } from '@mui/material/styles'

interface TextareaProps extends Omit<TextFieldProps, 'variant' | 'multiline'> {
  className?: string
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    fontSize: '0.875rem',
    borderRadius: '6px',
    minHeight: '64px',
    alignItems: 'flex-start',
    backgroundColor: 'transparent !important',
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.action.hover,
    },
    '&.Mui-focused': {
      backgroundColor: 'transparent !important',
      '& fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '1px',
        boxShadow: 'none !important',
      },
    },
    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '8px 12px',
    backgroundColor: 'transparent !important',
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
    '&.Mui-focused': {
      color: theme.palette.primary.main,
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
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    boxShadow: 'none !important',
  },
}))

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <StyledTextField
      variant="outlined"
      multiline
      minRows={3}
      fullWidth
      {...props}
      className={className}
    />
  )
}

export { Textarea }
