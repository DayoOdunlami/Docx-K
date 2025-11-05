import { supabase, supabaseAdmin } from './client';
import { 
  DatabaseDocument, 
  DatabaseSection, 
  DatabaseDocumentInsert, 
  DatabaseSectionInsert,
  DatabaseDocumentUpdate,
  DatabaseSectionUpdate,
  DatabaseEmbedding,
  DatabaseAsset,
  DatabaseChatCache
} from './types';

// Document queries
export const documentQueries = {
  // Get all documents
  async getAll() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as DatabaseDocument[];
  },

  // Get document by slug
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data as DatabaseDocument;
  },

  // Get documents by domain
  async getByDomain(domain: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('domain', domain)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as DatabaseDocument[];
  },

  // Create document
  async create(document: DatabaseDocumentInsert) {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert(document)
      .select()
      .single();
    
    if (error) throw error;
    return data as DatabaseDocument;
  },

  // Update document
  async update(id: string, updates: DatabaseDocumentUpdate) {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DatabaseDocument;
  },

  // Delete document
  async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Section queries
export const sectionQueries = {
  // Get sections by document ID
  async getByDocumentId(documentId: string) {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('document_id', documentId)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data as DatabaseSection[];
  },

  // Get section by document slug and section slug
  async getBySlug(documentSlug: string, sectionSlug: string) {
    const { data, error } = await supabase
      .from('sections')
      .select(`
        *,
        documents!inner(slug)
      `)
      .eq('slug', sectionSlug)
      .eq('documents.slug', documentSlug)
      .single();
    
    if (error) throw error;
    return data as DatabaseSection;
  },

  // Search sections by text
  async search(query: string, documentId?: string) {
    let queryBuilder = supabase
      .from('sections')
      .select('*, documents(title, slug)')
      .textSearch('search_vector', query);
    
    if (documentId) {
      queryBuilder = queryBuilder.eq('document_id', documentId);
    }
    
    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data;
  },

  // Get sections by role
  async getByRole(role: string, documentId?: string) {
    let queryBuilder = supabase
      .from('sections')
      .select('*')
      .contains('roles', [role]);
    
    if (documentId) {
      queryBuilder = queryBuilder.eq('document_id', documentId);
    }
    
    const { data, error } = await queryBuilder
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data as DatabaseSection[];
  },

  // Create section
  async create(section: DatabaseSectionInsert) {
    const { data, error } = await supabaseAdmin
      .from('sections')
      .insert(section)
      .select()
      .single();
    
    if (error) throw error;
    return data as DatabaseSection;
  },

  // Update section
  async update(id: string, updates: DatabaseSectionUpdate) {
    const { data, error } = await supabaseAdmin
      .from('sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DatabaseSection;
  },

  // Delete section
  async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('sections')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Embedding queries
export const embeddingQueries = {
  // Get embeddings by section ID
  async getBySectionId(sectionId: string) {
    const { data, error } = await supabase
      .from('embeddings')
      .select('*')
      .eq('section_id', sectionId);
    
    if (error) throw error;
    return data as DatabaseEmbedding[];
  },

  // Vector similarity search
  async similaritySearch(embedding: number[], threshold = 0.8, limit = 10) {
    const { data, error } = await supabase.rpc('match_sections', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit
    });
    
    if (error) throw error;
    return data;
  },

  // Create embedding
  async create(embedding: Omit<DatabaseEmbedding, 'id' | 'created_at'>) {
    const { data, error } = await supabaseAdmin
      .from('embeddings')
      .insert(embedding)
      .select()
      .single();
    
    if (error) throw error;
    return data as DatabaseEmbedding;
  }
};

// Asset queries
export const assetQueries = {
  // Get assets by document ID
  async getByDocumentId(documentId: string) {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as DatabaseAsset[];
  },

  // Create asset
  async create(asset: Omit<DatabaseAsset, 'id' | 'created_at'>) {
    const { data, error } = await supabaseAdmin
      .from('assets')
      .insert(asset)
      .select()
      .single();
    
    if (error) throw error;
    return data as DatabaseAsset;
  }
};

// Chat cache queries
export const chatCacheQueries = {
  // Get cached response
  async get(queryHash: string) {
    const { data, error } = await supabase
      .from('chat_cache')
      .select('*')
      .eq('query_hash', queryHash)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
    return data as DatabaseChatCache | null;
  },

  // Set cached response
  async set(cache: Omit<DatabaseChatCache, 'id' | 'created_at'>) {
    const { data, error } = await supabaseAdmin
      .from('chat_cache')
      .upsert(cache, { onConflict: 'query_hash' })
      .select()
      .single();
    
    if (error) throw error;
    return data as DatabaseChatCache;
  },

  // Clean expired cache entries
  async cleanExpired() {
    const { error } = await supabaseAdmin
      .from('chat_cache')
      .delete()
      .lt('expires_at', new Date().toISOString());
    
    if (error) throw error;
  }
};

// Analytics queries
export const analyticsQueries = {
  // Track event
  async track(event: Omit<DatabaseAnalyticsEvent, 'id' | 'created_at'>) {
    const { error } = await supabaseAdmin
      .from('analytics_events')
      .insert(event);
    
    if (error) throw error;
  },

  // Get events by type
  async getByType(eventType: string, limit = 100) {
    const { data, error } = await supabaseAdmin
      .from('analytics_events')
      .select('*')
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};