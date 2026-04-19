import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    const success = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone, 
    });

    setIsLoading(false);

    if (success) {
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } else {
      toast.error("Registration failed");
    }
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
            Join Our
            <br />
            Community
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Create your account and get access to all hostel management features
            designed to make your stay comfortable.
          </p>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                ✓
              </div>
              <span>Easy room allocation & management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                ✓
              </div>
              <span>Quick complaint resolution</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                ✓
              </div>
              <span>Real-time notifications</span>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-foreground/5" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Right Panel - Register Form */}
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
            <h2 className="text-2xl font-bold text-foreground">
              Create account
            </h2>
            <p className="text-muted-foreground mt-1">
              Fill in your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@hostel.edu"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="text"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="warden">Warden</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
