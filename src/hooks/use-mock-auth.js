
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useMockAuth() {
  const router = useRouter();
  
  // Select state and functions individually for stable references
  const user = useAuthStore(state => state.user);
  const authIsLoading = useAuthStore(state => state.loading);
  const storeLogout = useAuthStore(state => state.logout);
  const storeSwitchRole = useAuthStore(state => state.switchRole);
  const storeGetAvailableRoles = useAuthStore(state => state.getAvailableRolesForSwitching);

  useEffect(() => {
    if (!authIsLoading) { 
      if (!user && typeof window !== 'undefined' && window.location.pathname !== '/login') {
        router.push('/login');
      }
    }
  }, [authIsLoading, user, router]);

  const logout = () => {
    storeLogout();
    router.push('/login');
  };

  const switchRole = (newRoleValue) => {
    storeSwitchRole(newRoleValue);
  };
  
  const getAvailableRolesForSwitching = () => {
    return storeGetAvailableRoles();
  };

  return { user, loading: authIsLoading, logout, switchRole, getAvailableRolesForSwitching };
}

