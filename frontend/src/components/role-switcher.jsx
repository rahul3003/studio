"use client";

import * as React from "react";
import { useAuthStore } from "@/store/authStore";
import { ROLES, ROLE_SWITCH_PERMISSIONS } from '@/config/roles';
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
import { useToast } from "@/hooks/use-toast";
import { Shield, User } from "lucide-react";

export function RoleSwitcher() {
  const { toast } = useToast();
  const { 
    user, 
    currentRole,
    baseRole,
    setCurrentRole, 
    resetToBaseRole 
  } = useAuthStore();

  // Always use baseRole for available roles
  const availableRoles = React.useMemo(() => {
    if (!user || !baseRole) return [];
    let roles = ROLE_SWITCH_PERMISSIONS[baseRole]?.map(r => r.toUpperCase()) || [];
    // Always include the baseRole itself as an option (at the top)
    if (!roles.includes(baseRole)) roles = [baseRole, ...roles];
    else roles = [baseRole, ...roles.filter(r => r !== baseRole)];
    return roles.map(role => {
      const roleObj = ROLES.find(rObj => rObj.value === role);
      return {
        value: role,
        label: roleObj ? roleObj.name : role
      };
    });
  }, [user, baseRole]);

  const handleRoleChange = React.useCallback((value) => {
    if (value === baseRole) {
      resetToBaseRole();
      toast({
        title: "Role Reset",
        description: "Reset to your base role",
      });
    } else {
      const success = setCurrentRole(value);
      if (success) {
        toast({
          title: "Role Changed",
          description: `Switched to ${ROLES.find(r => r.value.toUpperCase() === value)?.name || value} role`,
        });
      } else {
        toast({
          title: "Role Change Failed",
          description: "You don't have permission to switch to this role",
          variant: "destructive",
        });
      }
    }
  }, [setCurrentRole, resetToBaseRole, baseRole, toast]);

  if (!user || !baseRole || !currentRole || availableRoles.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={currentRole} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-auto min-w-[160px] h-9 text-xs md:text-sm md:min-w-[180px] md:h-10">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Switch role">
              {ROLES.find(r => r.value.toUpperCase() === currentRole)?.name || currentRole}
            </SelectValue>
          </div>
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{role.label}</span>
                </div>
                {baseRole === role.value && (
                  <Badge variant="outline" className="ml-2 text-xs px-1.5 py-0.5">
                    Base
                  </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    </div>
  );
}

