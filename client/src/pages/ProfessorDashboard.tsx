import { useAuth } from '@/components/auth/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router';

export default function ProfessorDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight">Teaching Hub</h1>
              <Badge className="bg-primary text-primary-foreground">
                🎓 PROFESSOR
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">
              Create courses, manage students, and share knowledge
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard">← Back to Dashboard</Link>
          </Button>
        </div>

        {/* Welcome Card */}
        <Card className="glass border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Welcome back, Professor {user?.name}</CardTitle>
            <CardDescription>
              Ready to inspire and educate the next generation of learners
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Professor Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass border-0 shadow-lg card-pop">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Course Management</h3>
                  <p className="text-muted-foreground text-sm">Create and organize courses</p>
                  <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-lg card-pop">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <span className="text-2xl">👨‍🎓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Student Progress</h3>
                  <p className="text-muted-foreground text-sm">Track student performance</p>
                  <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-lg card-pop">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Assignments</h3>
                  <p className="text-muted-foreground text-sm">Create and grade assignments</p>
                  <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-lg card-pop">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Knowledge Sharing</h3>
                  <p className="text-muted-foreground text-sm">Share insights and resources</p>
                  <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-lg card-pop">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <span className="text-2xl">🗣️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Discussion Forums</h3>
                  <p className="text-muted-foreground text-sm">Facilitate class discussions</p>
                  <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-lg card-pop">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Analytics</h3>
                  <p className="text-muted-foreground text-sm">Course performance metrics</p>
                  <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Teaching features will be implemented in Phase-2. Get ready to inspire! 🌟
          </p>
        </div>
      </div>
    </div>
  );
}
