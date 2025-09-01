import AdminBackendApp from './app';
import logger from './utils/logger';

// Créer et démarrer l'application
const app = new AdminBackendApp();

// Démarrer le serveur
app.start().catch((error) => {
  logger.error('Erreur fatale lors du démarrage:', error);
  process.exit(1);
});

export default app;
