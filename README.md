# Doc X Platform

Intelligent document rendering and interaction system by Connected Places Catapult.

## Overview

The Doc X Platform transforms structured content into intelligent, adaptive web experiences with AI chat, voice narration, and role-based personalization. The platform uses a static-first template system with React islands for interactivity, delivering 95% of content instantly from pre-compiled templates while enabling dynamic rendering for bespoke customization when needed.

## Features

- **Static-First Rendering**: Pre-compiled HTML templates with content injection for instant loading
- **AI Chat with RAG**: Natural language queries with source citations
- **Voice Narration**: Text-to-speech with CDN caching
- **Role-Based Content**: Personalized content based on user roles
- **Hybrid Search**: PostgreSQL FTS + vector similarity search
- **Interactive Components**: Charts, flows, maps, and checklists
- **Multi-Layer Caching**: Edge, Redis, and database caching
- **Content Versioning**: Automatic version tracking and management

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.3+
- **Database**: Supabase (PostgreSQL 15 + pgvector)
- **Cache**: Upstash Redis
- **Queue**: Inngest (async jobs)
- **Storage**: Supabase Storage (CDN-backed)
- **AI**: OpenAI (GPT-4o-mini, text-embedding-3-small, TTS-1)
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Charts**: Recharts
- **Flows**: React Flow
- **Maps**: Leaflet

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Upstash Redis account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables in `.env.local`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

See `.env.example` for all required environment variables:

- **Supabase**: Database and storage
- **OpenAI**: AI chat and embeddings
- **Redis**: Caching layer
- **Inngest**: Background job processing

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   └── globals.css     # Global styles with Catapult theme
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── layout/        # Layout components
│   └── features/      # Feature-specific components
├── lib/               # Utilities and configurations
│   ├── database/      # Database client and queries
│   ├── ai/           # OpenAI integration
│   ├── cache/        # Redis and caching utilities
│   ├── theme.ts      # Catapult theme system
│   ├── env.ts        # Environment validation
│   └── constants.ts  # Application constants
├── types/            # TypeScript type definitions
└── data/             # Static data and themes
    └── themes/       # Catapult brand themes
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Catapult Branding

The platform includes Catapult brand themes for SIZ and CReDo domains:

- **Primary Color**: #006E51 (Catapult Green)
- **Secondary Color**: #E72D2B (Accessible Red)
- **Typography**: Inter font family
- **Themes**: Located in `src/data/themes/`

## Implementation Status

This project follows a spec-driven development approach. See `.kiro/specs/doc-x-platform/` for:

- `requirements.md` - Feature requirements
- `design.md` - Technical design
- `tasks.md` - Implementation tasks

### Current Status: Task 1 Complete ✅

- [x] 1.1 Initialize Next.js project with required dependencies
- [x] 1.2 Configure Catapult branding and theme system  
- [x] 1.3 Set up environment configuration and project structure

### Next Steps

Continue with Task 2: Database Setup and Schema Implementation

## License

© 2024 Connected Places Catapult. All rights reserved.
