import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1),
  
  // Redis (Upstash)
  REDIS_URL: z.string().url(),
  REDIS_TOKEN: z.string().min(1),
  
  // Inngest
  INNGEST_EVENT_KEY: z.string().min(1),
  INNGEST_SIGNING_KEY: z.string().min(1),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  // Optional
  SENTRY_DSN: z.string().url().optional(),
  VERCEL_ANALYTICS_ID: z.string().optional(),
});

// Validate and export environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment variables');
  }
}

// Export validated environment variables
export const env = validateEnv();

// Type-safe environment configuration
export const config = {
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
  redis: {
    url: env.REDIS_URL,
    token: env.REDIS_TOKEN,
  },
  inngest: {
    eventKey: env.INNGEST_EVENT_KEY,
    signingKey: env.INNGEST_SIGNING_KEY,
  },
  app: {
    url: env.NEXT_PUBLIC_APP_URL,
    nodeEnv: env.NODE_ENV,
  },
  analytics: {
    sentryDsn: env.SENTRY_DSN,
    vercelAnalyticsId: env.VERCEL_ANALYTICS_ID,
  },
} as const;

// Helper functions
export const isDevelopment = config.app.nodeEnv === 'development';
export const isProduction = config.app.nodeEnv === 'production';
export const isTest = config.app.nodeEnv === 'test';