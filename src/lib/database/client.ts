import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '@/lib/env';
import { Database } from './types';

// Client-side Supabase client (uses anon key)
export const supabase: SupabaseClient<Database> = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey
);

// Server-side Supabase client (uses service role key)
export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database client factory
export const createDatabaseClient = (useServiceRole = false): SupabaseClient<Database> => {
  return useServiceRole ? supabaseAdmin : supabase;
};

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    // Try to query a simple table that should exist
    const { error } = await supabaseAdmin.rpc('version');
    
    if (error) {
      // If RPC fails, try a basic query
      const { error: queryError } = await supabaseAdmin
        .from('documents')
        .select('id')
        .limit(1);
      
      if (queryError && !queryError.message.includes('relation "public.documents" does not exist')) {
        console.error('Database connection failed:', queryError);
        return false;
      }
    }
    
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Helper function to check if tables exist
export async function checkTablesExist(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('documents')
      .select('id')
      .limit(1);
    
    // If no error or table doesn't exist error, connection is working
    return !error || error.message.includes('relation "public.documents" does not exist');
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}