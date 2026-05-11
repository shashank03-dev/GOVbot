import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Something went wrong
            </h1>
            <p className="text-slate-500 mb-6">
              We&apos;re sorry — an unexpected error occurred. Our team has been notified.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-white border border-red-100 rounded-xl p-4 mb-6 text-left overflow-auto max-h-48">
                <p className="text-red-600 font-mono text-sm mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-slate-400 text-xs whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-gradient-to-r from-[#ff9933] to-[#e67e00] text-white font-semibold rounded-xl shadow-md hover:-translate-y-0.5 transition-all"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-600 font-medium rounded-xl transition-colors"
              >
                Go Home
              </button>
            </div>

            <p className="text-slate-300 text-xs mt-8">
              Error ID: {Math.random().toString(36).substring(7).toUpperCase()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
