'use client'

import * as React from 'react'
import {
  Menu,
  MenuItem,
  MenuList,
  Divider,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material'
import { Check, ChevronRight, RadioButtonChecked } from '@mui/icons-material'
import { styled } from '@mui/material/styles'

import { cn } from '@/lib/utils'

interface ContextMenuProps {
  children: React.ReactNode
}

interface ContextMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface ContextMenuContentProps {
  children: React.ReactNode
  className?: string
}

interface ContextMenuItemProps {
  children: React.ReactNode
  className?: string
  inset?: boolean
  variant?: 'default' | 'destructive'
  onClick?: () => void
  disabled?: boolean
}

interface ContextMenuCheckboxItemProps extends ContextMenuItemProps {
  checked?: boolean
}

interface ContextMenuRadioItemProps extends ContextMenuItemProps {
  value?: string
}

interface ContextMenuLabelProps {
  children: React.ReactNode
  className?: string
  inset?: boolean
}

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '6px',
    minWidth: '128px',
    boxShadow: theme.shadows[8],
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

const ContextMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  anchorPosition: { top: number; left: number } | null
  setAnchorPosition: (position: { top: number; left: number } | null) => void
}>({
  open: false,
  setOpen: () => {},
  anchorPosition: null,
  setAnchorPosition: () => {},
})

function ContextMenu({ children }: ContextMenuProps) {
  const [open, setOpen] = React.useState(false)
  const [anchorPosition, setAnchorPosition] = React.useState<{ top: number; left: number } | null>(null)

  return (
    <ContextMenuContext.Provider value={{ 
      open, 
      setOpen, 
      anchorPosition, 
      setAnchorPosition 
    }}>
      {children}
    </ContextMenuContext.Provider>
  )
}

function ContextMenuTrigger({ children, asChild }: ContextMenuTriggerProps) {
  const { setOpen, setAnchorPosition } = React.useContext(ContextMenuContext)
  
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    setAnchorPosition({
      top: event.clientY,
      left: event.clientX,
    })
    setOpen(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onContextMenu: handleContextMenu,
      ...children.props,
    })
  }

  return (
    <div onContextMenu={handleContextMenu}>
      {children}
    </div>
  )
}

function ContextMenuGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function ContextMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function ContextMenuSub({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function ContextMenuRadioGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: {
  className?: string
  inset?: boolean
  children: React.ReactNode
}) {
  return (
    <StyledMenuItem inset={inset} className={className}>
      {children}
      <ChevronRight fontSize="small" sx={{ marginLeft: 'auto' }} />
    </StyledMenuItem>
  )
}

function ContextMenuSubContent({ 
  className, 
  children 
}: { 
  className?: string
  children: React.ReactNode 
}) {
  return <>{children}</>
}

function ContextMenuContent({
  className,
  children,
  ...props
}: ContextMenuContentProps) {
  const { open, setOpen, anchorPosition } = React.useContext(ContextMenuContext)

  return (
    <StyledMenu
      open={open}
      onClose={() => setOpen(false)}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition || undefined}
      className={className}
      {...props}
    >
      <MenuList dense>
        {children}
      </MenuList>
    </StyledMenu>
  )
}

function ContextMenuItem({
  className,
  inset,
  variant = 'default',
  onClick,
  disabled,
  children,
  ...props
}: ContextMenuItemProps) {
  const { setOpen } = React.useContext(ContextMenuContext)
  
  const handleClick = () => {
    onClick?.()
    setOpen(false)
  }

  return (
    <StyledMenuItem
      onClick={handleClick}
      disabled={disabled}
      variant={variant}
      inset={inset}
      className={className}
      {...props}
    >
      {children}
    </StyledMenuItem>
  )
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  onClick,
  disabled,
  ...props
}: ContextMenuCheckboxItemProps) {
  const { setOpen } = React.useContext(ContextMenuContext)
  
  const handleClick = () => {
    onClick?.()
    setOpen(false)
  }

  return (
    <StyledMenuItem
      onClick={handleClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      <ListItemIcon sx={{ minWidth: '20px' }}>
        {checked && <Check fontSize="small" />}
      </ListItemIcon>
      <ListItemText primary={children} />
    </StyledMenuItem>
  )
}

function ContextMenuRadioItem({
  className,
  children,
  value,
  onClick,
  disabled,
  ...props
}: ContextMenuRadioItemProps) {
  const { setOpen } = React.useContext(ContextMenuContext)
  
  const handleClick = () => {
    onClick?.()
    setOpen(false)
  }

  return (
    <StyledMenuItem
      onClick={handleClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      <ListItemIcon sx={{ minWidth: '20px' }}>
        <RadioButtonChecked fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={children} />
    </StyledMenuItem>
  )
}

function ContextMenuLabel({
  className,
  inset,
  children,
  ...props
}: ContextMenuLabelProps) {
  return (
    <MenuItem disabled sx={{ fontWeight: 600, opacity: '1 !important' }}>
      <Typography variant="body2" sx={{ paddingLeft: inset ? '24px' : 0 }}>
        {children}
      </Typography>
    </MenuItem>
  )
}

function ContextMenuSeparator({ className }: { className?: string }) {
  return <Divider sx={{ margin: '4px 0' }} className={className} />
}

function ContextMenuShortcut({ 
  className, 
  children 
}: { 
  className?: string
  children: React.ReactNode 
}) {
  return (
    <Typography
      variant="caption"
      className={cn(
        'ml-auto text-xs tracking-widest opacity-60',
        className,
      )}
    >
      {children}
    </Typography>
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}