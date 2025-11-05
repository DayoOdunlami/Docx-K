# Deployment Guide

## Vercel Deployment

This project is ready for deployment on Vercel. Follow these steps:

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click "New Project" and import your `Docx-K` repository
3. Vercel will automatically detect this as a Next.js project

### 2. Environment Variables

Before deploying, you need to set up environment variables in Vercel:

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add the following variables (get values from your service providers):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Redis Configuration (Upstash)
REDIS_URL=your_upstash_redis_url
REDIS_TOKEN=your_upstash_redis_token

# Inngest Configuration
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

### 3. Deploy

1. Click **Deploy** in Vercel
2. Vercel will build and deploy your application
3. You'll get a live URL like `https://docx-k.vercel.app`

### 4. Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## Service Setup Required

Before the application is fully functional, you'll need to set up these services:

### Supabase (Database & Storage)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get URL and API keys from Settings → API
4. Database schema will be set up in Task 2

### OpenAI (AI Features)
1. Create account at [openai.com](https://openai.com)
2. Generate API key from API Keys section
3. Ensure you have credits for GPT-4o-mini and embeddings

### Upstash Redis (Caching)
1. Create account at [upstash.com](https://upstash.com)
2. Create Redis database
3. Get connection URL and token

### Inngest (Background Jobs)
1. Create account at [inngest.com](https://inngest.com)
2. Create new app
3. Get event and signing keys

## Development vs Production

- **Development**: Uses `.env.local` file
- **Production**: Uses Vercel environment variables
- **Staging**: Can use Vercel preview deployments with separate env vars

## Monitoring

Once deployed, you can monitor your application through:
- Vercel Analytics (built-in)
- Vercel Functions logs
- Supabase dashboard
- OpenAI usage dashboard

## Next Steps

After deployment:
1. Complete Task 2: Database Setup and Schema Implementation
2. Set up database tables in Supabase
3. Configure authentication and authorization
4. Test all features in production environment