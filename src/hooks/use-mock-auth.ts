"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@/config/roles';
import { getRole, ROLE_SWITCH_PERMISSIONS, ROLES } from '@/config/roles';

export interface User {
  name: string;
  email: string;
  currentRole: Role;
  baseRole: Role; // The user's actual role, can't be switched away from if not privileged
  avatar?: string;
}

// This hook is a MOCK. In a real app, use a proper auth solution.
export function useMockAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching user data
    const storedRoleValue = localStorage.getItem("userRole");
    const storedUserName = localStorage.getItem("userName");
    const storedUserEmail = localStorage.getItem("userEmail");
    const storedBaseRoleValue = localStorage.getItem("userBaseRole") || storedRoleValue; // baseRole defaults to current if not set

    if (storedRoleValue && storedUserName && storedUserEmail && storedBaseRoleValue) {
      const currentRole = getRole(storedRoleValue);
      const baseRole = getRole(storedBaseRoleValue);
      if (currentRole && baseRole) {
        setUser({
          name: storedUserName,
          email: storedUserEmail,
          currentRole: currentRole,
          baseRole: baseRole,
          avatar: `https://i.pravatar.cc/150?u=${storedUserEmail}` // Placeholder avatar
        });
      } else {
        // Invalid role found, clear storage and redirect
        localStorage.clear();
        router.push('/login');
      }
    } else {
       // No user data, redirect to login if not already on login page
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

  const switchRole = useCallback((newRoleValue: string) => {
    if (user) {
      const newRole = getRole(newRoleValue);
      if (newRole) {
        // Check permissions
        const canSwitch = ROLE_SWITCH_PERMISSIONS[user.baseRole.value]?.includes(newRoleValue) || user.baseRole.value === newRoleValue;
        
        if (canSwitch || user.baseRole.value === 'superadmin' || (user.baseRole.value === 'admin' && ROLES.find(r => r.value === newRoleValue))) {
           setUser(prevUser => prevUser ? { ...prevUser, currentRole: newRole } : null);
           localStorage.setItem("userRole", newRole.value);
           // Persist base role if not already set (e.g. first login)
           if (!localStorage.getItem("userBaseRole")) {
             localStorage.setItem("userBaseRole", user.baseRole.value);
           }
        } else {
          console.warn(`User with base role ${user.baseRole.name} cannot switch to ${newRole.name}`);
          // Optionally, show a toast message for unauthorized switch attempt
        }
      }
    }
  }, [user]);

  const getAvailableRolesForSwitching = useCallback((): Role[] => {
    if (!user) return [];
    
    const permittedValues = ROLE_SWITCH_PERMISSIONS[user.baseRole.value] || [];
    
    // Superadmin and admin can switch to any role lower than or equal to their base role
    if (user.baseRole.value === 'superadmin') {
        return ROLES; // Superadmin can switch to any role
    }
    if (user.baseRole.value === 'admin') {
        // Admin can switch to admin, manager, teamlead, employee
        return ROLES.filter(r => ['admin', 'manager', 'teamlead', 'employee'].includes(r.value));
    }

    // For other roles, they can switch to roles defined in ROLE_SWITCH_PERMISSIONS plus their own base role
    const availableRoles = ROLES.filter(r => permittedValues.includes(r.value) || r.value === user.baseRole.value);
    
    // Ensure the base role is always an option if not already included
    if (!availableRoles.find(r => r.value === user.baseRole.value)) {
        availableRoles.push(user.baseRole);
    }
    
    return availableRoles.sort((a,b) => ROLES.indexOf(a) - ROLES.indexOf(b)); // Keep original order
  }, [user]);


  return { user, loading, logout, switchRole, getAvailableRolesForSwitching };
}
