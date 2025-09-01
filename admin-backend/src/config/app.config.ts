import dotenv from 'dotenv';

dotenv.config();

export const appConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  logLevel: process.env.LOG_LEVEL || 'info',
  prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9090', 10),
  helmetCspEnabled: process.env.HELMET_CSP_ENABLED === 'true',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@entraide-universelle.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin_password_123'
};

export const isDevelopment = appConfig.nodeEnv === 'development';
export const isProduction = appConfig.nodeEnv === 'production';
export const isTest = appConfig.nodeEnv === 'test';
