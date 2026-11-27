import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[400px] text-center bg-white rounded-2xl border border-slate-200 shadow-xs m-4">
          <div className="w-14 h-14 rounded-2xl bg-[#cb9706]/15 border border-[#cb9706]/30 text-[#844414] flex items-center justify-center mb-4">
            <AlertTriangle size={28} />
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Something went wrong in this section
          </h2>

          <p className="text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
            An unexpected error occurred while rendering this view. You can reload this view or refresh the page.
          </p>

          {this.state.error?.message && (
            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 max-w-lg overflow-x-auto text-left">
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="primary"
              icon={RefreshCw}
              onClick={this.handleReset}
            >
              Try Again
            </Button>
            <Button
              variant="secondary"
              icon={RotateCcw}
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
