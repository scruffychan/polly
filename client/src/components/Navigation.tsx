import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Type assertion for user object
  const typedUser = user as any;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-poll text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-primary">Polly</h1>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`transition-colors ${
                location === "/" 
                  ? "text-primary font-medium" 
                  : "text-text hover:text-primary"
              }`}
            >
              Today's Question
            </Link>
            <Link 
              href="/history" 
              className={`transition-colors ${
                location === "/history" 
                  ? "text-primary font-medium" 
                  : "text-text hover:text-primary"
              }`}
            >
              History
            </Link>
            {typedUser?.isAdmin && (
              <Link 
                href="/admin" 
                className={`transition-colors ${
                  location === "/admin" 
                    ? "text-primary font-medium" 
                    : "text-text hover:text-primary"
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {typedUser && (
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                <div 
                  className="w-6 h-6 bg-secondary rounded-full bg-cover bg-center"
                  style={{ 
                    backgroundImage: typedUser.profileImageUrl 
                      ? `url(${typedUser.profileImageUrl})` 
                      : undefined 
                  }}
                >
                  {!typedUser.profileImageUrl && (
                    <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {typedUser.firstName?.[0] || typedUser.email?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {typedUser.firstName ? `${typedUser.firstName} ${typedUser.lastName || ''}`.trim() : typedUser.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-xs p-1 h-auto"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="px-4 py-2 space-y-1">
          <Link 
            href="/" 
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location === "/" 
                ? "text-primary bg-blue-50" 
                : "text-text hover:text-primary hover:bg-gray-50"
            }`}
          >
            Today's Question
          </Link>
          <Link 
            href="/history" 
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location === "/history" 
                ? "text-primary bg-blue-50" 
                : "text-text hover:text-primary hover:bg-gray-50"
            }`}
          >
            History
          </Link>
          {user?.isAdmin && (
            <Link 
              href="/admin" 
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === "/admin" 
                  ? "text-primary bg-blue-50" 
                  : "text-text hover:text-primary hover:bg-gray-50"
              }`}
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
