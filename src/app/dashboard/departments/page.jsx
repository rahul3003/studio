
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Manage Departments</CardTitle>
          </div>
          <CardDescription>
            View, add, edit, and manage department information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-border rounded-lg bg-card/50">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">
              Department Management Coming Soon
            </p>
            <p className="text-sm text-muted-foreground">
              This section will allow you to organize and manage all company departments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
