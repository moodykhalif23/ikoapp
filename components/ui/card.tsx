import * as React from 'react'
import { 
  Card as MuiCard, 
  CardContent as MuiCardContent,
  CardActions as MuiCardActions,
  Typography,
  CardProps as MuiCardProps
} from '@mui/material'
import { styled } from '@mui/material/styles'

interface CardProps extends MuiCardProps {
  className?: string
}

const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  padding: '24px',
}))

const StyledCardContent = styled(MuiCardContent)({
  padding: 0,
  '&:last-child': {
    paddingBottom: 0,
  },
})

function Card({ className, ...props }: CardProps) {
  return (
    <StyledCard className={className} {...props} />
  )
}

function CardHeader({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'start',
        gap: '8px',
        marginBottom: '16px',
      }}
      {...props}
    >
      {children}
    </div>
  )
}

function CardTitle({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <Typography 
      variant="h6" 
      component="div"
      sx={{ 
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1,
        margin: 0,
      }}
      className={className}
      {...props}
    >
      {children}
    </Typography>
  )
}

function CardDescription({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <Typography 
      variant="body2" 
      color="text.secondary"
      sx={{ 
        fontSize: '0.875rem',
        margin: 0,
        marginTop: '8px',
      }}
      className={className}
      {...props}
    >
      {children}
    </Typography>
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={className}
      style={{
        gridColumn: '2',
        gridRow: '1 / span 2',
        justifySelf: 'end',
        alignSelf: 'start',
      }}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <StyledCardContent className={className} {...props} />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <MuiCardActions 
      sx={{ 
        padding: 0, 
        marginTop: '16px',
        borderTop: '1px solid',
        borderColor: 'divider',
        paddingTop: '16px',
      }}
      className={className} 
      {...props} 
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
