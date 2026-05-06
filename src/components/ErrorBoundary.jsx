import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center relative z-50">
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 p-12 rounded-[3rem] shadow-xl max-w-md w-full">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-500 mb-8 font-medium text-sm">
              We encountered an unexpected error while loading this page. 
              {this.state.error && <span className="block mt-2 text-xs text-slate-400 bg-slate-50 p-2 rounded-lg break-words">{this.state.error.message}</span>}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-[#1D9E75] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#15825f] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} /> Reload Page
              </button>
              <Link 
                to="/dashboard" 
                className="w-full bg-white border border-gray-200 text-slate-600 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Home size={16} /> Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
