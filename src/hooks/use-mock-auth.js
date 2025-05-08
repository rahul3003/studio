
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
    const storedRoleValue = localStorage.getItem("userRole"); // This might be a previously switched role
    const storedUserName = localStorage.getItem("userName");
    const storedUserEmail = localStorage.getItem("userEmail");
    let storedBaseRoleValue = localStorage.getItem("userBaseRole");

    if (storedRoleValue && storedUserName && storedUserEmail) {
      if (!storedBaseRoleValue) {
        // If baseRole isn't explicitly set, assume current storedRole was the base.
        // This handles users from before baseRole was distinct.
        storedBaseRoleValue = storedRoleValue;
        localStorage.setItem("userBaseRole", storedBaseRoleValue);
      }
      
      const baseRole = getRole(storedBaseRoleValue);

      if (baseRole) {
        setUser({
          name: storedUserName,
          email: storedUserEmail,
          currentRole: baseRole, // Current role is now always the base role
          baseRole: baseRole,
          avatar: `https://i.pravatar.cc/150?u=${storedUserEmail}`
        });
        // Ensure localStorage reflects that currentRole is baseRole
        localStorage.setItem("userRole", baseRole.value);
      } else {
        // Invalid base role found, clear storage and redirect
        console.error("Invalid base role found in localStorage:", storedBaseRoleValue);
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

  // Role switching is now disabled/simplified as RoleSwitcher component is removed.
  const switchRole = useCallback((newRoleValue) => {
    // console.warn("Role switching is disabled. User remains in their base role.");
    // If an attempt is made to switch, it should not change the currentRole from baseRole.
    // For robustness, ensure the user object reflects currentRole as baseRole if this is ever called.
    if (user && user.baseRole.value !== newRoleValue) {
        // toast or log that switching is not allowed or has no effect
    }
    // If the newRoleValue is the baseRole, do nothing.
  }, [user]);

  // Available roles for switching is now just the user's base role (effectively no switching).
  const getAvailableRolesForSwitching = useCallback(() => {
    if (!user || !user.baseRole) return [];
    // Returns an array containing only the base role, as no switching is effectively possible.
    return [user.baseRole];
  }, [user]);


  return { user, loading, logout, switchRole, getAvailableRolesForSwitching };
}

