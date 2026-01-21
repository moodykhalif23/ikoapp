'use client'

import * as React from 'react'
import {
  Menu,
  MenuItem,
  MenuList,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material'
import { Check, ChevronRight, RadioButtonChecked } from '@mui/icons-material'
import { styled } from '@mui/material/styles'

import { cn } from '@/lib/utils'

interface MenubarProps {
  children: React.ReactNode
  className?: string
}

interface MenubarMenuProps {
  children: React.ReactNode
}

interface MenubarTriggerProps {
  children: React.ReactNode
  className?: string
}

interface MenubarContentProps {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
  alignOffset?: number
  sideOffset?: number
}

interface MenubarItemProps {
  children: React.ReactNode
  className?: string
  inset?: boolean
  variant?: 'default' | 'destructive'
  onClick?: () => void
  disabled?: boolean
}

interface MenubarCheckboxItemProps extends MenubarItemProps {
  checked?: boolean
}

interface MenubarRadioItemProps extends MenubarItemProps {
  value?: string
}

interface MenubarLabelProps {
  children: React.ReactNode
  className?: string
  inset?: boolean
}

const StyledMenuBar = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  height: '36px',
  padding: '4px',
  borderRadius: '6px',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}))

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 'auto',
  padding: '4px 8px',
  fontSize: '0.875rem',
  fontWeight: 500,
  borderRadius: '4px',
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.active': {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.primary.main,
  },
}))

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '6px',
    minWidth: '192px',
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

const MenubarContext = React.createContext<{
  openMenu: string | null
  setOpenMenu: (menu: string | null) => void
}>({
  openMenu: null,
  setOpenMenu: () => {},
})

function Menubar({
  className,
  children,
  ...props
}: MenubarProps) {
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)

  return (
    <MenubarContext.Provider value={{ openMenu, setOpenMenu }}>
      <StyledMenuBar
        className={cn(
          'flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs',
          className,
        )}
        {...props}
      >
        {children}
      </StyledMenuBar>
    </MenubarContext.Provider>
  )
}

function MenubarMenu({ children }: MenubarMenuProps) {
  return <>{children}</>
}

function MenubarGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function MenubarPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function MenubarRadioGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function MenubarTrigger({
  className,
  children,
  ...props
}: MenubarTriggerProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const { openMenu, setOpenMenu } = React.useContext(MenubarContext)
  const menuId = React.useId()
  const isOpen = openMenu === menuId

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    setOpenMenu(isOpen ? null : menuId)
  }

  const handleClose = () => {
    setOpenMenu(null)
    setAnchorEl(null)
  }

  return (
    <>
      <StyledButton
        className={cn(
          'flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-none select-none',
          isOpen && 'active',
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </StyledButton>
      
      <StyledMenu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuList dense>
          {/* Content will be rendered by MenubarContent */}
        </MenuList>
      </StyledMenu>
    </>
  )
}

function MenubarContent({
  className,
  align = 'start',
  alignOffset = -4,
  sideOffset = 8,
  children,
  ...props
}: MenubarContentProps) {
  return <>{children}</>
}

function MenubarItem({
  className,
  inset,
  variant = 'default',
  onClick,
  disabled,
  children,
  ...props
}: MenubarItemProps) {
  const { setOpenMenu } = React.useContext(MenubarContext)
  
  const handleClick = () => {
    onClick?.()
    setOpenMenu(null)
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

function MenubarCheckboxItem({
  className,
  children,
  checked,
  onClick,
  disabled,
  ...props
}: MenubarCheckboxItemProps) {
  const { setOpenMenu } = React.useContext(MenubarContext)
  
  const handleClick = () => {
    onClick?.()
    setOpenMenu(null)
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

function MenubarRadioItem({
  className,
  children,
  value,
  onClick,
  disabled,
  ...props
}: MenubarRadioItemProps) {
  const { setOpenMenu } = React.useContext(MenubarContext)
  
  const handleClick = () => {
    onClick?.()
    setOpenMenu(null)
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

function MenubarLabel({
  className,
  inset,
  children,
  ...props
}: MenubarLabelProps) {
  return (
    <MenuItem disabled sx={{ fontWeight: 600, opacity: '1 !important' }}>
      <Typography variant="body2" sx={{ paddingLeft: inset ? '24px' : 0 }}>
        {children}
      </Typography>
    </MenuItem>
  )
}

function MenubarSeparator({ className }: { className?: string }) {
  return <Divider sx={{ margin: '4px 0' }} className={className} />
}

function MenubarShortcut({ 
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

function MenubarSub({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function MenubarSubTrigger({
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

function MenubarSubContent({ 
  className, 
  children 
}: { 
  className?: string
  children: React.ReactNode 
}) {
  return <>{children}</>
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}