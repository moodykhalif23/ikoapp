'use client'

import * as React from 'react'
import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material'
import { styled } from '@mui/material/styles'

interface AvatarProps extends MuiAvatarProps {
  className?: string
}

interface AvatarImageProps {
  src?: string
  alt?: string
  className?: string
}

interface AvatarFallbackProps {
  children: React.ReactNode
  className?: string
}

const StyledAvatar = styled(MuiAvatar)(({ theme }) => ({
  width: '32px',
  height: '32px',
  fontSize: '0.875rem',
  backgroundColor: theme.palette.grey[300],
  color: theme.palette.text.primary,
}))

const AvatarContext = React.createContext<{
  src?: string
  alt?: string
}>({})

function Avatar({ className, children, ...props }: AvatarProps) {
  const [src, setSrc] = React.useState<string | undefined>()
  const [alt, setAlt] = React.useState<string | undefined>()

  return (
    <AvatarContext.Provider value={{ src, alt }}>
      <StyledAvatar className={className} src={src} alt={alt} {...props}>
        {children}
      </StyledAvatar>
    </AvatarContext.Provider>
  )
}

function AvatarImage({ src, alt, className }: AvatarImageProps) {
  const context = React.useContext(AvatarContext)
  
  React.useEffect(() => {
    if (src) {
      // This is a bit of a hack since MUI Avatar doesn't separate image and fallback
      // We'll need to restructure this to work properly with MUI
    }
  }, [src])

  return null // MUI Avatar handles the image internally
}

function AvatarFallback({ children, className }: AvatarFallbackProps) {
  return <>{children}</>
}

// Better approach - create a unified Avatar component
function UnifiedAvatar({ 
  src, 
  alt, 
  fallback, 
  className, 
  ...props 
}: {
  src?: string
  alt?: string
  fallback?: React.ReactNode
  className?: string
} & MuiAvatarProps) {
  return (
    <StyledAvatar 
      src={src} 
      alt={alt} 
      className={className} 
      {...props}
    >
      {!src && fallback}
    </StyledAvatar>
  )
}

export { Avatar, AvatarImage, AvatarFallback, UnifiedAvatar }
