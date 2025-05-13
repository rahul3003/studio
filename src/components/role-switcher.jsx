
"use client";

import * as React from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function RoleSwitcher() {
  const { user, setCurrentRole, getAvailableRolesForSwitching } = useAuthStore();

  // Initialize selectedRole based on user.currentRole.value or default to empty string
  const [selectedRole, setSelectedRole] = React.useState(user?.currentRole?.value || '');

  // Memoize availableRoles based on user object and the getter function
  const availableRoles = React.useMemo(() => {
    // If user or user.baseRole is not yet available, getAvailableRolesForSwitching might return empty or default.
    // This check ensures that if the user object is not fully loaded, we default to an empty array.
    if (!user || !user.baseRole) {
      return [];
    }
    return getAvailableRolesForSwitching();
  }, [user, getAvailableRolesForSwitching]); // Depend on the user object and the function reference

  // Effect to update selectedRole when user.currentRole changes (e.g., after programmatic switch or initial load)
  React.useEffect(() => {
    if (user?.currentRole?.value) {
      setSelectedRole(user.currentRole.value);
    } else {
      setSelectedRole(''); // Reset if user or currentRole is gone
    }
  }, [user?.currentRole?.value]);

  const handleRoleChange = React.useCallback((value) => {
    setSelectedRole(value); // Update local state for immediate UI feedback
    setCurrentRole(value); // Update store
  }, [setCurrentRole]);

  // If no user, or user has no baseRole, or only one role (or fewer) is available, don't render the switcher.
  // This correctly handles the 'employee' case (length 1) and unauthenticated/loading states.
  if (!user || !user.baseRole || !availableRoles || availableRoles.length <= 1) {
    return null;
  }

  return (
    <Select value={selectedRole} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-auto min-w-[160px] h-9 text-xs md:text-sm md:min-w-[180px] md:h-10">
        <SelectValue placeholder="Switch role" />
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            <div className="flex items-center justify-between w-full">
              <span>{role.label}</span>
              {role.value === user.baseRole?.value && (
                <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0.5">Base</Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

