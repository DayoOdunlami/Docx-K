-- Step 2: Create tables (run after extensions)

-- Documents table
CREATE TABLE documents (
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
CREATE TABLE sections (
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
CREATE TABLE section_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content_mdx TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, version_number)
);

-- Embeddings table for vector similarity search
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,
  embedding vector(1536),
  model_version TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, content_hash)
);

-- Assets table for file storage
CREATE TABLE assets (
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
CREATE TABLE chat_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_hash TEXT NOT NULL UNIQUE,
  query_text TEXT NOT NULL,
  response_data JSONB NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  user_role TEXT,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);