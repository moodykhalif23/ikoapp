"use client"

import * as React from "react"
import {
  FormControl,
  Select as MuiSelect,
  MenuItem,
  InputLabel,
  FormHelperText,
  SelectProps as MuiSelectProps,
  ListSubheader,
  Divider
} from '@mui/material'
import { Check, ExpandMore, ExpandLess } from "@mui/icons-material"
import { styled } from '@mui/material/styles'

import { cn } from "@/lib/utils"

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  disabled?: boolean
  name?: string
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
  placeholder?: string
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
  position?: 'item-aligned' | 'popper'
}

interface SelectItemProps {
  children: React.ReactNode
  value: string
  disabled?: boolean
  className?: string
}

interface SelectLabelProps {
  children: React.ReactNode
  className?: string
}

interface SelectSeparatorProps {
  className?: string
}

const StyledSelect = styled(MuiSelect)(({ theme }) => ({
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minHeight: '20px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderRadius: '6px',
  },
}))

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

function Select({ 
  children, 
  value, 
  onValueChange, 
  defaultValue, 
  disabled, 
  name 
}: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '')
  const [open, setOpen] = React.useState(false)
  
  const currentValue = value !== undefined ? value : internalValue
  
  const handleChange = React.useCallback((newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }, [value, onValueChange])

  return (
    <SelectContext.Provider value={{ 
      value: currentValue, 
      onValueChange: handleChange,
      open,
      setOpen
    }}>
      <FormControl fullWidth disabled={disabled}>
        {children}
      </FormControl>
    </SelectContext.Provider>
  )
}

function SelectGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function SelectValue({ placeholder, className }: { placeholder?: string; className?: string }) {
  const { value } = React.useContext(SelectContext)
  
  return (
    <span className={className}>
      {value || placeholder}
    </span>
  )
}

function SelectTrigger({ children, className, placeholder }: SelectTriggerProps) {
  const { value, onValueChange, open, setOpen } = React.useContext(SelectContext)
  
  return (
    <StyledSelect
      value={value || ''}
      onChange={(e) => onValueChange?.(e.target.value)}
      displayEmpty
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      className={className}
      IconComponent={open ? ExpandLess : ExpandMore}
      renderValue={(selected) => {
        if (!selected) {
          return <span style={{ color: '#9ca3af' }}>{placeholder}</span>
        }
        return selected
      }}
    >
      {/* This will be populated by SelectContent */}
    </StyledSelect>
  )
}

function SelectScrollUpButton() {
  return null // Material-UI handles scrolling automatically
}

function SelectScrollDownButton() {
  return null // Material-UI handles scrolling automatically
}

function SelectContent({ children, className, position }: SelectContentProps) {
  // In Material-UI, content is rendered inside the Select component
  // We'll use a different approach - render items directly
  return <>{children}</>
}

function SelectLabel({ children, className }: SelectLabelProps) {
  return (
    <ListSubheader className={className}>
      {children}
    </ListSubheader>
  )
}

function SelectItem({ children, value, disabled, className }: SelectItemProps) {
  const { value: selectedValue } = React.useContext(SelectContext)
  const isSelected = selectedValue === value
  
  return (
    <MenuItem 
      value={value} 
      disabled={disabled}
      className={className}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        '&.Mui-selected': {
          backgroundColor: 'action.selected',
        }
      }}
    >
      <span style={{ 
        width: '16px', 
        height: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        {isSelected && <Check sx={{ fontSize: 16 }} />}
      </span>
      {children}
    </MenuItem>
  )
}

function SelectSeparator({ className }: SelectSeparatorProps) {
  return <Divider className={className} />
}

// For backward compatibility, we need to create a wrapper that combines trigger and content
function SelectWrapper({ children, ...props }: SelectProps) {
  const [triggerElement, setTriggerElement] = React.useState<React.ReactElement | null>(null)
  const [contentElement, setContentElement] = React.useState<React.ReactElement | null>(null)
  
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === SelectTrigger) {
        setTriggerElement(child)
      } else if (child.type === SelectContent) {
        setContentElement(child)
      }
    }
  })
  
  const { value, onValueChange, open, setOpen } = React.useContext(SelectContext)
  
  return (
    <StyledSelect
      value={value || ''}
      onChange={(e) => onValueChange?.(e.target.value)}
      displayEmpty
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      IconComponent={open ? ExpandLess : ExpandMore}
      renderValue={(selected) => {
        if (!selected && triggerElement) {
          const valueChild = React.Children.toArray(triggerElement.props.children)
            .find((child: any) => child?.type === SelectValue)
          return valueChild ? React.cloneElement(valueChild as React.ReactElement) : null
        }
        return selected
      }}
    >
      {contentElement?.props.children}
    </StyledSelect>
  )
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}