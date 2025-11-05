#!/usr/bin/env tsx

/**
 * Database Setup Script
 * 
 * This script sets up the Supabase database with:
 * - Required PostgreSQL extensions
 * - Complete database schema
 * - Row Level Security policies
 * - Indexes and triggers
 */

import { supabaseAdmin } from '../src/lib/database/client';

async function setupExtensions() {
  console.log('🔧 Setting up PostgreSQL extensions...');
  
  const extensions = [
    'CREATE EXTENSION IF NOT EXISTS "pgvector";',
    'CREATE EXTENSION IF NOT EXISTS "pg_trgm";',
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
  ];

  for (const extension of extensions) {
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: extension });
    if (error) {
      console.error(`Failed to create extension: ${extension}`, error);
    } else {
      console.log(`✅ Extension created: ${extension}`);
    }
  }
}

async function createSchema() {
  console.log('🏗️ Creating database schema...');

  const schema = `
    -- Documents table
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

    -- Sections table
    CREATE TABLE IF NOT EXISTS sections (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      content_mdx TEXT NOT NULL,
      lock_mode TEXT NOT NULL DEFAULT 'locked' CHECK (lock_mode IN ('locked', 'semi-dynamic', 'dynamic')),
      roles TEXT[] DEFAULT ARRAY['all'],
      search_vector tsvector,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(document_id, slug)
    );

    -- Section versions table for content history
    CREATE TABLE IF NOT EXISTS section_versions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      content_mdx TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(section_id, version_number)
    );

    -- Embeddings table for vector similarity search
    CREATE TABLE IF NOT EXISTS embeddings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
      content_hash TEXT NOT NULL,
      embedding vector(1536),
      model_version TEXT NOT NULL DEFAULT 'text-embedding-3-small',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(section_id, content_hash)
    );

    -- Assets table for file storage
    CREATE TABLE IF NOT EXISTS assets (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      cdn_url TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER,
      width INTEGER,
      height INTEGER,
      alt_text TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Chat cache table for AI responses
    CREATE TABLE IF NOT EXISTS chat_cache (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      query_hash TEXT NOT NULL UNIQUE,
      query_text TEXT NOT NULL,
      response_data JSONB NOT NULL,
      document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Analytics events table
    CREATE TABLE IF NOT EXISTS analytics_events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      event_type TEXT NOT NULL,
      document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
      section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
      user_role TEXT,
      session_id TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  const { error } = await supabaseAdmin.rpc('exec_sql', { sql: schema });
  if (error) {
    console.error('Failed to create schema:', error);
    return false;
  }

  console.log('✅ Database schema created successfully');
  return true;
}

async function createIndexes() {
  console.log('📊 Creating database indexes...');

  const indexes = [
    // Documents indexes
    'CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug);',
    'CREATE INDEX IF NOT EXISTS idx_documents_domain ON documents(domain);',
    'CREATE INDEX IF NOT EXISTS idx_documents_template ON documents(template_id);',
    
    // Sections indexes
    'CREATE INDEX IF NOT EXISTS idx_sections_document_id ON sections(document_id);',
    'CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(document_id, order_index);',
    'CREATE INDEX IF NOT EXISTS idx_sections_search_vector ON sections USING gin(search_vector);',
    'CREATE INDEX IF NOT EXISTS idx_sections_roles ON sections USING gin(roles);',
    
    // Embeddings indexes
    'CREATE INDEX IF NOT EXISTS idx_embeddings_section_id ON embeddings(section_id);',
    'CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);',
    
    // Assets indexes
    'CREATE INDEX IF NOT EXISTS idx_assets_document_id ON assets(document_id);',
    'CREATE INDEX IF NOT EXISTS idx_assets_mime_type ON assets(mime_type);',
    
    // Chat cache indexes
    'CREATE INDEX IF NOT EXISTS idx_chat_cache_query_hash ON chat_cache(query_hash);',
    'CREATE INDEX IF NOT EXISTS idx_chat_cache_expires_at ON chat_cache(expires_at);',
    
    // Analytics indexes
    'CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);',
    'CREATE INDEX IF NOT EXISTS idx_analytics_events_document ON analytics_events(document_id);',
    'CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);'
  ];

  for (const index of indexes) {
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: index });
    if (error) {
      console.error(`Failed to create index: ${index}`, error);
    } else {
      console.log(`✅ Index created: ${index.split(' ')[5]}`);
    }
  }
}

async function createTriggers() {
  console.log('⚡ Creating database triggers...');

  const triggers = `
    -- Function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Function to update search vector
    CREATE OR REPLACE FUNCTION update_search_vector()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.search_vector := to_tsvector('english', NEW.title || ' ' || NEW.content_mdx);
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Function to save section version
    CREATE OR REPLACE FUNCTION save_section_version()
    RETURNS TRIGGER AS $$
    DECLARE
      next_version INTEGER;
    BEGIN
      -- Get next version number
      SELECT COALESCE(MAX(version_number), 0) + 1 
      INTO next_version 
      FROM section_versions 
      WHERE section_id = NEW.id;
      
      -- Insert new version
      INSERT INTO section_versions (section_id, version_number, content_mdx, metadata)
      VALUES (NEW.id, next_version, NEW.content_mdx, NEW.metadata);
      
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Triggers for updated_at
    DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
    CREATE TRIGGER update_documents_updated_at
      BEFORE UPDATE ON documents
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_sections_updated_at ON sections;
    CREATE TRIGGER update_sections_updated_at
      BEFORE UPDATE ON sections
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Trigger for search vector
    DROP TRIGGER IF EXISTS update_sections_search_vector ON sections;
    CREATE TRIGGER update_sections_search_vector
      BEFORE INSERT OR UPDATE ON sections
      FOR EACH ROW EXECUTE FUNCTION update_search_vector();

    -- Trigger for section versioning
    DROP TRIGGER IF EXISTS save_section_version_trigger ON sections;
    CREATE TRIGGER save_section_version_trigger
      AFTER UPDATE ON sections
      FOR EACH ROW EXECUTE FUNCTION save_section_version();
  `;

  const { error } = await supabaseAdmin.rpc('exec_sql', { sql: triggers });
  if (error) {
    console.error('Failed to create triggers:', error);
    return false;
  }

  console.log('✅ Database triggers created successfully');
  return true;
}

async function setupRowLevelSecurity() {
  console.log('🔒 Setting up Row Level Security...');

  const rls = `
    -- Enable RLS on all tables
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE section_versions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE chat_cache ENABLE ROW LEVEL SECURITY;
    ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

    -- Basic policies (will be expanded based on authentication requirements)
    CREATE POLICY "Allow public read access to documents" ON documents FOR SELECT USING (true);
    CREATE POLICY "Allow public read access to sections" ON sections FOR SELECT USING (true);
    CREATE POLICY "Allow public read access to assets" ON assets FOR SELECT USING (true);
    
    -- Service role has full access
    CREATE POLICY "Service role full access documents" ON documents FOR ALL USING (auth.role() = 'service_role');
    CREATE POLICY "Service role full access sections" ON sections FOR ALL USING (auth.role() = 'service_role');
    CREATE POLICY "Service role full access section_versions" ON section_versions FOR ALL USING (auth.role() = 'service_role');
    CREATE POLICY "Service role full access embeddings" ON embeddings FOR ALL USING (auth.role() = 'service_role');
    CREATE POLICY "Service role full access assets" ON assets FOR ALL USING (auth.role() = 'service_role');
    CREATE POLICY "Service role full access chat_cache" ON chat_cache FOR ALL USING (auth.role() = 'service_role');
    CREATE POLICY "Service role full access analytics_events" ON analytics_events FOR ALL USING (auth.role() = 'service_role');
  `;

  const { error } = await supabaseAdmin.rpc('exec_sql', { sql: rls });
  if (error) {
    console.error('Failed to setup RLS:', error);
    return false;
  }

  console.log('✅ Row Level Security configured successfully');
  return true;
}

async function main() {
  console.log('🚀 Starting database setup...\n');

  try {
    await setupExtensions();
    await createSchema();
    await createIndexes();
    await createTriggers();
    await setupRowLevelSecurity();

    console.log('\n🎉 Database setup completed successfully!');
    console.log('Your Supabase database is now ready for the Doc X Platform.');
  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
main();