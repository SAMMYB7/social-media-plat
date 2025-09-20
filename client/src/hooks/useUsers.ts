import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, type AuthUser } from '@/lib/api';
import { toast } from 'sonner';

// Query keys for consistent cache management
export const userQueryKeys = {
  all: ['users'] as const,
  list: () => [...userQueryKeys.all, 'list'] as const,
  stats: () => [...userQueryKeys.all, 'stats'] as const,
};

/**
 * Hook to fetch all users (admin only)
 */
export function useUsers() {
  return useQuery({
    queryKey: userQueryKeys.list(),
    queryFn: async () => {
      const response = await usersApi.getAll();
      return response.users;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch user statistics (admin only)
 */
export function useUserStats() {
  return useQuery({
    queryKey: userQueryKeys.stats(),
    queryFn: async () => {
      const response = await usersApi.getStats();
      return response.stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to update user role (admin only)
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await usersApi.updateRole(userId, role);
      return response.user;
    },
    onMutate: async ({ userId, role }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userQueryKeys.list() });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData<AuthUser[]>(userQueryKeys.list());

      // Optimistically update to the new value
      if (previousUsers) {
        queryClient.setQueryData<AuthUser[]>(
          userQueryKeys.list(),
          previousUsers.map(user =>
            user.id === userId ? { ...user, role } : user
          )
        );
      }

      // Return a context object with the snapshotted value
      return { previousUsers };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUsers) {
        queryClient.setQueryData(userQueryKeys.list(), context.previousUsers);
      }
      
      // Show error toast
      const message = error instanceof Error ? error.message : 'Failed to update user role';
      toast.error(message);
    },
    onSuccess: (updatedUser, { role }) => {
      // Show success toast
      toast.success(`User role updated to ${role} successfully`);
      
      // Invalidate and refetch user stats
      queryClient.invalidateQueries({ queryKey: userQueryKeys.stats() });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: userQueryKeys.list() });
    },
  });
}

/**
 * Hook to get available roles for a user
 */
export function useAvailableRoles() {
  const roles = [
    { value: 'student', label: 'Student', color: 'bg-secondary' },
    { value: 'professor', label: 'Professor', color: 'bg-primary' },
    { value: 'admin', label: 'Admin', color: 'bg-destructive' },
  ];

  return roles;
}

/**
 * Hook to get role display information
 */
export function useRoleInfo() {
  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'admin': 
        return 'bg-destructive text-destructive-foreground';
      case 'professor': 
        return 'bg-primary text-primary-foreground';
      case 'student': 
        return 'bg-secondary text-secondary-foreground';
      default: 
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleIcon = (role: string): string => {
    switch (role) {
      case 'admin': return '👑';
      case 'professor': return '🎓';
      case 'student': return '📚';
      default: return '👤';
    }
  };

  const getRoleDisplayName = (role: string): string => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return {
    getRoleColor,
    getRoleIcon,
    getRoleDisplayName,
  };
}