import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  
  // Application URLs
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  
  // Database Configuration
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  
  // Redis/KV Configuration
  KV_URL: z.string().url().optional(),
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().min(8).optional(),
  
  // External Services - Twilio
  TWILIO_ACCOUNT_SID: z.string().startsWith('AC').optional(),
  TWILIO_AUTH_TOKEN: z.string().min(32).optional(),
  TWILIO_PHONE_NUMBER: z.string().regex(/^\+91[6-9]\d{9}$/).optional(),
  
  // External Services - Razorpay
  RAZORPAY_KEY_ID: z.string().startsWith('rzp_').optional(),
  RAZORPAY_KEY_SECRET: z.string().min(32).optional(),
  
  // Monitoring and Logging
  SENTRY_DSN: z.string().url().optional(),
  LOGTAIL_TOKEN: z.string().min(32).optional(),
  
  // Development specific
  MOCK_EXTERNAL_SERVICES: z.boolean().default(false),
  ENABLE_DEBUG_LOGS: z.boolean().default(false),
});

// Environment-specific configurations
const environmentConfigs = {
  development: {
    MOCK_EXTERNAL_SERVICES: true,
    ENABLE_DEBUG_LOGS: true,
    // Override external service URLs to point to mocks
    TWILIO_BASE_URL: 'http://localhost:8080',
    RAZORPAY_BASE_URL: 'http://localhost:8081',
  },
  staging: {
    MOCK_EXTERNAL_SERVICES: false,
    ENABLE_DEBUG_LOGS: true,
  },
  production: {
    MOCK_EXTERNAL_SERVICES: false,
    ENABLE_DEBUG_LOGS: false,
  },
};

// Parse and validate environment variables
function parseEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    const envConfig = environmentConfigs[parsed.NODE_ENV] || {};
    
    return {
      ...parsed,
      ...envConfig,
    };
  } catch (error) {
    console.error('❌ Invalid environment variables:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

// Export validated environment
export const env = parseEnv();

// Type for environment variables
export type Env = typeof env;

// Helper functions
export const isDevelopment = env.NODE_ENV === 'development';
export const isStaging = env.NODE_ENV === 'staging';
export const isProduction = env.NODE_ENV === 'production';

// Database configuration helper
export const getDatabaseConfig = () => ({
  url: env.DATABASE_URL,
  directUrl: env.DIRECT_URL || env.DATABASE_URL,
});

// Redis configuration helper
export const getRedisConfig = () => ({
  url: env.KV_URL,
  restApiUrl: env.KV_REST_API_URL,
  restApiToken: env.KV_REST_API_TOKEN,
});

// External services configuration
export const getExternalServicesConfig = () => ({
  twilio: {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    phoneNumber: env.TWILIO_PHONE_NUMBER,
    baseUrl: env.TWILIO_BASE_URL || 'https://api.twilio.com',
    isMocked: env.MOCK_EXTERNAL_SERVICES,
  },
  razorpay: {
    keyId: env.RAZORPAY_KEY_ID,
    keySecret: env.RAZORPAY_KEY_SECRET,
    baseUrl: env.RAZORPAY_BASE_URL || 'https://api.razorpay.com',
    isMocked: env.MOCK_EXTERNAL_SERVICES,
  },
});

// Monitoring configuration
export const getMonitoringConfig = () => ({
  sentry: {
    dsn: env.SENTRY_DSN,
    enabled: !!env.SENTRY_DSN && isProduction,
  },
  logtail: {
    token: env.LOGTAIL_TOKEN,
    enabled: !!env.LOGTAIL_TOKEN,
  },
  debugLogs: env.ENABLE_DEBUG_LOGS,
});
