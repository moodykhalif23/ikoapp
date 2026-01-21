import * as React from 'react'
import {
  MenuList,
  MenuItem,
  Button,
  Popper,
  Paper,
  ClickAwayListener,
  Grow,
  Box
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

interface NavigationMenuProps {
  children: React.ReactNode
  className?: string
  viewport?: boolean
}

interface NavigationMenuListProps {
  children: React.ReactNode
  className?: string
}

interface NavigationMenuItemProps {
  children: React.ReactNode
  className?: string
}

interface NavigationMenuTriggerProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

interface NavigationMenuContentProps {
  children: React.ReactNode
  className?: string
}

interface NavigationMenuLinkProps {
  children: React.ReactNode
  className?: string
  href?: string
  onClick?: () => void
}

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  color: theme.palette.text.primary,
  padding: '8px 16px',
  borderRadius: '6px',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.active': {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.primary.main,
  },
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '8px',
  boxShadow: theme.shadows[8],
  border: `1px solid ${theme.palette.divider}`,
  padding: '8px',
  minWidth: '200px',
}))

const NavigationMenuContext = React.createContext<{
  openItem: string | null
  setOpenItem: (item: string | null) => void
}>({
  openItem: null,
  setOpenItem: () => {},
})

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: NavigationMenuProps) {
  const [openItem, setOpenItem] = React.useState<string | null>(null)

  return (
    <NavigationMenuContext.Provider value={{ openItem, setOpenItem }}>
      <Box
        className={cn(
          'relative flex max-w-max flex-1 items-center justify-center',
          className,
        )}
        {...props}
      >
        {children}
      </Box>
    </NavigationMenuContext.Provider>
  )
}

function NavigationMenuList({
  className,
  ...props
}: NavigationMenuListProps) {
  return (
    <Box
      className={cn(
        'group flex flex-1 list-none items-center justify-center gap-1',
        className,
      )}
      component="ul"
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  children,
  ...props
}: NavigationMenuItemProps) {
  return (
    <Box
      className={cn('relative', className)}
      component="li"
      {...props}
    >
      {children}
    </Box>
  )
}

const navigationMenuTriggerStyle = cva(
  'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
)

function NavigationMenuTrigger({
  className,
  children,
  onClick,
  ...props
}: NavigationMenuTriggerProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const { openItem, setOpenItem } = React.useContext(NavigationMenuContext)
  const itemId = React.useId()
  const isOpen = openItem === itemId

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    setOpenItem(isOpen ? null : itemId)
    onClick?.()
  }

  const handleClose = () => {
    setOpenItem(null)
    setAnchorEl(null)
  }

  return (
    <>
      <StyledButton
        className={cn(navigationMenuTriggerStyle(), 'group', className)}
        onClick={handleClick}
        endIcon={
          <ExpandMore
            sx={{
              fontSize: '16px',
              transition: 'transform 0.3s',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        }
        {...props}
      >
        {children}
      </StyledButton>
      
      <Popper
        open={isOpen}
        anchorEl={anchorEl}
        placement="bottom-start"
        transition
        disablePortal
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} timeout={200}>
            <div>
              <ClickAwayListener onClickAway={handleClose}>
                <StyledPaper>
                  {/* Content will be rendered by NavigationMenuContent */}
                </StyledPaper>
              </ClickAwayListener>
            </div>
          </Grow>
        )}
      </Popper>
    </>
  )
}

function NavigationMenuContent({
  className,
  children,
  ...props
}: NavigationMenuContentProps) {
  return (
    <Box
      className={cn(
        'left-0 top-0 w-full p-2',
        className,
      )}
      {...props}
    >
      {children}
    </Box>
  )
}

function NavigationMenuViewport({
  className,
  ...props
}: { className?: string }) {
  return null // Material-UI Popper handles viewport automatically
}

function NavigationMenuLink({
  className,
  children,
  href,
  onClick,
  ...props
}: NavigationMenuLinkProps) {
  const Component = href ? 'a' : 'button'
  
  return (
    <Box
      component={Component}
      href={href}
      onClick={onClick}
      className={cn(
        'flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </Box>
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: { className?: string }) {
  return null // Material-UI handles indicators automatically
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}