// Database type definitions matching Supabase schema

export interface DatabaseDocument {
  id: string;
  title: string;
  slug: string;
  domain: string;
  template_id: string;
  theme_id?: string;
  render_mode: 'static' | 'dynamic';
  cache_key?: string;
  last_rendered?: string;
  embeddings_version: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSection {
  id: string;
  document_id: string;
  title: string;
  slug: string;
  order_index: number;
  level: number;
  content_mdx: string;
  lock_mode: 'locked' | 'semi-dynamic' | 'dynamic';
  roles: string[];
  search_vector?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSectionVersion {
  id: string;
  section_id: string;
  version_number: number;
  content_mdx: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DatabaseEmbedding {
  id: string;
  section_id: string;
  content_hash: string;
  embedding: number[];
  model_version: string;
  created_at: string;
}

export interface DatabaseAsset {
  id: string;
  document_id: string;
  filename: string;
  storage_path: string;
  cdn_url: string;
  mime_type: string;
  size_bytes?: number;
  width?: number;
  height?: number;
  alt_text?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DatabaseChatCache {
  id: string;
  query_hash: string;
  query_text: string;
  response_data: Record<string, unknown>;
  document_id?: string;
  expires_at: string;
  created_at: string;
}

export interface DatabaseAnalyticsEvent {
  id: string;
  event_type: string;
  document_id?: string;
  section_id?: string;
  user_role?: string;
  session_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Database insert types (without generated fields)
export type DatabaseDocumentInsert = Omit<DatabaseDocument, 'id' | 'created_at' | 'updated_at'>;
export type DatabaseSectionInsert = Omit<DatabaseSection, 'id' | 'created_at' | 'updated_at' | 'search_vector'>;
export type DatabaseSectionVersionInsert = Omit<DatabaseSectionVersion, 'id' | 'created_at'>;
export type DatabaseEmbeddingInsert = Omit<DatabaseEmbedding, 'id' | 'created_at'>;
export type DatabaseAssetInsert = Omit<DatabaseAsset, 'id' | 'created_at'>;
export type DatabaseChatCacheInsert = Omit<DatabaseChatCache, 'id' | 'created_at'>;
export type DatabaseAnalyticsEventInsert = Omit<DatabaseAnalyticsEvent, 'id' | 'created_at'>;

// Database update types (all fields optional except id)
export type DatabaseDocumentUpdate = Partial<Omit<DatabaseDocument, 'id' | 'created_at'>>;
export type DatabaseSectionUpdate = Partial<Omit<DatabaseSection, 'id' | 'created_at' | 'search_vector'>>;
export type DatabaseAssetUpdate = Partial<Omit<DatabaseAsset, 'id' | 'created_at'>>;

// Combined database schema type
export interface Database {
  public: {
    Tables: {
      documents: {
        Row: DatabaseDocument;
        Insert: DatabaseDocumentInsert;
        Update: DatabaseDocumentUpdate;
      };
      sections: {
        Row: DatabaseSection;
        Insert: DatabaseSectionInsert;
        Update: DatabaseSectionUpdate;
      };
      section_versions: {
        Row: DatabaseSectionVersion;
        Insert: DatabaseSectionVersionInsert;
        Update: Partial<DatabaseSectionVersionInsert>;
      };
      embeddings: {
        Row: DatabaseEmbedding;
        Insert: DatabaseEmbeddingInsert;
        Update: Partial<DatabaseEmbeddingInsert>;
      };
      assets: {
        Row: DatabaseAsset;
        Insert: DatabaseAssetInsert;
        Update: DatabaseAssetUpdate;
      };
      chat_cache: {
        Row: DatabaseChatCache;
        Insert: DatabaseChatCacheInsert;
        Update: Partial<DatabaseChatCacheInsert>;
      };
      analytics_events: {
        Row: DatabaseAnalyticsEvent;
        Insert: DatabaseAnalyticsEventInsert;
        Update: Partial<DatabaseAnalyticsEventInsert>;
      };
    };
  };
}