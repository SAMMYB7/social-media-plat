import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/components/auth/use-auth';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import type { ApiError } from '@/lib/api';

// Form validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long')
});

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Registration Page Component
 * Handles new user registration with form validation and error handling
 */
export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  /**
   * Handle form submission
   */
  const handleRegistrationSubmit = async (formData: RegisterFormData): Promise<void> => {
    setRegistrationError(null);

    try {
      // Backend automatically assigns role - first user becomes admin, others are students
      await registerUser(formData);
      toast.success('Welcome! Your account has been created successfully');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setRegistrationError(errorMessage);
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
      if (apiError.status === 409) {
        return 'An account with this email already exists. Please try signing in instead.';
      }

      if (apiError.status === 0) {
        return 'Unable to connect to server. Please check your internet connection.';
      }
    }

    return 'Failed to create account. Please try again.';
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
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/40 via-accent/40 to-secondary/40 blur-xl opacity-70 animate-pulse [animation-duration:5s]"></div>
          <div className="relative rounded-2xl glass p-8 shadow-xl border backdrop-saturate-150">
            <div className="mb-8 text-center space-y-2 fade-in-up">
              <h1 className="text-4xl font-extrabold tracking-tight text-navy-700">
                Create your account
              </h1>
              <p className="text-sm text-navy-600">
                Join us and access your personalized dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit(handleRegistrationSubmit)} className="space-y-5">
              {/* Name Field */}
              <div className="space-y-1.5">
                <label 
                  htmlFor="name"
                  className="text-xs font-medium uppercase tracking-wide text-foreground/70"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  className="w-full rounded-lg bg-background/70 border border-border/70 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary/60 transition shadow-inner placeholder:text-foreground/40"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

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
                <p className="text-[10px] text-foreground/40">
                  Minimum 6 characters required.
                </p>
              </div>

              {/* Error Display */}
              {registrationError && (
                <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                  {registrationError}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/50">Already have an account?</span>
                <Link 
                  to="/login" 
                  className="text-primary hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full font-semibold h-11 text-sm button-glow"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[11px] text-foreground/50">
                By creating an account you accept our{' '}
                <span className="underline decoration-dotted cursor-pointer hover:text-foreground/70 transition-colors">
                  terms & conditions
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
