"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { CalendarDays } from "lucide-react";


export default function HolidaysPage() {
  const { user, loading: authLoading } = useAuthStore();
  const profileData = useProfileStore((state) => state.profileData);
  const initializeProfile = useProfileStore(state => state.initializeProfileForUser);
  
  React.useEffect(() => {
    if (user && (!profileData || profileData.personal.companyEmail !== user.email)) {
      initializeProfile(user);
    }
  }, [user, profileData, initializeProfile]);


  if (authLoading || !user || !profileData || !profileData.holidays) {
    return <div>Loading holiday list...</div>;
  }

  const holidayData = profileData.holidays;

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
            {holidayData.companyHolidays.map(holiday => (
              <li key={holiday.name}><span className="font-medium">{new Date(holiday.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}:</span> {holiday.name}</li>
            ))}
          </ul>
          <h4 className="font-semibold text-lg mt-4 mb-2">Restricted Holidays (Choose any 2):</h4>
           <ul className="list-disc list-inside space-y-1 text-sm">
            {holidayData.restrictedHolidays.map(holiday => (
              <li key={holiday.name}><span className="font-medium">{new Date(holiday.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}:</span> {holiday.name}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
