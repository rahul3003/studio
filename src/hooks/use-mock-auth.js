
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

  useEffect(() => {
    const storedRoleValue = localStorage.getItem("userRole");
    const storedUserName = localStorage.getItem("userName");
    const storedUserEmail = localStorage.getItem("userEmail");
    let storedBaseRoleValue = localStorage.getItem("userBaseRole");

    if (storedUserName && storedUserEmail) {
      if (!storedBaseRoleValue) {
        // If baseRole isn't explicitly set (e.g. first login or older session),
        // set it to a default or determine from email (e.g., 'admin' for admin@example.com)
        // For this mock, we'll default to 'employee' if not admin, or use the storedRole if available
        storedBaseRoleValue = storedUserEmail === "admin@example.com" ? "admin" : (storedRoleValue || "employee");
        localStorage.setItem("userBaseRole", storedBaseRoleValue);
      }
      
      const baseRole = getRole(storedBaseRoleValue);
      // The currentRole should be the one actively stored, or default to baseRole if nothing specific is set
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
        // Ensure localStorage reflects the current role
        localStorage.setItem("userRole", currentRole.value);
      } else {
        console.error("Invalid base or current role found in localStorage:", storedBaseRoleValue, currentRoleValue);
        localStorage.clear();
        router.push('/login');
      }
    } else {
       if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        router.push('/login');
      }
    }
    setLoading(false);
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userBaseRole");
    setUser(null);
    router.push('/login');
  }, [router]);

  const switchRole = useCallback((newRoleValue) => {
    if (user && user.baseRole) {
      const newRole = getRole(newRoleValue);
      const allowedSwitches = ROLE_SWITCH_PERMISSIONS[user.baseRole.value] || [];
      if (newRole && (newRoleValue === user.baseRole.value || allowedSwitches.includes(newRoleValue))) {
        setUser(prevUser => ({ ...prevUser, currentRole: newRole }));
        localStorage.setItem("userRole", newRole.value); // Save switched role
        router.refresh(); // Refresh the current route to ensure UI consistency
      } else {
        console.warn(`Role switch to ${newRoleValue} not allowed for base role ${user.baseRole.value}`);
      }
    }
  }, [user, router]);

  const getAvailableRolesForSwitching = useCallback(() => {
    if (!user || !user.baseRole) return [];
    
    const baseRoleValue = user.baseRole.value;
    const allowedSwitchValues = ROLE_SWITCH_PERMISSIONS[baseRoleValue] || [];
    
    // The user can always "switch" to their base role
    const availableRoleValues = [baseRoleValue, ...allowedSwitchValues];
    
    // Get the full role objects for these values
    return ROLES.filter(role => availableRoleValues.includes(role.value));
  }, [user]);


  return { user, loading, logout, switchRole, getAvailableRolesForSwitching };
}

