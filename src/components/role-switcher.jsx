
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { useMockAuth } from "@/hooks/use-mock-auth";
import { useToast } from "@/hooks/use-toast";

export function RoleSwitcher() {
  const { user, switchRole, getAvailableRolesForSwitching, loading } = useMockAuth();
  const { toast } = useToast();
  const [availableRoles, setAvailableRoles] = React.useState([]);

  React.useEffect(() => {
    if (user) {
      setAvailableRoles(getAvailableRolesForSwitching());
    }
  }, [user, getAvailableRolesForSwitching]);

  // Don't show switcher if loading, no user, or user is base employee
  if (loading || !user || user.baseRole.value === 'employee') {
    return null;
  }

  // Don't show if there are no roles to switch to (besides the current one, implicitly the base role for employees)
  if (availableRoles.length <= 1 && user.baseRole.value !== 'superadmin') { // Superadmin should always see it even if only 1 option temporarily
     // Allow Manager, HR, Accounts to switch back to Employee even if that's the only option
     const canSwitchToBase = availableRoles.some(r => r.value === user.baseRole.value);
     const canSwitchToEmployee = availableRoles.some(r => r.value === 'employee');
     if (!(canSwitchToBase && canSwitchToEmployee && availableRoles.length > 0)) {
        return null;
     }
  }


  const handleRoleSwitch = (role) => {
    switchRole(role.value);
    toast({
      title: "Role Switched",
      description: `You are now acting as ${role.name}.`,
    });
  };

  const CurrentRoleIcon = user.currentRole.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <CurrentRoleIcon className="h-4 w-4 text-muted-foreground" />
          <span>{user.currentRole.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableRoles.map((role) => {
          const Icon = role.icon;
          const isCurrentRole = user.currentRole.value === role.value;
          const isBaseRole = user.baseRole.value === role.value;
          return (
            <DropdownMenuItem
              key={role.value}
              onClick={() => handleRoleSwitch(role)}
              disabled={isCurrentRole}
              className="cursor-pointer justify-between"
            >
              <div className="flex items-center">
                <Icon className="mr-2 h-4 w-4" />
                <span>{role.name}</span>
                {isBaseRole && (
                  <span className="ml-2 text-xs font-semibold text-primary">(Base)</span>
                )}
              </div>
              {isCurrentRole && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
