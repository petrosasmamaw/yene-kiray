import React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert, ChevronDown } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 [ErrorBoundary] Caught client-side crash:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-neutral-900 text-white font-sans">
          <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
            
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            {/* Error Headings */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                የሲስተም ችግር አጋጥሟል
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                ያልተጠበቀ የስህተት ችግር ተከስቷል። እባክዎ ገጹን እንደገና ይሞክሩ ወይም ወደ መነሻ ገጽ ይመለሱ።
              </p>
              <p className="text-[11px] text-slate-500">
                (An unexpected system issue occurred. You can reload or return home.)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ዳግም ሞክር (Try Again)</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
              >
                <Home className="w-4 h-4" />
                <span>ወደ መነሻ ገጽ (Home)</span>
              </button>
            </div>

            {/* Collapsible Error Debug Details */}
            {this.state.error && (
              <div className="pt-4 border-t border-slate-800/80 text-left">
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                    ቴክኒካዊ ዝርዝር (Technical Details)
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`} />
                </button>

                {this.state.showDetails && (
                  <div className="mt-2.5 p-3 rounded-xl bg-black/60 border border-slate-800 text-[10px] font-mono text-rose-300 overflow-x-auto max-h-40 leading-relaxed">
                    <p className="font-bold text-rose-400 mb-1">{this.state.error?.toString()}</p>
                    <pre className="text-slate-400 whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
