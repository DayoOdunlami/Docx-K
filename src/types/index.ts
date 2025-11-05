// Core application types

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
  metadata: Record<string, unknown>;
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
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  documentId: string;
  filename: string;
  storagePath: string;
  cdnUrl: string;
  mimeType: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  altText?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
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

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  relevance: number;
  type: 'keyword' | 'semantic';
}

export interface VoiceOptions {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number; // 0.75 to 1.5
}

export interface InteractiveComponent {
  type: string;
  props: Record<string, unknown>;
  schema: unknown; // Zod schema
}

// API Response types
export interface APIResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Environment types
export interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  openai: {
    apiKey: string;
  };
  redis: {
    url: string;
    token: string;
  };
  inngest: {
    eventKey: string;
    signingKey: string;
  };
  app: {
    url: string;
    nodeEnv: string;
  };
}