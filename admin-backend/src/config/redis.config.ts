import { createClient, RedisClientType } from 'redis';

export const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DB || '0', 10),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true
};

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    redisClient = createClient(redisConfig);
    
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
    
    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });
    
    redisClient.on('ready', () => {
      console.log('Redis Client Ready');
    });
    
    redisClient.on('end', () => {
      console.log('Redis Client Disconnected');
    });
    
    await redisClient.connect();
  }
  
  return redisClient;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

// Cache configuration
export const cacheConfig = {
  defaultTTL: 3600, // 1 hour
  userTTL: 1800, // 30 minutes
  taskTTL: 900, // 15 minutes
  analyticsTTL: 300, // 5 minutes
  sessionTTL: 86400, // 24 hours
  rateLimitTTL: 900 // 15 minutes
};

// Queue configuration
export const queueConfig = {
  concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
  attempts: parseInt(process.env.QUEUE_ATTEMPTS || '3', 10),
  backoffDelay: parseInt(process.env.QUEUE_BACKOFF_DELAY || '2000', 10),
  removeOnComplete: 10,
  removeOnFail: 5
};
