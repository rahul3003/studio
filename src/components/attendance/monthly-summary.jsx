
"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function MonthlySummary({ currentDate, attendanceRecords, statusConfig }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonthArray = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const totalDaysInMonth = getDaysInMonth(currentDate);

  const summary = {
    Present: 0,
    Absent: 0,
    Leave: 0,
    Holiday: 0,
    Workable: 0, // Days excluding holidays
  };

  daysInMonthArray.forEach(day => {
    const dayString = format(day, "yyyy-MM-dd");
    const record = attendanceRecords[dayString];
    if (record) {
      if (summary[record.status] !== undefined) {
        summary[record.status]++;
      }
      if (record.status !== "Holiday") {
        summary.Workable++;
      }
    } else {
        // If no record, assume it's a workable day unless it's a weekend (not handled here for simplicity)
        summary.Workable++;
    }
  });
  
  // If no records at all for any day, consider all days workable (excluding weekends, not handled)
  const allRecordsEmpty = Object.values(attendanceRecords).every(rec => !rec.status);
  if(allRecordsEmpty && summary.Workable === 0 && summary.Holiday === 0) {
      summary.Workable = totalDaysInMonth;
  } else if (summary.Workable === 0 && summary.Holiday > 0) {
      summary.Workable = totalDaysInMonth - summary.Holiday;
  }


  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Monthly Summary - {format(currentDate, "MMMM yyyy")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.keys(summary).map(statusKey => {
          if (statusKey === 'Workable' && summary[statusKey] === 0 && summary.Holiday > 0) return null; // Don't show 0 workable days if there are holidays
          if (statusKey === 'Workable' && summary[statusKey] === 0 && totalDaysInMonth > 0 && summary.Holiday === 0 && !allRecordsEmpty) return null;


          const count = summary[statusKey];
          // For percentages, use totalDaysInMonth or summary.Workable as base depending on context
          const baseForPercentage = statusKey === "Holiday" ? totalDaysInMonth : (summary.Workable > 0 ? summary.Workable : totalDaysInMonth) ;
          const percentage = baseForPercentage > 0 ? (count / baseForPercentage) * 100 : 0;
          const statusInfo = statusConfig[statusKey] || {label: statusKey, color: 'text-muted-foreground'};
          
          const barColorClass = () => {
            switch(statusKey) {
                case "Present": return "bg-green-500";
                case "Absent": return "bg-red-500";
                case "Leave": return "bg-yellow-500";
                case "Holiday": return "bg-blue-500";
                default: return "bg-primary";
            }
          }

          return (
            <div key={statusKey}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                <span className="text-sm text-muted-foreground">
                  {count} days 
                  { (statusKey !== "Workable" && baseForPercentage > 0) && ` (${percentage.toFixed(0)}%)`}
                </span>
              </div>
              {statusKey !== "Workable" && baseForPercentage > 0 && (
                <Progress value={percentage} className="h-2" indicatorClassName={barColorClass()} />
              )}
               {statusKey === "Workable" && count > 0 && (
                 <p className="text-xs text-muted-foreground">Total days considered for work calculations (excluding holidays).</p>
               )}
            </div>
          );
        })}
         {summary.Workable === 0 && summary.Holiday === 0 && totalDaysInMonth > 0 && (
            <p className="text-sm text-muted-foreground">No attendance data recorded for this month. Total days: {totalDaysInMonth}.</p>
        )}
      </CardContent>
    </Card>
  );
}

    