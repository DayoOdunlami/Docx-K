import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-[#006E51] flex items-center justify-center">
                <span className="text-white font-bold text-sm">DX</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Doc X Platform</h1>
                <p className="text-sm text-gray-600">Connected Places Catapult</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Development
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Intelligent Document Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform structured content into intelligent, adaptive web experiences with AI chat, 
            voice narration, and role-based personalization.
          </p>
          <div className="flex justify-center space-x-4">
            <Button className="bg-[#006E51] hover:bg-[#005a43]">
              Get Started
            </Button>
            <Button variant="outline">
              View Documentation
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#006E51]">Static-First Rendering</CardTitle>
              <CardDescription>
                Pre-compiled HTML templates with content injection for instant loading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                95% of content loads instantly from pre-compiled templates
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#006E51]">AI Chat with RAG</CardTitle>
              <CardDescription>
                Natural language queries with source citations and context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Powered by OpenAI GPT-4o-mini with vector similarity search
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#006E51]">Voice Narration</CardTitle>
              <CardDescription>
                Text-to-speech with CDN caching for seamless audio experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Multiple voice options with intelligent content parsing
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#006E51]">Role-Based Content</CardTitle>
              <CardDescription>
                Personalized content based on user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Dynamic content filtering for different user types
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#006E51]">Interactive Components</CardTitle>
              <CardDescription>
                Charts, flows, maps, and checklists embedded in documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                React islands for rich interactivity within static content
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#006E51]">Multi-Layer Caching</CardTitle>
              <CardDescription>
                Edge, Redis, and database caching for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Intelligent cache invalidation and content versioning
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Section */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Development Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">✅ Task 1: Project Setup and Foundation</span>
              <span className="text-green-600 font-medium">Complete</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">✅ Task 2: Database Setup and Schema</span>
              <span className="text-green-600 font-medium">Complete</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">🔄 Task 3: UI Components and Layout</span>
              <span className="text-yellow-600 font-medium">Next</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">⏳ Task 4: Template System</span>
              <span className="text-gray-400 font-medium">Pending</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Database Setup Required</h3>
            <p className="text-sm text-blue-800 mb-3">
              Complete the database setup by running the SQL migration in your Supabase dashboard.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/DATABASE_SETUP.md', '_blank')}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              View Setup Instructions
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              © 2024 Connected Places Catapult. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Running on localhost:4000</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
