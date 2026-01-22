'use client'

import * as React from 'react'
import { 
  Menu,
  MenuItem,
  MenuProps,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuList
} from '@mui/material'
import { 
  Check as CheckIcon,
  ChevronRight as ChevronRightIcon,
  RadioButtonUnchecked as CircleIcon
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

interface DropdownMenuProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  sideOffset?: number
  anchorOrigin?: {
    vertical: 'top' | 'center' | 'bottom'
    horizontal: 'left' | 'center' | 'right'
  }
  transformOrigin?: {
    vertical: 'top' | 'center' | 'bottom'
    horizontal: 'left' | 'center' | 'right'
  }
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onSelect?: () => void
  disabled?: boolean
  inset?: boolean
  variant?: 'default' | 'destructive'
  className?: string
}

interface DropdownMenuCheckboxItemProps extends DropdownMenuItemProps {
  checked?: boolean
}

interface DropdownMenuRadioItemProps extends DropdownMenuItemProps {
  value: string
}

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '6px',
    minWidth: '128px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    border: `1px solid ${theme.palette.divider}`,
    padding: '4px',
  },
}))

const StyledMenuItem = styled(MenuItem)<{ 
  variant?: 'default' | 'destructive'
  inset?: boolean 
}>(({ theme, variant, inset }) => ({
  fontSize: '0.875rem',
  borderRadius: '4px',
  padding: '6px 8px',
  paddingLeft: inset ? '32px' : '8px',
  minHeight: 'auto',
  gap: '8px',
  ...(variant === 'destructive' && {
    color: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.main + '10',
      color: theme.palette.error.main,
    },
  }),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-disabled': {
    opacity: 0.5,
  },
}))

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  anchorEl: HTMLElement | null
  setAnchorEl: (el: HTMLElement | null) => void
}>({
  open: false,
  setOpen: () => {},
  anchorEl: null,
  setAnchorEl: () => {},
})

function DropdownMenu({ children, open, onOpenChange }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
  
  const isOpen = open !== undefined ? open : internalOpen
  
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
    if (!newOpen) {
      setAnchorEl(null)
    }
  }, [open, onOpenChange])

  return (
    <DropdownMenuContext.Provider value={{ open: isOpen, setOpen, anchorEl, setAnchorEl }}>
      {children}
    </DropdownMenuContext.Provider>
  )
}

function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const { setOpen, setAnchorEl } = React.useContext(DropdownMenuContext)
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    setOpen(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      ...(children.props || {}),
    } as any)
  }

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  )
}

function DropdownMenuContent({ 
  children, 
  className, 
  sideOffset = 4,
  anchorOrigin,
  transformOrigin,
  ...props 
}: DropdownMenuContentProps) {
  const { open, setOpen, anchorEl } = React.useContext(DropdownMenuContext)

  return (
    <StyledMenu
      open={open}
      anchorEl={anchorEl}
      onClose={() => setOpen(false)}
      anchorOrigin={anchorOrigin || {
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={transformOrigin || {
        vertical: 'top',
        horizontal: 'right',
      }}
      className={className}
    >
      <MenuList dense>
        {children}
      </MenuList>
    </StyledMenu>
  )
}

function DropdownMenuItem({ 
  children, 
  onSelect, 
  disabled, 
  inset, 
  variant = 'default',
  className 
}: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownMenuContext)
  
  const handleClick = () => {
    onSelect?.()
    setOpen(false)
  }

  return (
    <StyledMenuItem 
      onClick={handleClick}
      disabled={disabled}
      variant={variant}
      inset={inset}
      className={className}
    >
      {children}
    </StyledMenuItem>
  )
}

function DropdownMenuCheckboxItem({ 
  children, 
  checked, 
  onSelect, 
  disabled,
  className 
}: DropdownMenuCheckboxItemProps) {
  const { setOpen } = React.useContext(DropdownMenuContext)
  
  const handleClick = () => {
    onSelect?.()
    setOpen(false)
  }

  return (
    <StyledMenuItem onClick={handleClick} disabled={disabled} className={className}>
      <ListItemIcon sx={{ minWidth: '20px' }}>
        {checked && <CheckIcon sx={{ fontSize: 16 }} />}
      </ListItemIcon>
      <ListItemText primary={children} />
    </StyledMenuItem>
  )
}

function DropdownMenuRadioItem({ 
  children, 
  value, 
  onSelect, 
  disabled,
  className 
}: DropdownMenuRadioItemProps) {
  const { setOpen } = React.useContext(DropdownMenuContext)
  
  const handleClick = () => {
    onSelect?.()
    setOpen(false)
  }

  return (
    <StyledMenuItem onClick={handleClick} disabled={disabled} className={className}>
      <ListItemIcon sx={{ minWidth: '20px' }}>
        <CircleIcon sx={{ fontSize: 16 }} />
      </ListItemIcon>
      <ListItemText primary={children} />
    </StyledMenuItem>
  )
}

function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <MenuItem disabled sx={{ fontWeight: 600, opacity: '1 !important', fontSize: '0.875rem' }}>
      {children}
    </MenuItem>
  )
}

function DropdownMenuSeparator() {
  return <Divider sx={{ margin: '4px 0' }} />
}

function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DropdownMenuSubContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DropdownMenuSubTrigger({ children }: { children: React.ReactNode }) {
  return (
    <StyledMenuItem>
      {children}
      <ChevronRightIcon sx={{ fontSize: 16, marginLeft: 'auto' }} />
    </StyledMenuItem>
  )
}

function DropdownMenuShortcut({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span 
      className={className}
      style={{ 
        marginLeft: 'auto', 
        fontSize: '0.75rem', 
        opacity: 0.6 
      }}
    >
      {children}
    </span>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
}