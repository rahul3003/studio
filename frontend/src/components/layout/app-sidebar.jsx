"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Rocket,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ROLE_NAV_CONFIG } from '@/config/roles';

export function AppSidebar({ onLogout }) {
  const pathname = usePathname();
  const { user, currentRole } = useAuthStore();
  const { state: sidebarState, isMobile } = useSidebar();
  const profileData = useProfileStore(state => state.profileData);
  const rewardsPoints = React.useMemo(() => profileData?.rewards?.accruedPoints || 0, [profileData]);

  const [openCollapsibles, setOpenCollapsibles] = React.useState({});

  const toggleCollapsible = (label) => {
    setOpenCollapsibles(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const navItemsForRole = React.useMemo(() => {
    if (currentRole) {
      return ROLE_NAV_CONFIG[currentRole.toUpperCase()] || ROLE_NAV_CONFIG.EMPLOYEE;
    }
    return ROLE_NAV_CONFIG.EMPLOYEE;
  }, [currentRole]);

  const getTooltipLabelForButton = React.useCallback((label) => {
    if (isMobile || sidebarState === "expanded") {
      return null;
    }
    return label;
  }, [isMobile, sidebarState]);

  const renderNavItems = (items, isSubmenu = false) => {
    return items.map((item) => {
      const tooltipLabel = getTooltipLabelForButton(item.label);
      // Removed React.useMemo for tooltipConfig as it was causing hook order issues
      const tooltipConfig = tooltipLabel
        ? { children: tooltipLabel, side: "right", align: "center" }
        : undefined;

      const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/dashboard/profile" && pathname.startsWith(item.href));
      const IconComponent = item.icon;

      if (item.children && item.children.length > 0) {
        const isGroupActive = item.children.some(child => pathname === child.href || (child.href !== "/dashboard" && child.href !== "/dashboard/profile" && pathname.startsWith(child.href)));
        return (
          <SidebarMenuItem key={item.label} className="group/menu-item relative">
             <Collapsible
              open={openCollapsibles[item.label] || false}
              onOpenChange={() => toggleCollapsible(item.label)}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={tooltipConfig}
                  className="justify-between w-full"
                  isActive={isGroupActive} 
                >
                  <div className="flex items-center gap-2">
                    <IconComponent />
                    <span>{item.label}</span>
                  </div>
                  {sidebarState === "expanded" && (
                    openCollapsibles[item.label] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {sidebarState === "expanded" && (
                 <CollapsibleContent className="pl-4">
                    <SidebarMenu className="border-l border-sidebar-border ml-3 py-1">
                     {renderNavItems(item.children, true)}
                    </SidebarMenu>
                  </CollapsibleContent>
              )}
            </Collapsible>
          </SidebarMenuItem>
        );
      }

      return (
        <SidebarMenuItem key={item.href} className={cn(isSubmenu ? "pl-3" : "")}>
          <Link href={item.href} legacyBehavior passHref>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={tooltipConfig}
              className="justify-start"
            >
              <a>
                <IconComponent />
                <span>{item.label}</span>
                {item.showPoints && rewardsPoints > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {rewardsPoints}
                  </Badge>
                )}
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      );
    });
  };


  return (
    <Sidebar
      collapsible={isMobile ? "offcanvas" : "icon"}
      variant="inset"
      className="transition-all duration-300 ease-in-out bg-sidebar"
      hoverPeek={!isMobile}
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
        <ScrollArea className="h-full">
          <SidebarMenu>
            {renderNavItems(navItemsForRole)}
          </SidebarMenu>
        </ScrollArea>
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
