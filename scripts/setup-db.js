#!/usr/bin/env node

/**
 * Simple Database Setup Script
 * Run this to set up your Supabase database schema
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

async function setupDatabase() {
  console.log('🚀 Setting up database schema...\n');

  try {
    // Test connection
    console.log('🔗 Testing database connection...');
    const { data, error } = await supabase.from('information_schema.tables').select('table_name').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful\n');

    // Note: The actual schema creation needs to be done via Supabase Dashboard
    // or SQL Editor due to security restrictions
    
    console.log('📋 Next steps:');
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL from: supabase/migrations/001_initial_schema.sql');
    console.log('4. Run the SQL to create your database schema');
    console.log('\nAlternatively, you can run the SQL directly in your database.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupDatabase();