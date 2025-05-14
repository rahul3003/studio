"use client";

import * as React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, FileText, Mail, CheckCircle2, XCircle, UserPlus, AlertCircle } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const statusIconMap = {
  "Offer Generated": FileText,
  "Offer Sent": Mail,
  "Offer Accepted": CheckCircle2,
  "Offer Rejected": XCircle,
  "Hired": UserPlus,
  "Pending": Clock,
  "Selected": Clock,
  "Not Selected": XCircle,
  "On Hold": AlertCircle,
  "Rejected (Application)": XCircle,
};

const statusVariantMap = {
  "Offer Generated": "outline",
  "Offer Sent": "default",
  "Offer Accepted": "default",
  "Offer Rejected": "destructive",
  "Hired": "default",
  "Pending": "secondary",
  "Selected": "default",
  "Not Selected": "secondary",
  "On Hold": "secondary",
  "Rejected (Application)": "destructive",
};

export function OfferHistory({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Offer History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No offer history available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Offer History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {history.map((entry, index) => {
              const Icon = statusIconMap[entry.status] || Clock;
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full p-2 bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    {index !== history.length - 1 && (
                      <div className="w-0.5 h-full bg-border" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {entry.reason ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Badge variant={statusVariantMap[entry.status] || "outline"}>
                                {entry.status}
                              </Badge>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {entry.reason}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Badge variant={statusVariantMap[entry.status] || "outline"}>
                          {entry.status}
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.timestamp), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm">{entry.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 