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
import { styled } from '@mui/material/styles'
import { Check, ChevronRight, Circle } from 'lucide-react'

interface DropdownMenuProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface DropdownMenuContentProps extends Omit<MenuProps, 'open' | 'onClose'> {
  children: React.ReactNode
  className?: string
  sideOffset?: number
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
      ...children.props,
    })
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
  ...props 
}: DropdownMenuContentProps) {
  const { open, setOpen, anchorEl } = React.useContext(DropdownMenuContext)

  return (
    <StyledMenu
      open={open}
      anchorEl={anchorEl}
      onClose={() => setOpen(false)}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      {...props}
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
        {checked && <Check size={16} />}
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
        <Circle size={16} />
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
      <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
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
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        'px-2 py-1.5 text-sm font-medium data-[inset]:pl-8',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'text-muted-foreground ml-auto text-xs tracking-widest',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg',
        className,
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
