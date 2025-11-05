# Database Setup Instructions

## 🚀 Quick Setup

Your Supabase project is configured and ready! Follow these steps to create the database schema:

### Step 1: Access Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **DOCXK** (`ogsppgjztghorzunrauo`)
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Schema Migration

1. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the migration

This will create:
- ✅ All required PostgreSQL extensions (pgvector, pg_trgm, uuid-ossp)
- ✅ Complete database schema (7 tables)
- ✅ Indexes for optimal performance
- ✅ Triggers for automatic updates
- ✅ Row Level Security policies

### Step 3: Verify Setup

Run this command to test your database connection:

```bash
npm run db:setup
```

## 📊 Database Schema Overview

### Core Tables

1. **documents** - Main document metadata
2. **sections** - Document sections with content
3. **section_versions** - Content version history
4. **embeddings** - Vector embeddings for AI search
5. **assets** - File attachments and media
6. **chat_cache** - Cached AI responses
7. **analytics_events** - Usage tracking

### Key Features

- **Vector Search**: pgvector extension for AI-powered similarity search
- **Full-Text Search**: PostgreSQL's built-in text search with tsvector
- **Automatic Versioning**: Triggers save content history automatically
- **Role-Based Access**: Sections can be filtered by user roles
- **Performance Optimized**: Comprehensive indexing strategy

## 🔧 Advanced Configuration

### Custom Functions Created

- `update_updated_at_column()` - Auto-updates timestamps
- `update_search_vector()` - Maintains search indexes
- `save_section_version()` - Creates version history

### Security Policies

- Public read access to documents, sections, and assets
- Service role has full access to all tables
- Row Level Security enabled on all tables

## 🧪 Testing the Setup

After running the migration, you can test the database with:

```typescript
import { testDatabaseConnection } from '@/lib/database/client';

// Test connection
const isConnected = await testDatabaseConnection();
console.log('Database connected:', isConnected);
```

## 📝 Next Steps

Once the database is set up:

1. ✅ Database schema is ready
2. ⏭️ Continue with Task 3: UI Components and Layout
3. 🔄 Start building the document templates
4. 🤖 Implement AI chat functionality

Your Doc X Platform database is now ready for development! 🎉