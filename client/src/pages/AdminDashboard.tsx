import { useAuth } from '@/components/auth/use-auth';
import { UserTable } from '@/components/UserTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Users, 
  Crown, 
  GraduationCap, 
  BookOpen, 
  BarChart3,
  Shield,
  Activity
} from 'lucide-react';
import { Link, Navigate } from 'react-router';
import { useUserStats } from '@/hooks/useUsers';

/**
 * AdminDashboard Component
 * Administrative interface for user management and system oversight
 */
export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const { data: stats, isLoading: statsLoading, error: statsError } = useUserStats();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="max-w-7xl mx-auto p-8">
          <AdminDashboardSkeleton />
        </div>
      </div>
    );
  }

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard" className="flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Shield className="h-8 w-8 text-destructive" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage users, roles, and system settings
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats?.total}
            icon={<Users className="h-4 w-4" />}
            isLoading={statsLoading}
            error={statsError}
          />
          <StatsCard
            title="Administrators"
            value={stats?.admins}
            icon={<Crown className="h-4 w-4" />}
            isLoading={statsLoading}
            error={statsError}
            color="text-destructive"
          />
          <StatsCard
            title="Professors"
            value={stats?.professors}
            icon={<GraduationCap className="h-4 w-4" />}
            isLoading={statsLoading}
            error={statsError}
            color="text-primary"
          />
          <StatsCard
            title="Students"
            value={stats?.students}
            icon={<BookOpen className="h-4 w-4" />}
            isLoading={statsLoading}
            error={statsError}
            color="text-secondary-foreground"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Analytics</h3>
                  <p className="text-muted-foreground text-sm">View system analytics</p>
                  <p className="text-xs text-muted-foreground mt-1">Coming soon...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Activity className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">System Logs</h3>
                  <p className="text-muted-foreground text-sm">Monitor system activity</p>
                  <p className="text-xs text-muted-foreground mt-1">Coming soon...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Shield className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Security</h3>
                  <p className="text-muted-foreground text-sm">Security settings</p>
                  <p className="text-xs text-muted-foreground mt-1">Coming soon...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Table */}
        <UserTable currentUserId={user.id} />

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Admin Dashboard - Manage your platform with confidence 🛡️
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * StatsCard Component
 * Displays individual statistics with loading and error states
 */
interface StatsCardProps {
  title: string;
  value?: number;
  icon: React.ReactNode;
  isLoading: boolean;
  error: unknown;
  color?: string;
}

function StatsCard({ title, value, icon, isLoading, error, color = "text-foreground" }: StatsCardProps) {
  return (
    <Card className="glass border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : error ? (
          <div className="text-sm text-destructive">Error</div>
        ) : (
          <div className={`text-2xl font-bold ${color}`}>
            {value ?? 0}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * AdminDashboardSkeleton Component
 * Loading skeleton for the admin dashboard
 */
function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
