
"use client"; // This layout uses client-side hooks for auth state

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useMockAuth } from "@/hooks/use-mock-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}) {
  const { user, loading } = useMockAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

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
