import { config } from 'dotenv';

// Charger les variables d'environnement pour les tests
config({ path: '.env.test' });

// Configuration globale pour les tests
beforeAll(async () => {
  // Configuration des timeouts
  jest.setTimeout(30000);
});

afterAll(async () => {
  // Nettoyage après les tests
});

// Mock des modules externes si nécessaire
jest.mock('../src/config/database.config', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }
}));

jest.mock('../src/config/redis.config', () => ({
  getRedisClient: jest.fn(() => Promise.resolve({
    ping: jest.fn(() => Promise.resolve('PONG')),
    set: jest.fn(() => Promise.resolve('OK')),
    get: jest.fn(() => Promise.resolve(null)),
    del: jest.fn(() => Promise.resolve(1))
  }))
}));
