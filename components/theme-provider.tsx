'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { useTheme } from 'next-themes'

// Create Material UI theme
const createMuiTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#2563eb' : '#3b82f6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'light' ? '#64748b' : '#94a3b8',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#06b6d4',
    },
    success: {
      main: '#10b981',
    },
    background: {
      default: mode === 'light' ? '#ffffff' : '#0f172a',
      paper: mode === 'light' ? '#ffffff' : '#1e293b',
    },
    text: {
      primary: mode === 'light' ? '#0f172a' : '#f8fafc',
      secondary: mode === 'light' ? '#64748b' : '#94a3b8',
      disabled: mode === 'light' ? '#cbd5e1' : '#475569',
    },
    divider: mode === 'light' ? '#e2e8f0' : '#334155',
    action: {
      hover: mode === 'light' ? '#f1f5f9' : '#1e293b',
      selected: mode === 'light' ? '#e2e8f0' : '#334155',
    },
  },
  typography: {
    fontFamily: 'inherit',
    fontSize: 14,
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontSize: '0.875rem',
            backgroundColor: 'transparent !important',
            '&.Mui-focused': {
              boxShadow: 'none !important',
              backgroundColor: 'transparent !important',
            },
            '&:focus-within': {
              boxShadow: 'none !important',
              backgroundColor: 'transparent !important',
            },
          },
          '& .MuiOutlinedInput-input': {
            backgroundColor: 'transparent !important',
            '&:focus': {
              backgroundColor: 'transparent !important',
              boxShadow: 'none !important',
            },
            '&:focus-visible': {
              backgroundColor: 'transparent !important',
              boxShadow: 'none !important',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent !important',
          '&.Mui-focused': {
            boxShadow: 'none !important',
            backgroundColor: 'transparent !important',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            boxShadow: 'none !important',
          },
          '&:focus-within': {
            boxShadow: 'none !important',
            backgroundColor: 'transparent !important',
          },
        },
        input: {
          backgroundColor: 'transparent !important',
          '&:focus': {
            backgroundColor: 'transparent !important',
            boxShadow: 'none !important',
          },
          '&:focus-visible': {
            backgroundColor: 'transparent !important',
            boxShadow: 'none !important',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent !important',
          '&.Mui-focused': {
            backgroundColor: 'transparent !important',
            boxShadow: 'none !important',
          },
        },
        input: {
          backgroundColor: 'transparent !important',
          '&:focus': {
            backgroundColor: 'transparent !important',
            boxShadow: 'none !important',
          },
        },
      },
    },
  },
})

function MuiThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  const currentTheme = theme === 'system' ? systemTheme : theme
  const muiTheme = createMuiTheme(currentTheme === 'dark' ? 'dark' : 'light')

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <MuiThemeWrapper>
        {children}
      </MuiThemeWrapper>
    </NextThemesProvider>
  )
}
