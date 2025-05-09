
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Manage Projects</CardTitle>
          </div>
          <CardDescription>
            Track, assign, and manage all company projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-border rounded-lg bg-card/50">
            <FolderKanban className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">
              Project Management Features Coming Soon
            </p>
            <p className="text-sm text-muted-foreground">
              This section will allow you to oversee project timelines, resources, and progress.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
