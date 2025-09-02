import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Map Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50">
          <motion.div
            className="flex flex-col items-center space-y-4 p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <div className="max-w-md">
              <h3 className="text-base font-semibold text-slate-800 mb-2">
                Erreur de chargement de la carte
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Une erreur s'est produite lors du chargement de la carte. 
                Cela peut être dû à un problème de connexion ou de configuration.
              </p>
              
              {this.state.error && (
                <details className="text-[10px] text-slate-500 mb-4">
                  <summary className="cursor-pointer hover:text-slate-700">
                    Détails de l'erreur
                  </summary>
                  <pre className="mt-2 p-2 bg-slate-100 rounded text-left overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>

            <button
              onClick={this.handleRetry}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Réessayer</span>
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
