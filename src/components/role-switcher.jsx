
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
import * as SelectPrimitive from "@radix-ui/react-select"; // Import SelectPrimitive
import { Badge } from "@/components/ui/badge";

export function RoleSwitcher() {
  const { user, setCurrentRole, getAvailableRolesForSwitching } = useAuthStore(
    (state) => ({
      user: state.user,
      setCurrentRole: state.setCurrentRole,
      getAvailableRolesForSwitching: state.getAvailableRolesForSwitching,
    })
  );

  // Initialize selectedRole based on user.currentRole.value or default to empty string
  const [selectedRoleValue, setSelectedRoleValue] = React.useState('');

  // Memoize availableRoles based on user object and the getter function
  const availableRoles = React.useMemo(() => {
    if (!user || !user.baseRole) {
      return [];
    }
    return getAvailableRolesForSwitching();
  }, [user, getAvailableRolesForSwitching]);

  // Effect to update selectedRoleValue when user.currentRole changes
  React.useEffect(() => {
    if (user?.currentRole?.value) {
      setSelectedRoleValue(user.currentRole.value);
    } else if (availableRoles.length > 0) {
      // If currentRole is somehow not set but roles are available, default to base or first
      setSelectedRoleValue(user?.baseRole?.value || availableRoles[0].value);
    } else {
      setSelectedRoleValue(''); 
    }
  }, [user?.currentRole?.value, user?.baseRole?.value, availableRoles]);

  const handleRoleChange = React.useCallback((value) => {
    // No need to setSelectedRoleValue here, useEffect above handles it from store update
    setCurrentRole(value); // Update store, which will trigger re-render and useEffect
  }, [setCurrentRole]);

  if (!user || !user.baseRole || !availableRoles || availableRoles.length <= 1) {
    return null;
  }

  return (
    <Select value={selectedRoleValue} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-auto min-w-[160px] h-9 text-xs md:text-sm md:min-w-[180px] md:h-10">
        <SelectValue placeholder="Switch role" />
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            <div className="flex items-center justify-between w-full">
              {/* Use SelectPrimitive.ItemText to control what SelectValue displays */}
              <SelectPrimitive.ItemText>{role.name}</SelectPrimitive.ItemText> 
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
