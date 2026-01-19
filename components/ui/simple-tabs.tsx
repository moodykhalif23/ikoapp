'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  className?: string
  children: React.ReactNode
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

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: '',
  onValueChange: () => {},
})

function SimpleTabs({ 
  value, 
  onValueChange, 
  defaultValue, 
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
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function SimpleTabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn(
      "inline-flex h-10 items-center rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto overflow-y-hidden",
      // Hide scrollbar but keep functionality
      "scrollbar-hide",
      // Center content when it fits, left-align when scrolling needed
      "justify-center",
      className
    )}>
      <div className="flex items-center gap-1 min-w-max h-full">
        {children}
      </div>
    </div>
  )
}

function SimpleTabsTrigger({ value, children, disabled, className }: TabsTriggerProps) {
  const { value: currentValue, onValueChange } = React.useContext(TabsContext)
  const isActive = currentValue === value
  
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-shrink-0 h-8",
        isActive 
          ? "bg-background text-foreground shadow-sm" 
          : "hover:bg-background/50 hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  )
}

function SimpleTabsContent({ value, children, className }: TabsContentProps) {
  const { value: currentValue } = React.useContext(TabsContext)
  
  if (currentValue !== value) {
    return null
  }
  
  return (
    <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>
      {children}
    </div>
  )
}

export { SimpleTabs as Tabs, SimpleTabsList as TabsList, SimpleTabsTrigger as TabsTrigger, SimpleTabsContent as TabsContent }