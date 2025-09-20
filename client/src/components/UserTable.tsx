import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronDown, Crown, GraduationCap, BookOpen, Users, Loader2 } from 'lucide-react';
import { useUsers, useUpdateUserRole, useRoleInfo, useAvailableRoles } from '@/hooks/useUsers';
import type { AuthUser } from '@/lib/api';

interface UserTableProps {
  currentUserId?: string;
}

/**
 * UserTable Component
 * Displays all users with role management capabilities for admins
 */
export function UserTable({ currentUserId }: UserTableProps) {
  const { data: users, isLoading, error } = useUsers();
  const updateUserRole = useUpdateUserRole();
  const { getRoleColor, getRoleIcon, getRoleDisplayName } = useRoleInfo();
  const availableRoles = useAvailableRoles();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Handle role update
  const handleRoleUpdate = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      await updateUserRole.mutateAsync({ userId, role: newRole });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading users...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load users. {error instanceof Error ? error.message : 'Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!users || users.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Users className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage user roles and permissions. Total users: {users.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  currentUserId={currentUserId}
                  isUpdating={updatingUserId === user.id}
                  onRoleUpdate={handleRoleUpdate}
                  getRoleColor={getRoleColor}
                  getRoleIcon={getRoleIcon}
                  getRoleDisplayName={getRoleDisplayName}
                  availableRoles={availableRoles}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * UserRow Component
 * Individual user row with role management dropdown
 */
interface UserRowProps {
  user: AuthUser;
  currentUserId?: string;
  isUpdating: boolean;
  onRoleUpdate: (userId: string, role: string) => Promise<void>;
  getRoleColor: (role: string) => string;
  getRoleIcon: (role: string) => string;
  getRoleDisplayName: (role: string) => string;
  availableRoles: Array<{ value: string; label: string; color: string }>;
}

function UserRow({
  user,
  currentUserId,
  isUpdating,
  onRoleUpdate,
  getRoleColor,
  getRoleIcon,
  getRoleDisplayName,
  availableRoles
}: UserRowProps) {
  const isCurrentUser = user.id === currentUserId;

  const getRoleIconComponent = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'professor': return <GraduationCap className="h-4 w-4" />;
      case 'student': return <BookOpen className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <TableRow className={isCurrentUser ? 'bg-muted/50' : undefined}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getRoleIconComponent(user.role)}
            <div>
              <p className="font-medium">{user.name}</p>
              {isCurrentUser && (
                <p className="text-xs text-muted-foreground">You</p>
              )}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p className="text-sm">{user.email}</p>
      </TableCell>
      <TableCell>
        <Badge className={getRoleColor(user.role)} variant="secondary">
          {getRoleIcon(user.role)} {getRoleDisplayName(user.role)}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isUpdating || (isCurrentUser && user.role === 'admin')}
              className="h-8 px-3"
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  Change Role
                  <ChevronDown className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableRoles.map((role) => (
              <DropdownMenuItem
                key={role.value}
                disabled={
                  role.value === user.role || 
                  (isCurrentUser && user.role === 'admin' && role.value !== 'admin')
                }
                onClick={() => onRoleUpdate(user.id, role.value)}
                className="flex items-center gap-2"
              >
                {getRoleIconComponent(role.value)}
                {role.label}
                {role.value === user.role && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    Current
                  </Badge>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {isCurrentUser && user.role === 'admin' && (
          <p className="text-xs text-muted-foreground mt-1">
            Cannot change own admin role
          </p>
        )}
      </TableCell>
    </TableRow>
  );
}