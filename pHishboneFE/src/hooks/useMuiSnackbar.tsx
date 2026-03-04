import React, { createContext, useCallback, useContext, useState } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

// ─── Types ───────────────────────────────────────────────────────────────────

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarState {
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
}

interface SnackbarContextValue {
    showSnackbar: (message: string, severity?: SnackbarSeverity) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success',
    });

    const showSnackbar = useCallback((message: string, severity: SnackbarSeverity = 'success') => {
        setState({ open: true, message, severity });
    }, []);

    const handleClose = useCallback((_?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setState((prev) => ({ ...prev, open: false }));
    }, []);

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <Snackbar
                open={state.open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={state.severity}
                    variant="filled"
                    sx={{ width: '100%', fontSize: '0.82rem' }}
                >
                    {state.message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMuiSnackbar(): SnackbarContextValue {
    const ctx = useContext(SnackbarContext);
    if (!ctx) {
        throw new Error('useMuiSnackbar must be used within a <SnackbarProvider>');
    }
    return ctx;
}

export default useMuiSnackbar;
