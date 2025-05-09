
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListTodo className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Manage Tasks</CardTitle>
          </div>
          <CardDescription>
            Create, assign, and monitor individual and team tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-border rounded-lg bg-card/50">
            <ListTodo className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">
              Task Management System Coming Soon
            </p>
            <p className="text-sm text-muted-foreground">
              This section will provide tools for effective task tracking and collaboration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
