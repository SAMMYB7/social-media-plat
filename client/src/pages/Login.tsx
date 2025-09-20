import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/components/auth/use-auth';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Lottie } from '@/components/visual/Lottie';
import animationData from '@/assets/animations/Login.json';
import { ArrowLeft } from 'lucide-react';
import type { ApiError } from '@/lib/api';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login Page Component
 * Handles user authentication with form validation and error handling
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  /**
   * Handle form submission
   */
  const handleLoginSubmit = async (formData: LoginFormData): Promise<void> => {
    setLoginError(null);

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back! Login successful');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setLoginError(errorMessage);
      toast.error(errorMessage);
    }
  };

  /**
   * Extract error message from different error types
   */
  function getErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      // Handle API errors
      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }

      // Handle ApiError type
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        return 'Invalid email or password. Please try again.';
      }

      if (apiError.status === 0) {
        return 'Unable to connect to server. Please check your internet connection.';
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }

  return (
    <div className="min-h-screen w-full">
      {/* Navigation Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
          className="text-navy-600 hover:text-navy-800 hover:bg-white/20 backdrop-blur-sm"
        >
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <div className="min-h-screen w-full flex items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Animation Side */}
          <div className="hidden lg:flex flex-col items-center justify-center relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/30 via-accent/30 to-secondary/30 blur-2xl opacity-60 animate-pulse [animation-duration:6s]"></div>
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <Lottie animationData={animationData as object} />
            </div>
            <div className="mt-6 text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-navy-700">Welcome Back</h2>
              <p className="text-sm text-navy-600 max-w-sm mx-auto">
                Secure access to your personalized learning and management dashboard.
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="relative w-full max-w-md mx-auto">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/40 via-accent/40 to-secondary/40 blur-xl opacity-70 animate-pulse [animation-duration:5s]"></div>
            <div className="relative rounded-2xl glass p-8 shadow-xl border backdrop-saturate-150">
              <div className="mb-8 text-center space-y-2 fade-in-up">
                <h1 className="text-4xl font-extrabold tracking-tight text-navy-700">
                  Sign in
                </h1>
                <p className="text-sm text-navy-600">Enter your credentials to continue.</p>
              </div>

              <form onSubmit={handleSubmit(handleLoginSubmit)} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label 
                    htmlFor="email"
                    className="text-xs font-medium uppercase tracking-wide text-foreground/70"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-lg bg-background/70 border border-border/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 transition shadow-inner placeholder:text-foreground/40"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label 
                    htmlFor="password"
                    className="text-xs font-medium uppercase tracking-wide text-foreground/70"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-lg bg-background/70 border border-border/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/60 transition shadow-inner placeholder:text-foreground/40"
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Error Display */}
                {loginError && (
                  <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                    {loginError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground/50">Forgot password?</span>
                  <Link 
                    to="/register" 
                    className="text-primary hover:underline transition-colors"
                  >
                    Create account
                  </Link>
                </div>

                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-semibold h-11 text-sm button-glow"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-[11px] text-foreground/50">
                  By continuing you agree to our{' '}
                  <span className="underline decoration-dotted cursor-pointer hover:text-foreground/70 transition-colors">
                    terms
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
