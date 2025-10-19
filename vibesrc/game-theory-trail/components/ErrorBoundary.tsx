import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game Theory Trail Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-rose-900 p-8 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 max-w-2xl">
            <h1 className="text-4xl font-bold text-white mb-4">😵 Oops!</h1>
            <p className="text-red-200 mb-4">
              Something went wrong with the Game Theory Trail. Don't worry, your
              progress is safe!
            </p>
            <div className="bg-red-500/20 rounded-lg p-4 mb-6 border border-red-400/50">
              <p className="text-red-100 text-sm font-mono">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all"
            >
              🔄 Reload Game
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
