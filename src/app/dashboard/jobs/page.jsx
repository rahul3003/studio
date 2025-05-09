
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BriefcaseBusiness } from "lucide-react";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Manage Job Postings</CardTitle>
          </div>
          <CardDescription>
            Create, update, and manage job openings and applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-border rounded-lg bg-card/50">
            <BriefcaseBusiness className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">
              Recruitment & Job Management Coming Soon
            </p>
            <p className="text-sm text-muted-foreground">
              This section will help manage the hiring pipeline from job posting to candidate selection.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
