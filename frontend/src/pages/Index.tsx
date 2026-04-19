import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthReady, user } = useAuth();

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
    } else if (user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'warden':
          navigate('/warden');
          break;
        default:
          navigate('/student');
      }
    }
  }, [isAuthenticated, isAuthReady, user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">HostelHive</h1>
        <p className="text-xl text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default Index;
