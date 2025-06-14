import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create the context
const ThemeContext = createContext({
  mode: 'light',
  toggleColorMode: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize mode from localStorage or default to 'light'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    console.log('Initial theme mode:', savedMode || 'light');
    return savedMode || 'light';
  });

  // Toggle between light and dark mode
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      console.log('Toggling theme to:', newMode);
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  // Create the theme object
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode colors
                primary: {
                  main: '#1976d2',
                  light: '#42a5f5',
                  dark: '#1565c0',
                  contrastText: '#ffffff',
                },
                secondary: {
                  main: '#dc004e',
                  light: '#ff4081',
                  dark: '#c51162',
                  contrastText: '#ffffff',
                },
                background: {
                  default: '#f5f5f5',
                  paper: '#ffffff',
                },
                text: {
                  primary: 'rgba(0, 0, 0, 0.87)',
                  secondary: 'rgba(0, 0, 0, 0.6)',
                },
              }
            : {
                // Dark mode colors
                primary: {
                  main: '#90caf9',
                  light: '#e3f2fd',
                  dark: '#42a5f5',
                  contrastText: 'rgba(0, 0, 0, 0.87)',
                },
                secondary: {
                  main: '#f48fb1',
                  light: '#fce4ec',
                  dark: '#f06292',
                  contrastText: 'rgba(0, 0, 0, 0.87)',
                },
                background: {
                  default: '#121212',
                  paper: '#1e1e1e',
                },
                text: {
                  primary: '#ffffff',
                  secondary: 'rgba(255, 255, 255, 0.7)',
                },
              }),
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                backgroundColor: mode === 'dark' ? '#1e1e1e' : '#1976d2',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: 8,
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              },
            },
          },
        },
        shape: {
          borderRadius: 8,
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h4: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
        },
      }),
    [mode]
  );

  // Memoize the context value
  const value = useMemo(
    () => ({
      mode,
      toggleColorMode,
    }),
    [mode]
  );

  console.log('ThemeProvider rendered with mode:', mode); // Debug log

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 