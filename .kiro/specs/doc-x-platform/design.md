# Design Document

## Overview

The Doc X Platform is an intelligent document rendering and interaction system built with Next.js 15, designed to transform structured content into fast, interactive web experiences. The platform uses a static-first architecture with React islands, delivering 95% of content instantly from pre-compiled templates while supporting dynamic rendering for customization.

**Core Innovation:** Static-first template system with content injection slots, combined with hybrid search (FTS + RAG) and multi-layer caching for optimal performance and cost efficiency.

## Architecture

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      User Browser                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Static Pages │  │ React Islands│  │  Service     │    │
│  │  (Instant)   │  │  (Chat/Voice)│  │  Worker      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└───────────────────────────┬────────────────────────────────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
                ▼           ▼           ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │   Edge   │  │   API    │  │  CDN     │
        │  Cache   │  │  Routes  │  │ (Assets) │
        └──────────┘  └──────────┘  └──────────┘
                │           │           │
                └───────────┼───────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        ┌─────────────┐         ┌─────────────┐
        │   Redis     │         │  Supabase   │
        │   Cache     │         │  Database   │
        │             │         │             │
        │ • Queries   │         │ • Documents │
        │ • Compiled  │         │ • Sections  │
        │ • Results   │         │ • Embeddings│
        └─────────────┘         │ • Assets    │
                                │ • Versions  │
                                └─────────────┘
                                        │
                                        ▼
                                ┌─────────────┐
                                │   Inngest   │
                                │   Queue     │
                                │             │
                                │ • Embeddings│
                                │ • Analytics │
                                │ • Cleanup   │
                                └─────────────┘
```

### Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.3+
- **Database:** Supabase (PostgreSQL 15 + pgvector)
- **Cache:** Upstash Redis
- **Queue:** Inngest (async jobs)
- **Storage:** Supabase Storage (CDN-backed)
- **AI:** OpenAI (GPT-4o-mini, text-embedding-3-small, TTS-1)
- **Search:** PostgreSQL FTS + pgvector (hybrid)
- **Content:** MDX (stored in database)
- **UI:** Tailwind CSS 4 + shadcn/ui
- **Charts:** Recharts
- **Flows:** React Flow
- **Maps:** Leaflet
- **Deployment:** Vercel Edge

## Components and Interfaces

### 1. Static-First Template System

**Core Innovation:** Pre-compiled HTML templates with content injection slots for 10x faster rendering.

#### Template Types

1. **playbook-staged-static.html** - Step-by-step processes with stage navigation
2. **guide-linear-static.html** - Chapter-based navigation with TOC
3. **reference-grid-static.html** - Searchable card layouts

#### Rendering Decision Tree

```
User requests /siz/playbook
         ↓
Check document.render_mode
         ↓
    ┌────────┴────────┐
    │                 │
  STATIC           DYNAMIC
(95% of requests)  (5% of requests)
    │                 │
    ↓                 ↓
Load cached HTML   Render React
     + CSS              + compile MDX
    │                 │
    ↓                 ↓
  ~50ms             ~500ms
    │                 │
    └────────┬────────┘
             ↓
   Hydrate React Islands:
   - Chat widget
   - Voice player
   - Interactive components
   - Role switcher
```

#### Template Structure

```html
<!-- templates/playbook-staged.html -->
<div class="hero">
  <h1 data-slot="hero-title"></h1>
  <p data-slot="hero-description"></p>
</div>

<nav class="stage-nav" data-slot="stage-navigation"></nav>
<main class="content" data-slot="main-content"></main>

<!-- React Island for chat -->
<div id="chat-island"></div>
```

#### Content Injection (Fast Path)

```typescript
// Server-side: String replacement
const html = template
  .replace('[hero-title]', sanitize(document.title))
  .replace('[main-content]', markdownToHtml(sections));

// Cache at edge for 1 hour
return new Response(html, {
  headers: { 'Cache-Control': 'public, max-age=3600' }
});
```

### 2. Multi-Layer Caching Strategy

#### Cache Layers

```typescript
// Layer 1: Edge Cache (Vercel/Cloudflare)
// Static HTML, CSS, compiled templates
// TTL: 1 hour, invalidate on content update

// Layer 2: Redis Cache (Upstash)
// - Common chat queries + responses
// - Compiled MDX outputs
// - Search results
// TTL: 5 minutes, LRU eviction

// Layer 3: Database Cache (Supabase)
// - Embeddings (never expire, regenerate on change)
// - Pre-compiled MDX (invalidate on update)

// Layer 4: CDN Cache (Supabase Storage)
// - TTS audio files
// - Images/assets
// TTL: 7 days
```

#### Cache Invalidation

```typescript
async function invalidateCache(documentId: string) {
  // 1. Purge edge cache
  await fetch(`/api/purge?document=${documentId}`);
  
  // 2. Clear Redis keys
  await redis.del(`doc:${documentId}:*`);
  
  // 3. Mark embeddings stale
  await db.update('documents')
    .set({ embeddings_version: embeddings_version + 1 })
    .where({ id: documentId });
  
  // 4. Trigger background job to regenerate
  await queue.enqueue('regenerate-embeddings', { documentId });
}
```

### 3. Hybrid Search System

#### Two-Stage Search Strategy

```typescript
// Stage 1: PostgreSQL Full-Text Search (instant)
const keywordResults = await db.query(`
  SELECT id, title, ts_rank(search_vector, query) as rank
  FROM sections
  WHERE search_vector @@ plainto_tsquery('english', $1)
  ORDER BY rank DESC
  LIMIT 10
`, [query]);

