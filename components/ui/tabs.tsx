'use client'

import * as React from 'react'
import { Tabs as MuiTabs, Tab, TabProps, TabsProps as MuiTabsProps } from '@mui/material'
import { styled } from '@mui/material/styles'

interface TabsProps extends Omit<MuiTabsProps, 'value' | 'onChange'> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  orientation?: 'horizontal' | 'vertical'
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const StyledTabs = styled(MuiTabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: '2px',
  },
  '& .MuiTabs-flexContainer': {
    gap: '4px',
  },
}))

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 500,
  padding: '8px 12px',
  minHeight: '36px',
  borderRadius: '6px',
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  },
  '&:hover': {
    color: theme.palette.text.primary,
  },
}))

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: '',
  onValueChange: () => {},
})

function Tabs({ 
  value, 
  onValueChange, 
  defaultValue, 
  orientation = 'horizontal',
  children, 
  className,
  ...props 
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '')
  const currentValue = value !== undefined ? value : internalValue
  
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ children, className }: TabsListProps) {
  const { value, onValueChange } = React.useContext(TabsContext)
  
  return (
    <StyledTabs
      value={value}
      onChange={onValueChange}
      sx={{
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        padding: '3px',
        minHeight: '42px',
        '& .MuiTabs-flexContainer': {
          minHeight: '36px',
        },
      }}
    >
      {children}
    </StyledTabs>
  )
}

function TabsTrigger({ value, children, disabled, className }: TabsTriggerProps) {
  return (
    <StyledTab 
      value={value} 
      label={children} 
      disabled={disabled}
      className={className}
    />
  )
}

function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: currentValue } = React.useContext(TabsContext)
  
  if (currentValue !== value) {
    return null
  }
  
  return (
    <div className={className} style={{ marginTop: '8px' }}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
