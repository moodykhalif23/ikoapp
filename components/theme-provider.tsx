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
      main: '#2d6a4f', // Brand green
      dark: '#1e4a35', // Darker green
      light: '#4a8066', // Lighter green
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff8c00', // Brand orange
      dark: '#e67c00', // Darker orange
      light: '#ffb347', // Lighter orange
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626',
      dark: '#b91c1c',
      light: '#ef4444',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      dark: '#d97706',
      light: '#fbbf24',
      contrastText: '#ffffff',
    },
    info: {
      main: '#06b6d4',
      dark: '#0891b2',
      light: '#22d3ee',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      dark: '#059669',
      light: '#34d399',
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'light' ? '#f9fafb' : '#0f172a',
      paper: mode === 'light' ? '#ffffff' : '#1e293b',
    },
    text: {
      primary: mode === 'light' ? '#111827' : '#f8fafc',
      secondary: mode === 'light' ? '#6b7280' : '#94a3b8',
      disabled: mode === 'light' ? '#d1d5db' : '#475569',
    },
    divider: mode === 'light' ? '#e5e7eb' : '#334155',
    action: {
      hover: mode === 'light' ? '#f3f4f6' : '#1e293b',
      selected: mode === 'light' ? '#e5e7eb' : '#334155',
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
          borderRadius: '6px',
          transition: 'all 0.2s ease-in-out',
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
            borderColor: '#2d6a4f', // Brand green focus border
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
