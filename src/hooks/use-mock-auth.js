
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getRole, ROLE_SWITCH_PERMISSIONS, ROLES } from '@/config/roles';

/**
 * @typedef {import('@/config/roles').Role} Role
 */

/**
 * @typedef {object} User
 * @property {string} name
 * @property {string} email
 * @property {Role} currentRole
 * @property {Role} baseRole - The user's actual role
 * @property {string} [avatar]
 */

// This hook is a MOCK. In a real app, use a proper auth solution.
export function useMockAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUserFromStorage = useCallback(() => {
    setLoading(true);
    const storedRoleValue = localStorage.getItem("userRole");
    const storedUserName = localStorage.getItem("userName");
    const storedUserEmail = localStorage.getItem("userEmail");
    let storedBaseRoleValue = localStorage.getItem("userBaseRole");

    if (storedUserName && storedUserEmail) {
      if (!storedBaseRoleValue) {
        storedBaseRoleValue = storedUserEmail === "admin@example.com" ? "admin" : (storedRoleValue || "employee");
        localStorage.setItem("userBaseRole", storedBaseRoleValue);
      }
      
      const baseRole = getRole(storedBaseRoleValue);
      const currentRoleValue = storedRoleValue || storedBaseRoleValue;
      const currentRole = getRole(currentRoleValue);

      if (baseRole && currentRole) {
        setUser({
          name: storedUserName,
          email: storedUserEmail,
          currentRole: currentRole, 
          baseRole: baseRole,
          avatar: `https://i.pravatar.cc/150?u=${storedUserEmail}`
        });
        // Ensure localStorage reflects the current role for consistency
        if (localStorage.getItem("userRole") !== currentRole.value) {
          localStorage.setItem("userRole", currentRole.value);
        }
      } else {
        console.error("Invalid base or current role found in localStorage:", storedBaseRoleValue, currentRoleValue);
        setUser(null); 
        localStorage.clear();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          router.push('/login');
        }
      }
    } else {
       setUser(null); 
       if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        router.push('/login');
      }
    }
    setLoading(false);
  }, [router]); // router dependency for navigation

  useEffect(() => {
    loadUserFromStorage(); // Initial load

    const handleAuthRoleChanged = () => {
      loadUserFromStorage();
    };

    const handleStorageChange = (event) => {
      if (["userRole", "userName", "userEmail", "userBaseRole"].includes(event.key) || event.key === null) {
        loadUserFromStorage();
      }
    };

    window.addEventListener('authRoleChanged', handleAuthRoleChanged);
    window.addEventListener('storage', handleStorageChange); // For cross-tab sync

    return () => {
      window.removeEventListener('authRoleChanged', handleAuthRoleChanged);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUserFromStorage]); // loadUserFromStorage is memoized, so this effect runs once to set up listeners

  const logout = useCallback(() => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userBaseRole");
    setUser(null);
    window.dispatchEvent(new CustomEvent('authRoleChanged')); // Notify other instances about logout
    router.push('/login');
  }, [router]);

  const switchRole = useCallback((newRoleValue) => {
    // Current user state is available via closure from the hook instance itself
    // No need to pass `currentUser` as argument.
    if (user && user.baseRole) {
      const newRole = getRole(newRoleValue);
      const allowedSwitches = ROLE_SWITCH_PERMISSIONS[user.baseRole.value] || [];
      if (newRole && (newRoleValue === user.baseRole.value || allowedSwitches.includes(newRoleValue))) {
        // Update localStorage first
        localStorage.setItem("userRole", newRole.value);
        // Update this instance's state
        setUser(prevUser => ({ ...prevUser, currentRole: newRole }));
        // Dispatch event for other instances in the same tab
        window.dispatchEvent(new CustomEvent('authRoleChanged'));
        // Refresh server components if needed
        router.refresh(); 
      } else {
        console.warn(`Role switch to ${newRoleValue} not allowed for base role ${user.baseRole.value}`);
      }
    }
  }, [user, router]);

  const getAvailableRolesForSwitching = useCallback(() => {
    if (!user || !user.baseRole) return [];
    
    const baseRoleValue = user.baseRole.value;
    const allowedSwitchValues = ROLE_SWITCH_PERMISSIONS[baseRoleValue] || [];
    
    const availableRoleValues = Array.from(new Set([baseRoleValue, ...allowedSwitchValues]));
    
    return ROLES.filter(role => availableRoleValues.includes(role.value));
  }, [user]);


  return { user, loading, logout, switchRole, getAvailableRolesForSwitching };
}
