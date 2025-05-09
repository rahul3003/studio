
"use client";

import * as React from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function WeeklyView({ currentDate, attendanceRecords, onDayClick, statusConfig }) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday as start of the week
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Week: {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {daysInWeek.map((day) => {
            const dayString = format(day, "yyyy-MM-dd");
            const record = attendanceRecords[dayString];
            const statusInfo = record ? statusConfig[record.status] : statusConfig.Default;
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={dayString}
                className={`p-3 rounded-md border cursor-pointer hover:shadow-md transition-shadow ${isToday(day) ? "bg-accent/20 border-primary" : "bg-card"}`}
                onClick={() => onDayClick(day)}
              >
                <div className="flex justify-between items-center mb-1">
                  <p className={`font-semibold ${isToday(day) ? 'text-primary' : ''}`}>{format(day, "EEE")}</p>
                  <p className="text-sm text-muted-foreground">{format(day, "d")}</p>
                </div>
                <div className="flex items-center gap-1.5">
                   {StatusIcon && <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />}
                   <span className={`text-xs font-medium ${statusInfo.color}`}>
                     {record?.status || "N/A"}
                   </span>
                </div>
                {record?.notes && (
                  <p className="text-xs text-muted-foreground mt-1 truncate" title={record.notes}>
                    {record.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t">
            <p className="text-sm text-muted-foreground">
                Click on a day to mark or update attendance.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}

    