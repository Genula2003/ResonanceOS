import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-4 text-center">
                    <div className="bg-red-100 p-4 rounded-full mb-4">
                        <AlertTriangle className="h-12 w-12 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        The application encountered an unexpected error. Please try reloading the page.
                    </p>
                    <div className="bg-white p-4 rounded border mb-6 w-full max-w-lg text-left overflow-auto max-h-40">
                        <code className="text-xs text-red-500 font-mono">
                            {this.state.error?.message}
                        </code>
                    </div>
                    <Button onClick={this.handleReload}>Reload Application</Button>
                </div>
            );
        }

        return this.props.children;
    }
}
