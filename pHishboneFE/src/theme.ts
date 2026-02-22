import { createTheme, type PaletteMode } from '@mui/material/styles';

export function createAppTheme(mode: PaletteMode) {
    const isDark = mode === 'dark';

    return createTheme({
        palette: {
            mode,
            primary: {
                main: '#00BCD4',
                light: '#4DD0E1',
                dark: '#0097A7',
            },
            secondary: {
                main: '#1DE9B6',
                light: '#64FFDA',
                dark: '#00BFA5',
            },
            background: {
                default: isDark ? '#0A1628' : '#F0FAFC',
                paper: isDark ? '#0D2137' : '#FFFFFF',
            },
            text: {
                primary: isDark ? '#E8F4F8' : '#0A1628',
                secondary: isDark ? '#90CAD8' : '#3A6B7E',
            },
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: { fontWeight: 800 },
            h2: { fontWeight: 700 },
            h4: { fontWeight: 700 },
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 8,
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
        },
    });
}
