
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
  useSidebar, 
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Rocket, LogOut as LogOutIcon } from "lucide-react"; 
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore"; 
import { ROLE_NAV_CONFIG } from "@/config/roles";

export function AppSidebar({ onCheckoutClick, showCheckoutButton, onLogout }) { 
  const pathname = usePathname();
  const { user } = useAuthStore(); 
  const { state: sidebarState, isMobile } = useSidebar(); 

  const navItemsForRole = React.useMemo(() => {
    if (user && user.currentRole && user.currentRole.value) {
      return ROLE_NAV_CONFIG[user.currentRole.value] || ROLE_NAV_CONFIG.employee || [];
    }
    return [];
  }, [user]);

  const shouldDisplayCheckoutInSidebar = showCheckoutButton && (sidebarState === 'collapsed' && !isMobile);

  const getTooltipLabelForButton = React.useCallback((label) => {
    if (isMobile || sidebarState === "expanded") {
      return null; 
    }
    return label;
  }, [isMobile, sidebarState]);

  return (
    <Sidebar 
        collapsible={isMobile ? "offcanvas" : "icon"} 
        variant="inset"
        className="transition-all duration-300 ease-in-out"
    >
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
          {navItemsForRole.map((item) => {
            const tooltipLabel = getTooltipLabelForButton(item.label);
            const tooltipConfig = React.useMemo(() => {
              if (tooltipLabel) {
                return { children: tooltipLabel, side: "right", align: "center" };
              }
              return undefined;
            }, [tooltipLabel]);

            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                    tooltip={tooltipConfig}
                    className="justify-start"
                  >
                    <a>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
           {shouldDisplayCheckoutInSidebar && ( 
            <SidebarMenuItem>
                 <SidebarMenuButton
                    onClick={onCheckoutClick}
                    tooltip={getTooltipLabelForButton("Check Out") ? { children: "Check Out", side: "right", align: "center" } : undefined}
                    className="justify-start w-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50"
                 >
                    <LogOutIcon />
                    <span>Check Out</span>
                 </SidebarMenuButton>
            </SidebarMenuItem>
           )}
          <SidebarMenuItem>
            <Link href="/dashboard/settings" legacyBehavior passHref>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard/settings"}
                tooltip={getTooltipLabelForButton("Settings") ? {children: "Settings", side: "right", align: "center"} : undefined}
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
            onClick={onLogout}
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
         <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 group-data-[collapsible=icon]:!flex group-data-[collapsible=icon]:mx-auto mt-2"
            onClick={onLogout}
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
