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
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore"; // Import auth store

export function RoleSwitcher() {
  const { user, switchRole, getAvailableRolesForSwitching, loading } = useAuthStore(); // Use store
  const { toast } = useToast();
  const [availableRoles, setAvailableRoles] = React.useState([]);

  React.useEffect(() => {
    if (user) {
      setAvailableRoles(getAvailableRolesForSwitching());
    }
  }, [user, getAvailableRolesForSwitching]);

  if (loading || !user || (user.baseRole && user.baseRole.value === 'employee')) {
    return null;
  }

  const effectiveAvailableRoles = getAvailableRolesForSwitching();
  if (effectiveAvailableRoles.length <= 1 && user.baseRole.value !== 'superadmin') {
     const canSwitchToEmployee = effectiveAvailableRoles.some(r => r.value === 'employee');
     if (!canSwitchToEmployee) { // Only hide if "employee" isn't an option (for manager, hr, accounts to switch back)
        return null;
     }
  }


  const handleRoleSwitch = (role) => {
    switchRole(role.value);
    toast({
      title: "Role Switched",
      description: `You are now acting as ${role.name}.`,
    });
    // Trigger a custom event that AppSidebar can listen to to re-render
    window.dispatchEvent(new CustomEvent('authChanged'));
  };

  if (!user || !user.currentRole) return null; // Ensure user and currentRole are defined

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
        {effectiveAvailableRoles.map((role) => {
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
