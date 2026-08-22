'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  roleId?: string | null;
  customRole?: { id: string; name: string } | null;
  status: 'ACTIVE' | 'INACTIVE';
  permissions: string[];
  lastLoginAt?: string | null;
  createdAt: string;
}

export function useCurrentUser() {
  return useQuery<UserSession>({
    queryKey: ['current-user'],
    queryFn: () => api<UserSession>('/auth/me'),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePermissions() {
  const { data: user, isLoading } = useCurrentUser();

  const permissions = user?.permissions || [];
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || permissions.includes('*');

  function hasPermission(permission: string | string[]): boolean {
    if (isSuperAdmin) return true;

    if (Array.isArray(permission)) {
      return permission.some((p) => permissions.includes(p) || permissions.includes('*'));
    }

    return permissions.includes(permission) || permissions.includes('*');
  }

  return {
    permissions,
    isSuperAdmin,
    hasPermission,
    isLoading,
    user,
  };
}

export { useAuth } from '../components/auth-guard';
