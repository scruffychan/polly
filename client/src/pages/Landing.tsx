import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <i className="fas fa-poll text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-bold text-primary">Polly</h1>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-blue-600"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-poll text-white text-2xl"></i>
          </div>
          <h1 className="text-4xl font-bold text-text mb-4">
            Daily Dialogue for Change
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Foster meaningful dialogue around controversial topics through research-backed discussions, 
            constructive chat, and actionable civic engagement opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-question-circle text-primary text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Daily Questions</h3>
              <p className="text-gray-600">
                One thoughtfully curated question per day on controversial topics with neutral framing.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-book-open text-secondary text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Research-Backed</h3>
              <p className="text-gray-600">
                Credible, non-partisan research papers and evidence to inform discussions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-hands-helping text-accent text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Take Action</h3>
              <p className="text-gray-600">
                Discover actionable steps and civic engagement opportunities related to each topic.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-primary hover:bg-blue-600 text-lg px-8 py-3"
          >
            Join the Conversation
          </Button>
          <p className="text-sm text-gray-500 mt-3">
            Free to join • Respectful dialogue encouraged
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <i className="fas fa-poll text-white text-xs"></i>
              </div>
              <span className="font-medium text-text">Polly - Fostering dialogue for positive change</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Guidelines</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
