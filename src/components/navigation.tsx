import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/auth/AuthProvider";
import { Menu, X, Brain, User, LogOut } from "lucide-react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="p-2 rounded-lg gradient-primary">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">AI Tutor</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-smooth">
            Home
          </Link>
          <a href="#agents" className="text-sm font-medium hover:text-primary transition-smooth">
            AI Agents
          </a>
          <a href="#features" className="text-sm font-medium hover:text-primary transition-smooth">
            Features
          </a>
          {user && (
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-smooth">
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="hidden md:inline-flex"
              >
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => signOut()}
                className="hidden md:inline-flex"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/auth')}
                className="hidden md:inline-flex"
              >
                Sign In
              </Button>
              <Button 
                variant="hero" 
                size="sm"
                onClick={() => navigate('/auth')}
                className="hidden md:inline-flex"
              >
                Get Started
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link to="/" className="block text-sm font-medium hover:text-primary transition-smooth">
              Home
            </Link>
            <a href="#agents" className="block text-sm font-medium hover:text-primary transition-smooth">
              AI Agents
            </a>
            <a href="#features" className="block text-sm font-medium hover:text-primary transition-smooth">
              Features
            </a>
            {user && (
              <Link to="/dashboard" className="block text-sm font-medium hover:text-primary transition-smooth">
                Dashboard
              </Link>
            )}
            <div className="pt-4 border-t space-y-2">
              <ThemeToggle />
              {user ? (
                <Button variant="ghost" size="sm" className="w-full" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}