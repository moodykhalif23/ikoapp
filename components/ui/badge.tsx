import * as React from 'react'
import { Chip } from '@mui/material'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}

function Badge({ children, variant = 'default', className, ...props }: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--secondary)',
          color: 'var(--secondary-foreground)',
          border: 'none',
        }
      case 'destructive':
        return {
          backgroundColor: 'var(--destructive)',
          color: 'white',
          border: 'none',
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        }
      default:
        return {
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          border: 'none',
        }
    }
  }

  return (
    <Chip
      label={children}
      size="small"
      sx={{
        ...getVariantStyles(),
        fontSize: '0.75rem',
        height: 'auto',
        minHeight: '20px',
        '& .MuiChip-label': {
          padding: '2px 8px',
          fontSize: '0.75rem',
          fontWeight: 500,
        },
        ...className,
      }}
      {...props}
    />
  )
}

export { Badge }
