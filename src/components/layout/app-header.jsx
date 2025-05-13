
"use client";

import * as React from "react";
import { RoleSwitcher } from "@/components/role-switcher";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import { Home, Bell, Award, LogOut as LogOutIcon } from "lucide-react"; 
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

function getBreadcrumbs(pathname) {
  const pathParts = pathname.split('/').filter(part => part);
  const breadcrumbs = pathParts.map((part, index) => {
    const href = '/' + pathParts.slice(0, index + 1).join('/');
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    return { href, label };
  });
  return breadcrumbs;
}

const mockNotifications = [
  { id: 1, title: "New Leave Request", description: "Rohan Mehra requested 2 days leave.", time: "5m ago", read: false },
  { id: 2, title: "Reimbursement Approved", description: "Your travel claim for $50 has been approved.", time: "1h ago", read: true },
  { id: 3, title: "Project Update", description: "HRMS Portal phase 2 started.", time: "3h ago", read: false },
];

export function AppHeader({ onCheckoutClick, showCheckoutButton, onLogout }) { 
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);
  const profileData = useProfileStore(state => state.profileData);
  
  const rewardsPoints = React.useMemo(() => profileData?.rewards?.accruedPoints || 0, [profileData]);

  const canSwitchRoles = React.useMemo(() => {
    if (loading || !user || !user.baseRole) {
      return false;
    }
    // Employee role cannot switch. Others (superadmin, admin, manager, hr, accounts) can.
    return user.baseRole.value !== 'employee';
  }, [user, loading]); // Depends on user object (which includes baseRole) and loading state

  const unreadNotificationsCount = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
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
        
        {showCheckoutButton && (
          <Button variant="outline" size="sm" onClick={onCheckoutClick} className="animate-pulse bg-green-500/10 border-green-500 text-green-700 hover:bg-green-500/20 dark:bg-green-700/20 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-700/30">
            <LogOutIcon className="mr-2 h-4 w-4" />
            Check Out
          </Button>
        )}

        <div className="flex items-center gap-1 px-2 py-1 rounded-md border border-input bg-background hover:bg-accent/50 transition-colors cursor-pointer">
          <Award className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium text-foreground">{rewardsPoints}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">Points</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotificationsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 min-w-fit p-0.5 text-xs flex items-center justify-center"
                >
                  {unreadNotificationsCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mockNotifications.length > 0 ? (
              mockNotifications.map(notification => (
                <DropdownMenuItem key={notification.id} className={`flex flex-col items-start gap-1 ${!notification.read ? 'bg-accent/30 hover:bg-accent/50 dark:bg-accent/20 dark:hover:bg-accent/30' : ''}`}>
                  <div className="flex justify-between w-full">
                    <span className="font-semibold text-sm">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate w-full">{notification.description}</p>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
            )}
             <DropdownMenuSeparator />
             <DropdownMenuItem className="justify-center text-sm text-primary hover:underline">
                View all notifications
             </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <ThemeToggle />
      </div>
    </header>
  );
}

