
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
 * @property {Role} baseRole - The user's actual role (the one they logged in with)
 * @property {string} [avatar]
 */

// This hook is a MOCK. In a real app, use a proper auth solution.
export function useMockAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUserFromStorage = useCallback(() => {
    setLoading(true);
    const storedUserEmail = localStorage.getItem("userEmail");
    const storedBaseRoleValue = localStorage.getItem("userBaseRole"); // Role user logged in with
    const storedCurrentRoleValue = localStorage.getItem("userRole"); // Role user is currently acting as
    const storedUserName = localStorage.getItem("userName");

    if (storedUserName && storedUserEmail && storedBaseRoleValue) {
      const baseRole = getRole(storedBaseRoleValue);
      // Use current role if set, otherwise default to base role
      const currentRoleValue = storedCurrentRoleValue || storedBaseRoleValue;
      const currentRole = getRole(currentRoleValue);

      if (baseRole && currentRole) {
        setUser({
          name: storedUserName,
          email: storedUserEmail,
          currentRole: currentRole,
          baseRole: baseRole,
          avatar: `https://i.pravatar.cc/150?u=${storedUserEmail}`
        });
         // Ensure localStorage reflects the *current* acting role
        if (localStorage.getItem("userRole") !== currentRole.value) {
          localStorage.setItem("userRole", currentRole.value);
        }

      } else {
        console.error("Invalid base or current role found in localStorage:", storedBaseRoleValue, currentRoleValue);
        setUser(null);
        localStorage.clear(); // Clear invalid state
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          router.push('/login');
        }
      }
    } else {
       setUser(null);
       if (typeof window !== 'undefined' && window.location.pathname !== '/login' && !['/', '/login'].includes(window.location.pathname)) {
         // Only redirect if not already on login/root page
         // and if required localStorage items are missing
         if (!storedUserName || !storedUserEmail || !storedBaseRoleValue) {
            router.push('/login');
         }
       }
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadUserFromStorage(); // Initial load

    const handleAuthRoleChanged = () => {
      // This event is dispatched locally when roles change or logout happens
      loadUserFromStorage();
    };

    const handleStorageChange = (event) => {
      // This listens for changes made in other tabs/windows
      if (["userRole", "userName", "userEmail", "userBaseRole"].includes(event.key) || event.key === null) { // null key means localStorage.clear() was called
        loadUserFromStorage();
      }
    };

    window.addEventListener('authRoleChanged', handleAuthRoleChanged);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('authRoleChanged', handleAuthRoleChanged);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUserFromStorage]);

  const logout = useCallback(() => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userBaseRole");
    setUser(null);
    window.dispatchEvent(new CustomEvent('authRoleChanged'));
    router.push('/login');
  }, [router]);

  const switchRole = useCallback((newRoleValue) => {
    if (user && user.baseRole) {
      const newRole = getRole(newRoleValue);
      // Check if the target role is the base role OR if it's in the allowed switches for the base role
      const allowedSwitches = ROLE_SWITCH_PERMISSIONS[user.baseRole.value] || [];
      const canSwitch = newRoleValue === user.baseRole.value || allowedSwitches.includes(newRoleValue);

      if (newRole && canSwitch) {
        localStorage.setItem("userRole", newRole.value); // Store the *new current* role
        setUser(prevUser => ({ ...prevUser, currentRole: newRole }));
        window.dispatchEvent(new CustomEvent('authRoleChanged'));
        router.refresh(); // Refresh server components to potentially get new data/UI
      } else {
        console.warn(`Role switch to ${newRoleValue} not allowed for base role ${user.baseRole.value}`);
      }
    }
  }, [user, router]);

  const getAvailableRolesForSwitching = useCallback(() => {
    if (!user || !user.baseRole || user.baseRole.value === 'employee') {
        // Employees cannot switch roles
        return [];
    }

    const baseRoleValue = user.baseRole.value;
    // Get roles the base role can switch *to*
    const allowedSwitchValues = ROLE_SWITCH_PERMISSIONS[baseRoleValue] || [];

    // The user can always switch *back* to their base role, plus any others allowed
    const availableRoleValues = Array.from(new Set([baseRoleValue, ...allowedSwitchValues]));

    // Map values back to full Role objects
    return ROLES.filter(role => availableRoleValues.includes(role.value));

  }, [user]);


  return { user, loading, logout, switchRole, getAvailableRolesForSwitching };
}
