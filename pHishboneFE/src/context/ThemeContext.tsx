import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '../theme';

type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
    mode: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'phishbone-theme-mode';

function getInitialMode(): ThemeMode {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
    } catch {
        // localStorage unavailable
    }
    return 'dark';
}

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>(getInitialMode);

    const toggleTheme = useCallback(() => {
        setMode((prev) => {
            const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // ignore
            }
            return next;
        });
    }, []);

    const theme = useMemo(() => createAppTheme(mode), [mode]);

    const contextValue = useMemo<ThemeContextValue>(
        () => ({ mode, toggleTheme }),
        [mode, toggleTheme]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useThemeMode(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useThemeMode must be used within ThemeContextProvider');
    return ctx;
}
