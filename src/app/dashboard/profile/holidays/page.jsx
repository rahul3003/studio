"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMockAuth } from "@/hooks/use-mock-auth";
import { CalendarDays } from "lucide-react";

// Mock data relevant to this page
const mockHolidayData = {
  holidays: [
    { date: "2024-01-01", name: "New Year's Day" },
    { date: "2024-01-26", name: "Republic Day" },
    { date: "2024-03-25", name: "Holi" },
    { date: "2024-04-09", name: "Ugadi" },
    { date: "2024-08-15", name: "Independence Day" },
    { date: "2024-10-02", name: "Gandhi Jayanti" },
    { date: "2024-10-31", name: "Diwali (Laxmi Pujan)" },
    { date: "2024-12-25", name: "Christmas" },
  ],
  restrictedHolidays: [
    { date: "2024-05-01", name: "May Day (RH)" },
    { date: "2024-09-07", name: "Ganesh Chaturthi (RH)" },
  ]
};

export default function HolidaysPage() {
  const { user, loading: authLoading } = useMockAuth();

  if (authLoading || !user) {
    return <div>Loading holiday list...</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><CalendarDays /> Company Holiday List 2024</CardTitle>
          <CardDescription>Official list of company holidays and restricted holidays for the current year.</CardDescription>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold text-lg mb-2">Company Holidays:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm mb-6">
            {mockHolidayData.holidays.map(holiday => (
              <li key={holiday.name}><span className="font-medium">{new Date(holiday.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}:</span> {holiday.name}</li>
            ))}
          </ul>
          <h4 className="font-semibold text-lg mt-4 mb-2">Restricted Holidays (Choose any 2):</h4>
           <ul className="list-disc list-inside space-y-1 text-sm">
            {mockHolidayData.restrictedHolidays.map(holiday => (
              <li key={holiday.name}><span className="font-medium">{new Date(holiday.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}:</span> {holiday.name}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
