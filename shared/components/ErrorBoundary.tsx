'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                出错了
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Sorry, there was a problem loading this content.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#2d5181] text-white rounded-full hover:bg-[#1f3557] transition-all"
              >
                Refresh the page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
