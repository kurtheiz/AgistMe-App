import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            <h1 className="text-6xl font-bold text-red-600 dark:text-red-400">Oops!</h1>
            <h2 className="mt-4 text-2xl font-semibold text-neutral-800 dark:text-neutral-100">
              Something went wrong
            </h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <div className="mt-6 space-y-4">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="block w-full px-6 py-3 rounded-lg border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                Go back home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
