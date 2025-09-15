import { PrismaClient } from './generated';
import { env } from '@zergoqr/config';

// Global Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client with environment-specific configuration
function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: env.ENABLE_DEBUG_LOGS 
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
  });
}

// Use global instance in development to prevent multiple connections
export const prisma = globalThis.__prisma ?? createPrismaClient();

if (env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Export Prisma types
export * from './generated';

// Database utilities
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    };
  }
}

// Transaction helper
export async function withTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(callback);
}

// Cleanup function for graceful shutdown
export async function cleanup() {
  await disconnectDatabase();
}
