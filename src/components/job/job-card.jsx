"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, BriefcaseBusiness, MapPin, CalendarDays, Users2 as Users2Icon } from "lucide-react";

export function JobCard({ job, onEdit, onDelete, onViewDetails, onViewApplicants }) {
  const statusVariantMap = {
    Open: "default",
    Closed: "secondary",
    Filled: "outline",
    Draft: "secondary",
  };

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
            <Badge variant={statusVariantMap[job.status] || "secondary"} className="ml-auto whitespace-nowrap">
                {job.status}
            </Badge>
        </div>
        <CardDescription className="text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <BriefcaseBusiness className="h-3.5 w-3.5" /> {job.department}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <MapPin className="h-3.5 w-3.5" /> {job.location} | {job.type}
          </div>
           <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <CalendarDays className="h-3.5 w-3.5" /> Posted: {new Date(job.postedDate).toLocaleDateString()}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {job.description}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2 pt-4 mt-auto border-t">
        <Button variant="outline" size="sm" onClick={() => onViewDetails(job)} className="text-primary hover:bg-primary/10">
          <Eye className="mr-1 h-4 w-4" /> Details
        </Button>
        <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewApplicants(job)} 
            className="text-green-600 hover:text-green-700 hover:bg-green-500/10 border-green-500 dark:text-green-400 dark:hover:text-green-300 dark:border-green-600 dark:hover:bg-green-500/20"
        >
          <Users2Icon className="mr-1 h-4 w-4" /> Applicants
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(job)}>
          <Edit className="mr-1 h-4 w-4" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(job)} className="hover:bg-destructive/90">
          <Trash2 className="mr-1 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
