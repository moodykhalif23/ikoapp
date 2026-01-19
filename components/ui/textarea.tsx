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
    backgroundColor: 'transparent',
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.action.hover,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '1px',
      boxShadow: 'none',
    },
    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    '&::placeholder': {
      color: theme.palette.text.disabled,
      opacity: 1,
    },
    '&:focus': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
  // Remove any focus ring or overlay
  '&:focus-within': {
    boxShadow: 'none',
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
