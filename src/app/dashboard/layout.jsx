"use client"; 

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useMockAuth } from "@/hooks/use-mock-auth"; // This now uses useAuthStore
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore"; // Directly use for initial hydration check
import { useProfileStore } from "@/store/profileStore";


export default function DashboardLayout({
  children,
}) {
  const { user, loading } = useMockAuth(); // useMockAuth handles redirection and user state from store
  const router = useRouter();
  const initializeProfile = useProfileStore(state => state.initializeProfileForUser);
  const profileData = useProfileStore(state => state.profileData);

  // Effect to initialize profile store when auth user changes
  React.useEffect(() => {
    if (user && (!profileData || profileData.personal.companyEmail !== user.email)) {
      initializeProfile(user);
    } else if (!user && profileData) {
      // Optional: Clear profile data if user logs out
      // initializeProfile(null); // Or a specific action to clear profile
    }
  }, [user, initializeProfile, profileData]);


  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }
  
  // If user is loaded and available
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar user={user} />
      <SidebarInset>
        <AppHeader user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
