import { useAuth } from '@/components/auth/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router';
import type { AuthUser } from '@/lib/api';

// Types for dashboard cards
interface RoleInfo {
  icon: string;
  colorClass: string;
  displayName: string;
}

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  iconBgClass: string;
  link: string;
  roles: string[];
}

// Role configuration
const ROLE_INFO: Record<string, RoleInfo> = {
  admin: {
    icon: '👑',
    colorClass: 'bg-destructive text-destructive-foreground',
    displayName: 'Administrator'
  },
  professor: {
    icon: '🎓',
    colorClass: 'bg-primary text-primary-foreground',
    displayName: 'Professor'
  },
  student: {
    icon: '📚',
    colorClass: 'bg-secondary text-secondary-foreground',
    displayName: 'Student'
  }
};

// Dashboard cards configuration
const DASHBOARD_CARDS: DashboardCard[] = [
  {
    title: 'Admin Console',
    description: 'Manage users and system settings',
    icon: '👑',
    iconBgClass: 'bg-destructive/10',
    link: '/dashboard/admin',
    roles: ['admin']
  },
  {
    title: 'Professor Area',
    description: 'Manage courses and students',
    icon: '🎓',
    iconBgClass: 'bg-primary/10',
    link: '/dashboard/professor',
    roles: ['professor']
  },
  {
    title: 'Student Space',
    description: 'Access your courses and progress',
    icon: '📚',
    iconBgClass: 'bg-secondary/20',
    link: '/dashboard/student',
    roles: ['student']
  }
];

// Coming soon features
const COMING_SOON_CARDS = [
  { title: 'Messages', icon: '💬', description: 'Coming soon...' },
  { title: 'Analytics', icon: '📊', description: 'Coming soon...' }
];

/**
 * Get role information with fallback for unknown roles
 */
function getRoleInfo(role: string): RoleInfo {
  return ROLE_INFO[role] || {
    icon: '👤',
    colorClass: 'bg-muted text-muted-foreground',
    displayName: role || 'User'
  };
}

/**
 * Filter cards based on user role
 */
function getCardsForRole(userRole: string): DashboardCard[] {
  return DASHBOARD_CARDS.filter(card => card.roles.includes(userRole));
}

/**
 * Dashboard Page Component
 * Main dashboard with role-based quick actions and user profile
 */
export default function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const roleInfo = getRoleInfo(user.role);
  const userCards = getCardsForRole(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <DashboardHeader user={user} onLogout={logout} roleInfo={roleInfo} />

        {/* Profile Card */}
        <ProfileCard user={user} roleInfo={roleInfo} />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Role-specific cards */}
          {userCards.map((card) => (
            <ActionCard key={card.title} card={card} />
          ))}

          {/* Coming soon cards */}
          {COMING_SOON_CARDS.map((card) => (
            <ComingSoonCard key={card.title} card={card} />
          ))}
        </div>

        {/* Footer */}
        <DashboardFooter />
      </div>
    </div>
  );
}

/**
 * Dashboard Header Component
 */
interface DashboardHeaderProps {
  user: AuthUser;
  onLogout: () => void;
  roleInfo: RoleInfo;
}

function DashboardHeader({ user, onLogout, roleInfo }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome back, {user.name} {roleInfo.icon}
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's what's happening in your learning hub today.
        </p>
      </div>
      <Button variant="outline" onClick={onLogout} className="shadow-md">
        Logout
      </Button>
    </div>
  );
}

/**
 * Profile Card Component
 */
interface ProfileCardProps {
  user: AuthUser;
  roleInfo: RoleInfo;
}

function ProfileCard({ user, roleInfo }: ProfileCardProps) {
  return (
    <Card className="glass border-0 shadow-lg card-pop">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          Profile Information
          <Badge className={roleInfo.colorClass} variant="secondary">
            {roleInfo.displayName.toUpperCase()}
          </Badge>
        </CardTitle>
        <CardDescription>Your account details and current role</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Full Name</p>
            <p className="text-lg font-semibold">{user.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Email Address</p>
            <p className="text-lg font-semibold">{user.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Action Card Component
 */
interface ActionCardProps {
  card: DashboardCard;
}

function ActionCard({ card }: ActionCardProps) {
  return (
    <Card className="glass border-0 shadow-lg card-pop hover:shadow-xl transition-all cursor-pointer">
      <CardContent className="p-6">
        <Link to={card.link} className="block">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${card.iconBgClass}`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{card.title}</h3>
              <p className="text-muted-foreground text-sm">{card.description}</p>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * Coming Soon Card Component
 */
interface ComingSoonCardProps {
  card: { title: string; icon: string; description: string };
}

function ComingSoonCard({ card }: ComingSoonCardProps) {
  return (
    <Card className="glass border-0 shadow-lg opacity-60">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-muted/20">
            <span className="text-2xl">{card.icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{card.title}</h3>
            <p className="text-muted-foreground text-sm">{card.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Dashboard Footer Component
 */
function DashboardFooter() {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">
        Welcome to your social learning hub. More features coming soon! 🚀
      </p>
    </div>
  );
}
