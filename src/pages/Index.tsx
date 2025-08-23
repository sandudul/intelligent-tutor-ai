import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { AgentsDashboard } from "@/components/agents-dashboard";
import { FeaturesSection } from "@/components/features-section";
import { useAuth } from "@/components/auth/AuthProvider";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <AgentsDashboard />
        <FeaturesSection />
      </main>
      <footer className="bg-muted/30 border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 AI Tutor System. Built with advanced multi-agent architecture.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
