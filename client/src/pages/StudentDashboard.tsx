import { useAuth } from '@/components/auth/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight">Learning Hub</h1>
              <Badge className="bg-secondary text-secondary-foreground">
                🎒 STUDENT
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">
              Explore courses, connect with peers, and grow your knowledge
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard">← Back to Dashboard</Link>
          </Button>
        </div>

        {/* Welcome Card */}
        <Card className="glass border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Hello, {user?.name}!</CardTitle>
            <CardDescription>
              Welcome to your personalized learning journey
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Student Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass border-0 shadow-lg card-pop">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <span className="text-2xl">📖</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">My Courses</h3>
                  <p className="text-muted-foreground text-sm">Browse enrolled courses</p>
                  <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-lg card-pop">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Assignments</h3>
                  <p className="text-muted-foreground text-sm">View and submit assignments</p>
                  <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-lg card-pop">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Study Groups</h3>
                  <p className="text-muted-foreground text-sm">Join study groups and discussions</p>
                  <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-lg card-pop">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Progress Tracking</h3>
                  <p className="text-muted-foreground text-sm">Monitor your learning progress</p>
                  <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-lg card-pop">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <span className="text-2xl">🌟</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Achievements</h3>
                  <p className="text-muted-foreground text-sm">View badges and certificates</p>
                  <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-lg card-pop">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Social Feed</h3>
                  <p className="text-muted-foreground text-sm">Connect with peers and share</p>
                  <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Social learning features will be implemented in Phase-2. Keep learning! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
