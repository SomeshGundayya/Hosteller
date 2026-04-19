import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser) {
        toast.success('Welcome back!');
        if (loggedInUser.role === 'admin') {
          navigate('/admin');
        } else if (loggedInUser.role === 'warden') {
          navigate('/warden');
        } else {
          navigate('/student');
        }
      } else {
        toast.error('Invalid credentials. Try demo accounts below.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (email: string) => {
    setEmail(email);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
              <Home className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold">HostelHive</h1>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Smart Hostel<br />Management System
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Streamline room allocation, track complaints, and manage notices with our intelligent hostel management platform.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-primary-foreground/70 text-sm">Students Managed</p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold">98%</p>
              <p className="text-primary-foreground/70 text-sm">Complaint Resolution</p>
            </div>
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-foreground/5" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Home className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">HostelHive</h1>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@hostel.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Register here
              </Link>
            </p>
          </div>

          {/* Demo Accounts */}
          {/* <div className="mt-8 p-4 bg-muted/50 rounded-xl">
            <p className="text-sm font-medium text-foreground mb-3">Quick Demo Login:</p>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => quickLogin('rahul@hostel.edu')}
                className="text-left text-sm px-3 py-2 rounded-lg hover:bg-background transition-colors"
              >
                <span className="font-medium text-primary">Student:</span>{' '}
                <span className="text-muted-foreground">rahul@hostel.edu</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('rajesh.warden@hostel.edu')}
                className="text-left text-sm px-3 py-2 rounded-lg hover:bg-background transition-colors"
              >
                <span className="font-medium text-warning">Warden:</span>{' '}
                <span className="text-muted-foreground">rajesh.warden@hostel.edu</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('admin@hostel.edu')}
                className="text-left text-sm px-3 py-2 rounded-lg hover:bg-background transition-colors"
              >
                <span className="font-medium text-success">Admin:</span>{' '}
                <span className="text-muted-foreground">admin@hostel.edu</span>
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
