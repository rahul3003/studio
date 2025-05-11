"use client";

import * as React from "react";
import { RoleSwitcher } from "@/components/role-switcher";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import Link from "next/link";
import { useMockAuth } from "@/hooks/use-mock-auth";


function getBreadcrumbs(pathname) {
  const pathParts = pathname.split('/').filter(part => part);
  const breadcrumbs = pathParts.map((part, index) => {
    const href = '/' + pathParts.slice(0, index + 1).join('/');
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    return { href, label };
  });
  return breadcrumbs;
}


export function AppHeader({ user: passedUser }) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const { user: authUser } = useMockAuth(); 

  const user = passedUser || authUser;

  // Updated logic: Role switcher is available if the baseRole is NOT employee.
  // The actual roles they can switch to are then determined by ROLE_SWITCH_PERMISSIONS.
  const canSwitchRoles = user && user.baseRole && user.baseRole.value !== 'employee';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger /> {/* Removed md:hidden to make it always visible */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
            <span className="sr-only">Dashboard</span>
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              <span className="text-muted-foreground">/</span>
              <Link
                href={crumb.href}
                className={`transition-colors ${index === breadcrumbs.length - 1 ? 'text-foreground pointer-events-none' : 'text-muted-foreground hover:text-foreground'}`}
                aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {canSwitchRoles && <RoleSwitcher />}
        <ThemeToggle />
      </div>
    </header>
  );
}

