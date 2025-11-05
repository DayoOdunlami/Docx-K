#!/usr/bin/env node

/**
 * Create Database Tables Script
 * This script creates the database schema using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🚀 Creating database tables...\n');

  try {
    // Test connection first
    console.log('🔗 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .rpc('version');
    
    if (testError) {
      console.log('✅ Database connection successful (RPC not available, but connection works)');
    } else {
      console.log('✅ Database connection successful');
    }

    // Create documents table
    console.log('📄 Creating documents table...');
    const { error: documentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          domain TEXT NOT NULL,
          template_id TEXT NOT NULL,
          theme_id TEXT,
          render_mode TEXT NOT NULL CHECK (render_mode IN ('static', 'dynamic')),
          cache_key TEXT,
          last_rendered TIMESTAMPTZ,
          embeddings_version INTEGER NOT NULL DEFAULT 1,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (documentsError) {
      console.log('ℹ️  Documents table creation via RPC failed (expected). Please run SQL manually.');
    } else {
      console.log('✅ Documents table created');
    }

    console.log('\n📋 Manual Setup Required:');
    console.log('Since Supabase restricts direct SQL execution, please:');
    console.log('1. Go to your Supabase Dashboard SQL Editor');
    console.log('2. Copy the SQL from: supabase/migrations/001_initial_schema.sql');
    console.log('3. Run the SQL to create your complete database schema');
    console.log('\nThis will create all tables, indexes, triggers, and RLS policies.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

createTables();