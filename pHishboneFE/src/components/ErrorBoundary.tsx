import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback: ReactNode;
}

interface State {
    hasError: boolean;
}

/**
 * Generic error boundary that renders a fallback on any error.
 * Used specifically to wrap the NavAuthSection so that 401/network
 * errors from `useSuspenseQuery` show the Login/Register buttons
 * rather than crashing the entire page.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_error: Error): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // Only log unexpected errors (not 401s from auth)
        const status = (error as unknown as { response?: { status?: number } })?.response?.status;
        if (status !== 401) {
            console.error('[ErrorBoundary]', error, info);
        }
    }

    override render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}
