import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    console.error('EcoDex Unhandled UI Exception caught by ErrorBoundary:', error, errorInfo);
  }

  private handleRecover = () => {
    try {
      // Clear potentially corrupt temporary state
      localStorage.removeItem('ecodex_temp_discovery');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F7F4] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-leaf/30 space-y-4 animate-scaleUp">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Field Encounter Recovered
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                A visual animation glitch occurred during the transition. Your EcoDex data and species sightings remain safe.
              </p>
            </div>

            <button
              onClick={this.handleRecover}
              className="w-full py-3 px-4 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-nature flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Return to Field Journal</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
