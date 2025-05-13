
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
// SelectPrimitive might not be needed here anymore if ItemText is removed
// import * as SelectPrimitive from "@radix-ui/react-select"; 
import { Badge } from "@/components/ui/badge";

export function RoleSwitcher() {
  const { user, setCurrentRole, getAvailableRolesForSwitching } = useAuthStore(
    (state) => ({
      user: state.user,
      setCurrentRole: state.setCurrentRole,
      getAvailableRolesForSwitching: state.getAvailableRolesForSwitching,
    })
  );

  const availableRoles = React.useMemo(() => {
    if (!user || !user.baseRole) {
      return [];
    }
    return getAvailableRolesForSwitching();
  }, [user, getAvailableRolesForSwitching]);


  const handleRoleChange = React.useCallback((value) => {
    setCurrentRole(value); 
  }, [setCurrentRole]);

  if (!user || !user.baseRole || !availableRoles || availableRoles.length <= 1) {
    return null;
  }
  
  const currentRoleValue = user?.currentRole?.value || '';

  return (
    <Select value={currentRoleValue} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-auto min-w-[160px] h-9 text-xs md:text-sm md:min-w-[180px] md:h-10">
        <SelectValue placeholder="Switch role" />
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            <div className="flex items-center justify-between w-full">
              {/* Changed from SelectPrimitive.ItemText to simple text/span */}
              <span>{role.name}</span> 
              {user.baseRole && role.value === user.baseRole.value && (
                <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0.5">Base</Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

