import { useRef, useEffect } from 'react';

/**
 * Hook personnalisé pour gérer la clé unique de la carte Leaflet
 * et éviter l'erreur "Map container is already initialized" lors du hot reload
 */
export const useMapKey = (): string => {
  const mapKeyRef = useRef<string>(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    const handleHotReload = () => {
      mapKeyRef.current = Math.random().toString(36).substr(2, 9);
    };

    // Écouter les événements de hot reload de Vite
    if (typeof window !== 'undefined') {
      // Vérifier si nous sommes en mode développement
      if (import.meta.hot) {
        import.meta.hot.on('vite:beforeUpdate', handleHotReload);
      }
      
      // Fallback: écouter les indicateurs de hot reload
      if ((window as any).__vite_plugin_react_preamble_installed) {
        handleHotReload();
      }
    }

    return () => {
      if (typeof window !== 'undefined' && import.meta.hot) {
        import.meta.hot.off('vite:beforeUpdate', handleHotReload);
      }
    };
  }, []);

  return mapKeyRef.current;
};
