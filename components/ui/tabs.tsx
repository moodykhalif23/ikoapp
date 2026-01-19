'use client'

import * as React from 'react'
import { Tabs as MuiTabs, Tab, TabProps, TabsProps as MuiTabsProps } from '@mui/material'
import { styled } from '@mui/material/styles'

interface TabsProps extends Omit<MuiTabsProps, 'value' | 'onChange'> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  orientation?: 'horizontal' | 'vertical'
  className?: string
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
    backgroundColor: '#2d6a4f', // Brand green
    height: '2px',
  },
  '& .MuiTabs-flexContainer': {
    gap: '2px',
  },
  '& .MuiTabs-scroller': {
    overflow: 'auto !important',
  },
  '& .MuiTabs-scrollButtons': {
    '&.Mui-disabled': {
      opacity: 0.3,
    },
  },
}))

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '0.75rem',
  fontWeight: 500,
  padding: '6px 8px',
  minHeight: '32px',
  minWidth: '60px',
  borderRadius: '6px',
  color: theme.palette.text.secondary,
  transition: 'all 0.2s ease-in-out',
  '&.Mui-selected': {
    color: '#2d6a4f', // Brand green
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    fontWeight: 600,
  },
  '&:hover': {
    color: '#2d6a4f', // Brand green
    backgroundColor: 'rgba(45, 106, 79, 0.05)',
  },
  '@media (min-width: 640px)': {
    fontSize: '0.875rem',
    padding: '8px 12px',
    minHeight: '36px',
    minWidth: '80px',
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
  
  const handleChange = React.useCallback((newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }, [value, onValueChange])

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
  
  const handleMuiChange = React.useCallback((event: React.SyntheticEvent, newValue: string) => {
    onValueChange(newValue)
  }, [onValueChange])
  
  return (
    <StyledTabs
      value={value || false}
      onChange={handleMuiChange}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      className={className}
      sx={{
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        padding: '3px',
        minHeight: '38px',
        '& .MuiTabs-flexContainer': {
          minHeight: '32px',
        },
        '@media (min-width: 640px)': {
          minHeight: '42px',
          '& .MuiTabs-flexContainer': {
            minHeight: '36px',
          },
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
    <div className={className} style={{ marginTop: '12px' }}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
