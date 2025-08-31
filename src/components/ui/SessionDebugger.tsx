import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import Button from './Button';
import Card from './Card';
import { RefreshCw, Eye, EyeOff, Trash2, AlertCircle } from 'lucide-react';

/**
 * Composant de débogage pour diagnostiquer les problèmes de session
 * À utiliser uniquement en développement
 */
const SessionDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [cookies, setCookies] = useState<string>('');
  const [localStorage, setLocalStorage] = useState<any>(null);
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const refreshSessionInfo = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSessionInfo({ session, error });
    } catch (error) {
      setSessionInfo({ error: error.message });
    }
  };

  const refreshCookies = () => {
    setCookies(document.cookie);
  };

  const refreshLocalStorage = () => {
    try {
      // Vérifier que localStorage est disponible
      if (typeof window !== 'undefined' && window.localStorage) {
        // Utiliser la clé par défaut de Supabase
        const authData = window.localStorage.getItem('sb-wdzdfdqmvzgirgakafqeqe-auth-token');
        setLocalStorage(authData ? JSON.parse(authData) : null);
      } else {
        setLocalStorage(null);
      }
    } catch (error) {
      console.warn('Erreur lors de la lecture du localStorage:', error);
      setLocalStorage(null);
    }
  };

  const clearSession = async () => {
    try {
      await supabase.auth.signOut();
      refreshSessionInfo();
      refreshLocalStorage();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const clearLocalStorage = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Utiliser la clé par défaut de Supabase
        window.localStorage.removeItem('sb-wdzdfdqmvzgirgakafqeqe-auth-token');
        refreshLocalStorage();
      }
    } catch (error) {
      console.warn('Erreur lors de la suppression du localStorage:', error);
    }
  };

  const forceSessionRefresh = async () => {
    try {
      // Forcer la reinitialisation de la session
      await supabase.auth.refreshSession();
      refreshSessionInfo();
      refreshLocalStorage();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement forcé de la session:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      refreshSessionInfo();
      refreshCookies();
      refreshLocalStorage();
    }
  }, [isVisible]);

  // N'afficher que en développement
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Bouton toggle */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        variant="outline"
        size="sm"
        className="mb-2"
        icon={isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      >
        {isVisible ? 'Masquer' : 'Debug Session'}
      </Button>

      {/* Panel de débogage */}
      {isVisible && (
        <Card className="w-96 max-h-96 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Debug Session
              </h3>
              <Button
                onClick={refreshSessionInfo}
                variant="ghost"
                size="sm"
                icon={<RefreshCw size={16} />}
              >
                Rafraîchir
              </Button>
            </div>

            {/* État de l'authentification */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">État Zustand</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>isAuthenticated:</span>
                  <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                    {isAuthenticated ? 'true' : 'false'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>isLoading:</span>
                  <span className={isLoading ? 'text-yellow-600' : 'text-gray-600'}>
                    {isLoading ? 'true' : 'false'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>User ID:</span>
                  <span className="text-gray-600">
                    {user?.id || 'null'}
                  </span>
                </div>
              </div>
            </div>

            {/* Session Supabase */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Session Supabase</h4>
              <div className="text-sm bg-gray-50 p-2 rounded">
                <pre className="whitespace-pre-wrap text-xs">
                  {JSON.stringify(sessionInfo, null, 2)}
                </pre>
              </div>
            </div>

            {/* Cookies */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Cookies</h4>
              <div className="text-sm bg-gray-50 p-2 rounded">
                <pre className="whitespace-pre-wrap text-xs">
                  {cookies || 'Aucun cookie'}
                </pre>
              </div>
            </div>

            {/* LocalStorage */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">LocalStorage</h4>
              <div className="text-sm bg-gray-50 p-2 rounded">
                <pre className="whitespace-pre-wrap text-xs">
                  {localStorage ? JSON.stringify(localStorage, null, 2) : 'Aucune donnée'}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={clearSession}
                variant="outline"
                size="sm"
                className="flex-1"
                icon={<Trash2 size={16} />}
              >
                Déconnecter
              </Button>
              <Button
                onClick={clearLocalStorage}
                variant="outline"
                size="sm"
                className="flex-1"
                icon={<Trash2 size={16} />}
              >
                Vider LocalStorage
              </Button>
            </div>

            {/* Actions supplémentaires */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={forceSessionRefresh}
                variant="outline"
                size="sm"
                className="flex-1"
                icon={<RefreshCw size={16} />}
              >
                Rafraîchir Session
              </Button>
            </div>

            {/* Avertissement */}
            <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
              <AlertCircle size={14} />
              <span>Composant de débogage - Développement uniquement</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SessionDebugger;
