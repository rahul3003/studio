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
import type { Role } from "@/config/roles";
import { useToast } from "@/hooks/use-toast";

export function RoleSwitcher() {
  const { user, switchRole, getAvailableRolesForSwitching } = useMockAuth();
  const { toast } = useToast();
  const [availableRoles, setAvailableRoles] = React.useState<Role[]>([]);

  React.useEffect(() => {
    if (user) {
      setAvailableRoles(getAvailableRolesForSwitching());
    }
  }, [user, getAvailableRolesForSwitching]);

  if (!user) {
    return null;
  }

  const handleRoleSwitch = (role: Role) => {
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
          return (
            <DropdownMenuItem
              key={role.value}
              onClick={() => handleRoleSwitch(role)}
              disabled={isCurrentRole}
              className="cursor-pointer"
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{role.name}</span>
              {isCurrentRole && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
