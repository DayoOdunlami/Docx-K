// Application constants

export const APP_NAME = 'Doc X Platform';
export const APP_DESCRIPTION = 'Intelligent document rendering and interaction system';

// Template types
export const TEMPLATE_TYPES = {
  PLAYBOOK_STAGED: 'playbook-staged',
  GUIDE_LINEAR: 'guide-linear',
  REFERENCE_GRID: 'reference-grid',
} as const;

export type TemplateType = typeof TEMPLATE_TYPES[keyof typeof TEMPLATE_TYPES];

// Render modes
export const RENDER_MODES = {
  STATIC: 'static',
  DYNAMIC: 'dynamic',
} as const;

export type RenderMode = typeof RENDER_MODES[keyof typeof RENDER_MODES];

// Lock modes for content
export const LOCK_MODES = {
  LOCKED: 'locked',
  SEMI_DYNAMIC: 'semi-dynamic',
  DYNAMIC: 'dynamic',
} as const;

export type LockMode = typeof LOCK_MODES[keyof typeof LOCK_MODES];

// Search types
export const SEARCH_TYPES = {
  KEYWORD: 'keyword',
  SEMANTIC: 'semantic',
  HYBRID: 'hybrid',
} as const;

export type SearchType = typeof SEARCH_TYPES[keyof typeof SEARCH_TYPES];

// Voice options
export const VOICE_OPTIONS = {
  ALLOY: 'alloy',
  ECHO: 'echo',
  FABLE: 'fable',
  ONYX: 'onyx',
  NOVA: 'nova',
  SHIMMER: 'shimmer',
} as const;

export type VoiceOption = typeof VOICE_OPTIONS[keyof typeof VOICE_OPTIONS];

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  EDGE: 3600, // 1 hour
  REDIS: 300, // 5 minutes
  CHAT_RESPONSE: 300, // 5 minutes
  AUDIO: 604800, // 7 days
} as const;

// API limits
export const API_LIMITS = {
  CHAT_QUERY_MAX_LENGTH: 1000,
  UPLOAD_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  SEARCH_RESULTS_LIMIT: 10,
  EMBEDDING_BATCH_SIZE: 100,
} as const;

// Default roles
export const DEFAULT_ROLES = [
  'all',
  'admin',
  'manager',
  'operator',
  'technician',
  'safety-officer',
] as const;

export type DefaultRole = typeof DEFAULT_ROLES[number];

// Component types for interactive elements
export const COMPONENT_TYPES = {
  DATA_CHART: 'data-chart',
  PROCESS_FLOW: 'process-flow',
  INTERACTIVE_MAP: 'interactive-map',
  CHECKLIST: 'checklist',
} as const;

export type ComponentType = typeof COMPONENT_TYPES[keyof typeof COMPONENT_TYPES];