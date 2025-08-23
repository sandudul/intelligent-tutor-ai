import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/navigation';
import { LearningDashboard } from '@/components/dashboard/LearningDashboard';
import { useAuth } from '@/components/auth/AuthProvider';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <LearningDashboard />
      </main>
    </div>
  );
};

export default Dashboard;