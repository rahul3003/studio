"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMockAuth } from "@/hooks/use-mock-auth";
import Image from "next/image";

export default function DashboardPage() {
  const { user } = useMockAuth();

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to RoleSwitch, {user?.name || "User"}!</CardTitle>
          <CardDescription>
            You are currently logged in as <span className="font-semibold text-accent">{user?.currentRole.name}</span>.
            This is your central hub for managing all HRMS activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use the sidebar to navigate through different sections of the application. You can switch your role using the dropdown in the header if you have the necessary permissions.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Current Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              {user && <user.currentRole.icon className="h-8 w-8 text-primary" />}
              <div>
                <p className="text-xl font-semibold">{user?.currentRole.name}</p>
                <p className="text-sm text-muted-foreground">{user?.currentRole.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Placeholder for quick actions based on role.</p>
            {/* Example: <Button variant="outline">View My Tasks</Button> */}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
                <CardTitle>Feature Spotlight</CardTitle>
            </CardHeader>
            <CardContent>
                 <Image 
                    src="https://picsum.photos/400/200" 
                    alt="Spotlight feature" 
                    width={400} 
                    height={200} 
                    className="rounded-md object-cover"
                    data-ai-hint="team collaboration"
                  />
                <p className="mt-2 text-sm text-muted-foreground">Discover the latest enhancements to streamline your workflow.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
