"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useMockAuth() {
  const router = useRouter();
  const { 
    user, 
    loading, 
    logout: storeLogout, 
    switchRole: storeSwitchRole, 
    getAvailableRolesForSwitching: storeGetAvailableRoles,
    hydrateAuth, // Action to signal hydration complete or initial load
    setLoading: storeSetLoading
  } = useAuthStore();

  useEffect(() => {
    // This effect runs once on mount to ensure loading state is set correctly
    // after potential rehydration from localStorage by Zustand's persist middleware.
    storeSetLoading(true); // Assume loading until we check
    const unsubscribe = useAuthStore.subscribe(
      (state) => state.user, // Subscribe to user changes
      (hydratedUser) => {
        if (hydratedUser === undefined) {
          // Still rehydrating or no user in storage.
          // The persist middleware might not have finished.
          // We can set a timeout or rely on the initial loading: true from the store.
        } else {
          storeSetLoading(false); // Hydration complete or initial state determined
          if (!hydratedUser && typeof window !== 'undefined' && window.location.pathname !== '/login') {
            router.push('/login');
          }
        }
      }
    );
    // Initial check
    const initialUser = useAuthStore.getState().user;
    if (initialUser === null && useAuthStore.getState().loading === false && typeof window !== 'undefined' && window.location.pathname !== '/login') {
        // This case handles if persist middleware hydrated to null (no user)
        router.push('/login');
    } else if (initialUser !== null || useAuthStore.getState().loading === false) {
        storeSetLoading(false);
    }


    const handleAuthChangedEvent = () => {
      // When loginForm dispatches 'authChanged', re-evaluate auth state
      // The store itself should be up-to-date due to persist.
      // This is more of a signal if other complex logic needs to run.
      const updatedUser = useAuthStore.getState().user;
       if (!updatedUser && typeof window !== 'undefined' && window.location.pathname !== '/login') {
          router.push('/login');
       }
    };

    window.addEventListener('authChanged', handleAuthChangedEvent);
    
    return () => {
      unsubscribe();
      window.removeEventListener('authChanged', handleAuthChangedEvent);
    };
  }, [router, storeSetLoading]);


  const logout = () => {
    storeLogout();
    window.dispatchEvent(new CustomEvent('authChanged')); // Notify other parts
    router.push('/login');
  };

  const switchRole = (newRoleValue) => {
    storeSwitchRole(newRoleValue);
     window.dispatchEvent(new CustomEvent('authChanged')); // Notify sidebar etc.
    router.refresh(); // Refresh server components
  };
  
  const getAvailableRolesForSwitching = () => {
    return storeGetAvailableRoles();
  };


  return { user, loading, logout, switchRole, getAvailableRolesForSwitching };
}
