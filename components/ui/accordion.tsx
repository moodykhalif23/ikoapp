'use client'

import * as React from 'react'
import { 
  Accordion as MuiAccordion,
  AccordionSummary,
  AccordionDetails,
  AccordionProps as MuiAccordionProps
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { ChevronDown } from 'lucide-react'

interface AccordionProps extends Omit<MuiAccordionProps, 'children'> {
  type?: 'single' | 'multiple'
  collapsible?: boolean
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  children: React.ReactNode
}

interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

const StyledAccordion = styled(MuiAccordion)(({ theme }) => ({
  boxShadow: 'none',
  border: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    padding: '16px 0',
    minHeight: 'auto',
    '&.Mui-expanded': {
      minHeight: 'auto',
    },
  },
  '& .MuiAccordionSummary-content': {
    margin: 0,
    '&.Mui-expanded': {
      margin: 0,
    },
  },
  '& .MuiAccordionDetails-root': {
    padding: '0 0 16px 0',
  },
}))

const AccordionContext = React.createContext<{
  expandedItems: Set<string>
  toggleItem: (value: string) => void
  type: 'single' | 'multiple'
}>({
  expandedItems: new Set(),
  toggleItem: () => {},
  type: 'single',
})

function Accordion({ 
  type = 'single', 
  value, 
  onValueChange, 
  children, 
  ...props 
}: AccordionProps) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set())

  const toggleItem = React.useCallback((itemValue: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (type === 'single') {
        newSet.clear()
        if (!prev.has(itemValue)) {
          newSet.add(itemValue)
        }
      } else {
        if (newSet.has(itemValue)) {
          newSet.delete(itemValue)
        } else {
          newSet.add(itemValue)
        }
      }
      
      const newValue = type === 'single' 
        ? (newSet.size > 0 ? Array.from(newSet)[0] : '')
        : Array.from(newSet)
      
      onValueChange?.(newValue)
      return newSet
    })
  }, [type, onValueChange])

  React.useEffect(() => {
    if (value !== undefined) {
      const valueArray = Array.isArray(value) ? value : [value].filter(Boolean)
      setExpandedItems(new Set(valueArray))
    }
  }, [value])

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem, type }}>
      <div {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

function AccordionItem({ value, children, className }: AccordionItemProps) {
  const { expandedItems, toggleItem } = React.useContext(AccordionContext)
  const isExpanded = expandedItems.has(value)

  return (
    <StyledAccordion 
      expanded={isExpanded}
      onChange={() => toggleItem(value)}
      className={className}
    >
      {children}
    </StyledAccordion>
  )
}

function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  return (
    <AccordionSummary
      expandIcon={<ChevronDown size={16} />}
      className={className}
      sx={{
        '& .MuiAccordionSummary-expandIconWrapper': {
          transition: 'transform 0.2s',
        },
        '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
          transform: 'rotate(180deg)',
        },
      }}
    >
      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
        {children}
      </div>
    </AccordionSummary>
  )
}

function AccordionContent({ children, className }: AccordionContentProps) {
  return (
    <AccordionDetails className={className}>
      <div style={{ fontSize: '0.875rem' }}>
        {children}
      </div>
    </AccordionDetails>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
