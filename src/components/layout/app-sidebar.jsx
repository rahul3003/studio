"use client";
import * as React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar, // Import useSidebar
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Rocket } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore"; // Import auth store
import { ROLE_NAV_CONFIG } from "@/config/roles";

export function AppSidebar() { // Removed user prop
  const pathname = usePathname();
  const { user, logout } = useAuthStore(); // Get user and logout from store
  const { state: sidebarState, isMobile } = useSidebar(); // Get sidebar state


  const navItemsForRole = React.useMemo(() => {
    if (user && user.currentRole && user.currentRole.value) {
      return ROLE_NAV_CONFIG[user.currentRole.value] || ROLE_NAV_CONFIG.employee || [];
    }
    return [];
  }, [user]);

  const getTooltipContent = (label) => {
    if (isMobile || sidebarState === "expanded") {
      return null; // No tooltip if sidebar is expanded or on mobile
    }
    return label;
  };

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "icon"} variant="inset">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Rocket className="h-7 w-7 text-primary group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" />
          <h2 className="text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
            PESU Venture Labs
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {navItemsForRole.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={getTooltipContent(item.label) ? { children: item.label, side: "right", align: "center" } : undefined}
                  className="justify-start"
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
           {/* Settings always available */}
          <SidebarMenuItem>
            <Link href="/dashboard/settings" legacyBehavior passHref>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard/settings"}
                tooltip={getTooltipContent("Settings") ? {children: "Settings", side: "right", align: "center"} : undefined}
                className="justify-start"
                >
                <a>
                  <Settings />
                  <span>Settings</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar} alt={user?.name} data-ai-hint="user avatar"/>
            <AvatarFallback>
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8 group-data-[collapsible=icon]:hidden"
            onClick={logout}
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
         <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 group-data-[collapsible=icon]:!flex group-data-[collapsible=icon]:mx-auto mt-2"
            onClick={logout}
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
