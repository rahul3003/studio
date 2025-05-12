
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useMockAuth() {
  const router = useRouter();
  const { 
    user, 
    loading: authIsLoading, // Get loading state directly from store
    logout: storeLogout, 
    switchRole: storeSwitchRole, 
    getAvailableRolesForSwitching: storeGetAvailableRoles,
  } = useAuthStore(state => ({
    user: state.user,
    loading: state.loading,
    logout: state.logout,
    switchRole: state.switchRole,
    getAvailableRolesForSwitching: state.getAvailableRolesForSwitching,
  }));

  useEffect(() => {
    // This effect runs when authIsLoading or user changes.
    // It ensures redirection if needed once loading is complete.
    if (!authIsLoading) { // Only act once the store has confirmed its loading status
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
    // router.refresh(); // Server components might need this, handled in store action or component if necessary
  };
  
  const getAvailableRolesForSwitching = () => {
    return storeGetAvailableRoles();
  };

  return { user, loading: authIsLoading, logout, switchRole, getAvailableRolesForSwitching };
}