// If keyword results are good (rank > 0.3), return them
// Else: Stage 2: Semantic Search (RAG)

// Stage 2: Vector Similarity Search (intelligent)
const embedding = await openai.embeddings.create({
  input: query,
  model: 'text-embedding-3-small'
});

const semanticResults = await db.query(`
  SELECT s.id, s.title, s.content_mdx,
         1 - (e.embedding <=> $1) as similarity
  FROM embeddings e
  JOIN sections s ON e.section_id = s.id
  WHERE 1 - (e.embedding <=> $1) > 0.7
  ORDER BY similarity DESC
  LIMIT 5
`, [embedding.data[0].embedding]);
```

#### Search Decision Logic

```typescript
function chooseSearchStrategy(query: string) {
  // Simple keywords → FTS (fast, cheap)
  if (query.length < 50 && !hasComplexIntent(query)) {
    return 'fts';
  }
  
  // Complex question → RAG (smart, expensive)
  return 'rag';
}
```

### 4. Content Versioning System

#### Automatic Version Tracking

```sql
-- Every update creates new version
CREATE TRIGGER version_sections
  BEFORE UPDATE ON sections
  FOR EACH ROW
  EXECUTE FUNCTION save_section_version();

-- Version history
SELECT version, content_mdx, changed_by, created_at
FROM section_versions
WHERE section_id = $1
ORDER BY version DESC;
```

#### Version Management API

```typescript
// Get version history
GET /api/content/[sectionId]/versions

// Revert to version
POST /api/content/[sectionId]/revert
{ "version": 3 }

// Compare versions
GET /api/content/[sectionId]/diff?from=3&to=5
// Returns: { added: [...], removed: [...], changed: [...] }
```

### 5. Asset Management System

#### Storage and CDN Integration

```typescript
// Upload asset
POST /api/assets/upload
Content-Type: multipart/form-data
{
  file: <binary>,
  documentId: "siz-playbook",
  alt: "Safety diagram"
}

Response: {
  assetId: "uuid",
  url: "https://storage.supabase.co/doc-x/siz/safety-diagram.png"
}
```

#### Asset Processing Pipeline

```typescript
// On upload:
// 1. Store in Supabase Storage
// 2. Generate thumbnails (if image)
// 3. Create CDN URLs
// 4. Link to document in database

