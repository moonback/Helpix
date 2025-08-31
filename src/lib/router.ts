import { createBrowserRouter } from 'react-router-dom';

/**
 * Configuration des futures flags pour React Router
 * Élimine les avertissements de dépréciation
 */
export const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

/**
 * Créer le routeur avec la configuration des futures flags
 */
export const createRouter = (routes: any) => {
  return createBrowserRouter(routes, {
    future: routerConfig.future,
  });
};
