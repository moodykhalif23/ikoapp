'use client'

import * as React from 'react'
import { 
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputLabel,
  SelectProps as MuiSelectProps,
  SelectChangeEvent
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'

interface SelectProps extends Omit<MuiSelectProps, 'onChange'> {
  onValueChange?: (value: string) => void
  placeholder?: string
  size?: 'sm' | 'default'
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
}

const StyledSelect = styled(MuiSelect)<{ customSize?: 'sm' | 'default' }>(({ theme, customSize }) => ({
  '& .MuiSelect-select': {
    padding: customSize === 'sm' ? '8px 12px' : '10px 12px',
    fontSize: '0.875rem',
    minHeight: customSize === 'sm' ? '20px' : '24px',
    display: 'flex',
    alignItems: 'center',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider,
    borderRadius: '6px',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.action.hover,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    borderWidth: '2px',
  },
  '& .MuiSelect-icon': {
    right: '12px',
  },
}))

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontSize: '0.875rem',
  padding: '8px 12px',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
}))

function Select({ 
  onValueChange, 
  placeholder, 
  size = 'default',
  children, 
  ...props 
}: SelectProps) {
  const handleChange = (event: SelectChangeEvent) => {
    onValueChange?.(event.target.value as string)
  }

  return (
    <FormControl size="small" fullWidth>
      <StyledSelect
        customSize={size}
        displayEmpty
        onChange={handleChange}
        IconComponent={ChevronDown}
        {...props}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            <span style={{ color: '#9ca3af' }}>{placeholder}</span>
          </MenuItem>
        )}
        {children}
      </StyledSelect>
    </FormControl>
  )
}

function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function SelectItem({ value, children, disabled }: SelectItemProps) {
  return (
    <StyledMenuItem value={value} disabled={disabled}>
      {children}
    </StyledMenuItem>
  )
}

function SelectTrigger({ children, className, size, ...props }: any) {
  return <div {...props}>{children}</div>
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  return null // This is handled by the Select component itself
}

function SelectGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function SelectLabel({ children }: { children: React.ReactNode }) {
  return (
    <MenuItem disabled sx={{ fontWeight: 600, opacity: '1 !important' }}>
      {children}
    </MenuItem>
  )
}

function SelectSeparator() {
  return <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
}

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
