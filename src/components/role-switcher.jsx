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
  const { user, setCurrentRole } = useAuthStore();
  const [selectedRole, setSelectedRole] = React.useState(user?.currentRole?.value || '');

  const handleRoleChange = React.useCallback((value) => {
    setSelectedRole(value);
    setCurrentRole(value);
  }, [setCurrentRole]);

  if (!user?.roles || user.roles.length <= 1) {
    return null;
  }

  return (
    <Select value={selectedRole} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {user.roles.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            <div className="flex items-center gap-2">
              <span>{role.label}</span>
              {role.value === user.baseRole?.value && (
                <Badge variant="secondary" className="text-xs">Base</Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

