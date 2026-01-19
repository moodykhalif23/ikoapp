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
      main: mode === 'light' ? '#2d6a4f' : '#4a8066', // Brand green / lighter green for dark
      dark: '#1e4a35', // Darker green
      light: '#6b9080', // Lighter green
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'light' ? '#ff8c00' : '#ffb347', // Brand orange / lighter orange for dark
      dark: '#e67c00', // Darker orange
      light: '#ffc266', // Lighter orange
      contrastText: mode === 'light' ? '#ffffff' : '#111827',
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
      default: mode === 'light' ? '#f0f7f4' : '#0a1f15',
      paper: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)',
    },
    text: {
      primary: mode === 'light' ? '#111827' : '#f8fafc',
      secondary: mode === 'light' ? '#1e4a35' : '#6b9080',
      disabled: mode === 'light' ? '#d1d5db' : '#475569',
    },
    divider: mode === 'light' ? 'rgba(45, 106, 79, 0.15)' : 'rgba(45, 106, 79, 0.3)',
    action: {
      hover: mode === 'light' ? 'rgba(240, 247, 244, 0.7)' : 'rgba(45, 106, 79, 0.15)',
      selected: mode === 'light' ? 'rgba(240, 247, 244, 0.9)' : 'rgba(45, 106, 79, 0.2)',
    },
  },
  typography: {
    fontFamily: 'inherit',
    fontSize: 14,
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '12px',
          transition: 'all 0.2s ease-in-out',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(45, 106, 79, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 16px rgba(45, 106, 79, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: mode === 'light' ? '1px solid rgba(45, 106, 79, 0.1)' : '1px solid rgba(45, 106, 79, 0.2)',
          boxShadow: mode === 'light' 
            ? '0 4px 12px rgba(45, 106, 79, 0.08)' 
            : '0 4px 12px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontSize: '0.875rem',
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            '&.Mui-focused': {
              boxShadow: 'none !important',
              backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)',
            },
            '&:focus-within': {
              boxShadow: 'none !important',
              backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? '#2d6a4f' : '#4a8066',
              borderWidth: '2px',
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
          backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          '&.Mui-focused': {
            boxShadow: 'none !important',
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            boxShadow: 'none !important',
            borderColor: mode === 'light' ? '#2d6a4f' : '#4a8066',
            borderWidth: '2px',
          },
          '&:focus-within': {
            boxShadow: 'none !important',
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)',
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
          backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          '&.Mui-focused': {
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)',
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