CREATE TABLE assets (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  filename TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  cdn_url TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  metadata JSONB, -- dimensions, alt text, etc
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Voice Narration System

#### TTS with CDN Caching

```typescript
// Generate TTS for section
POST /api/voice/tts
{
  "sectionId": "uuid",
  "voice": "alloy",
  "speed": 1.0
}

// Flow:
// 1. Check if audio exists in Supabase Storage
const audioUrl = await storage.getUrl(`audio/${sectionId}-${voice}-${speed}.mp3`);

if (audioUrl) {
  return { url: audioUrl, cached: true };
}

// 2. Generate via OpenAI TTS
const audio = await openai.audio.speech.create({
  model: "tts-1",
  voice: voice,
  input: sectionText
});

// 3. Upload to Supabase Storage (CDN-backed)
const { url } = await storage.upload(
  `audio/${sectionId}-${voice}-${speed}.mp3`,
  audio
);

// 4. Return CDN URL
return { url, cached: false };
```

### 7. Interactive Components System

#### Component Registry

```typescript
export const COMPONENTS = {
  'data-chart': {
    component: DataChart,
    schema: z.object({
      type: z.enum(['bar', 'line', 'pie', 'area']),
      data: z.array(z.object({
        name: z.string(),
        value: z.number()
      })),
      title: z.string()
    }),
    preview: '/previews/data-chart.png',
    description: 'Interactive data visualization using Recharts'
  },
  
  'process-flow': {
    component: ProcessFlow,
    schema: z.object({
      nodes: z.array(z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(['default', 'input', 'output'])
      })),
      edges: z.array(z.object({
        source: z.string(),
        target: z.string(),
        label: z.string().optional()
      }))
    }),
    preview: '/previews/process-flow.png',
    description: 'Process flow diagram with React Flow'
  }
};
```

#### Usage in MDX

```markdown
# Risk Assessment

<DataChart
  type="bar"
  data={[
    { name: "High", value: 12 },
    { name: "Medium", value: 24 },
    { name: "Low", value: 8 }
  ]}
  title="Risk Distribution by Level"
/>

<ProcessFlow
  nodes={[
    { id: "1", label: "Identify Risk", type: "input" },
    { id: "2", label: "Assess Impact", type: "default" },
    { id: "3", label: "Mitigate", type: "output" }
  ]}
  edges={[
    { source: "1", target: "2", label: "analyze" },
    { source: "2", target: "3", label: "implement" }
  ]}
/>
```

## Data Models

### Core Database Schema

```sql
-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT NOT NULL,
  template_id TEXT NOT NULL,
  theme_id TEXT,
  
  -- Rendering mode
  render_mode TEXT DEFAULT 'static', -- 'static' or 'dynamic'
  cache_key TEXT,
  last_rendered TIMESTAMPTZ,
  
  -- Versioning
  embeddings_version INTEGER DEFAULT 1,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sections
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  level INTEGER DEFAULT 1,
  content_mdx TEXT NOT NULL,
  lock_mode TEXT DEFAULT 'dynamic',
  roles TEXT[] DEFAULT ARRAY['all'],
  
  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || content_mdx)
  ) STORED,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, slug)
);

-- Section versions
CREATE TABLE section_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content_mdx TEXT NOT NULL,
  changed_by TEXT,
  change_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, version)
);

-- Embeddings
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536),
  
  -- Versioning
  embeddings_version INTEGER DEFAULT 1,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  cdn_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER,
  
  -- Image metadata
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat cache
CREATE TABLE chat_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  query_hash TEXT UNIQUE NOT NULL,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  citations JSONB,
  hit_count INTEGER DEFAULT 0,
  avg_latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_hit TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

### TypeScript Interfaces

```typescript
export interface Document {
  id: string;
  title: string;
  slug: string;
  domain: string;
  templateId: string;
  themeId?: string;
  renderMode: 'static' | 'dynamic';
  cacheKey?: string;
  lastRendered?: Date;
  embeddingsVersion: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  documentId: string;
  title: string;
  slug: string;
  orderIndex: number;
  level: number;
  contentMdx: string;
  lockMode: 'locked' | 'semi-dynamic' | 'dynamic';
  roles: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  confidence?: number;
  cached?: boolean;
  latencyMs?: number;
}

export interface Citation {
  sectionId: string;
  sectionTitle: string;
  excerpt: string;
  relevance: number;
}
```

## Error Handling

### API Error Responses

```typescript
// Standardized error format
interface APIError {
  error: string;
  message: string;
  code?: string;
  details?: any;
}

// Error handling middleware
export function handleAPIError(error: unknown): Response {
  if (error instanceof z.ZodError) {
    return NextResponse.json({
      error: 'Validation failed',
      details: error.errors
    }, { status: 400 });
  }
  
  if (error instanceof DatabaseError) {
    return NextResponse.json({
      error: 'Database error',
      message: 'Internal server error'
    }, { status: 500 });
  }
  
  return NextResponse.json({
    error: 'Unknown error',
    message: 'An unexpected error occurred'
  }, { status: 500 });
}
```

### Graceful Degradation

```typescript
// Chat fallback when AI is unavailable
export async function getChatResponse(query: string, documentId: string) {
  try {
    return await generateRAGResponse(query, documentId);
  } catch (error) {
    // Fallback to keyword search
    return await keywordSearchFallback(query, documentId);
  }
}

// Voice fallback when TTS fails
export async function getVoiceAudio(sectionId: string) {
  try {
    return await generateTTS(sectionId);
  } catch (error) {
    // Return text-only response
    return { 
      error: 'Voice unavailable', 
      fallback: 'text',
      message: 'Audio generation temporarily unavailable'
    };
  }
}
```

## Testing Strategy

### Unit Tests
- Template rendering functions
- Search algorithms (FTS and vector)
- Cache invalidation logic
- Content versioning operations

### Integration Tests
- API endpoints with database
- File upload and asset processing
- Background job processing
- Cache layer interactions

### Performance Tests
- Page load times (target: <100ms static, <2s dynamic)
- Search latency (target: <50ms FTS, <1.5s RAG)
- Cache hit rates (target: >85%)
- Concurrent user handling

### E2E Tests
- Complete user workflows
- Role-based content filtering
- Chat interactions with citations
- Voice playback functionality
- Content versioning and reversion

## Catapult Customization

### Brand Integration

```typescript
// Catapult theme configuration
export const CATAPULT_THEME = {
  colors: {
    primary: "#006E51", // Catapult Green
    secondary: "#E72D2B", // Accessible Red
    accent: "#EF7A1E", // Orange
    charcoal: "#2E2D2B",
    darkBlue: "#122836",
    // ... full palette from brand guidelines
  },
  typography: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif"
  }
};
```

### Content Strategy

```typescript
// SIZ content from website scraping
const SIZ_SOURCES = [
  'https://cp.catapult.org.uk/station-innovation/introduction',
  'https://cp.catapult.org.uk/station-innovation/discovery',
  'https://cp.catapult.org.uk/station-innovation/planning',
  // ... additional pages
];

// CReDo content from PDF conversion
const CREDO_SOURCES = [
  'credo-whitepaper.pdf',
  'trial-guidance.pdf'
];
```

This design provides a comprehensive technical foundation for building the Doc X Platform with all the architectural details, database schemas, API contracts, and Catapult-specific customizations needed for implementation.