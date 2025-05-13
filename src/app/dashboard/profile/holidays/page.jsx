"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { CalendarDays } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

function isSecondOrFourthSaturday(date) {
  if (date.getDay() !== 6) return false; // Not Saturday
  const day = date.getDate();
  // Find all Saturdays in this month
  let count = 0;
  for (let d = 1; d <= day; d++) {
    const temp = new Date(date.getFullYear(), date.getMonth(), d);
    if (temp.getDay() === 6) count++;
  }
  return count === 2 || count === 4;
}

// Static holiday data for 2024 and 2025
const staticHolidays = {
  2024: {
    companyHolidays: [
      { name: "New Year's Day", date: "2024-01-01" },
      { name: "Republic Day", date: "2024-01-26" },
      { name: "Independence Day", date: "2024-08-15" },
      { name: "Gandhi Jayanti", date: "2024-10-02" },
      { name: "Christmas", date: "2024-12-25" },
    ],
    restrictedHolidays: [
      { name: "Pongal", date: "2024-01-15" },
      { name: "Maha Shivaratri", date: "2024-03-08" },
      { name: "Good Friday", date: "2024-03-29" },
      { name: "Bakrid", date: "2024-06-17" },
      { name: "Diwali", date: "2024-11-01" },
    ]
  },
  2025: {
    companyHolidays: [
      { name: "New Year's Day", date: "2025-01-01" },
      { name: "Republic Day", date: "2025-01-26" },
      { name: "Independence Day", date: "2025-08-15" },
      { name: "Gandhi Jayanti", date: "2025-10-02" },
      { name: "Christmas", date: "2025-12-25" },
    ],
    restrictedHolidays: [
      { name: "Pongal", date: "2025-01-15" },
      { name: "Maha Shivaratri", date: "2025-02-26" },
      { name: "Good Friday", date: "2025-04-18" },
      { name: "Bakrid", date: "2025-06-07" },
      { name: "Diwali", date: "2025-10-20" },
    ]
  }
};

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

  // Determine the selected month/year
  const [selectedMonth, setSelectedMonth] = React.useState(new Date());
  const selectedYear = selectedMonth.getFullYear();

  // Use static data for holidays
  const holidayData = staticHolidays[selectedYear] || { companyHolidays: [], restrictedHolidays: [] };

  const companyHolidayDates = (holidayData.companyHolidays || [])
    .map(h => new Date(h.date).toDateString());
  const restrictedHolidayDates = (holidayData.restrictedHolidays || [])
    .map(h => new Date(h.date).toDateString());

  // Custom modifiers for calendar
  const modifiers = {
    sunday: (date) => date.getDay() === 0,
    secondFourthSaturday: (date) => isSecondOrFourthSaturday(date),
    companyHoliday: (date) => companyHolidayDates.includes(date.toDateString()),
    restrictedHoliday: (date) => restrictedHolidayDates.includes(date.toDateString()),
    today: (date) => {
      const now = new Date();
      return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    },
  };

  const modifiersClassNames = {
    sunday: "highlight-sunday",
    secondFourthSaturday: "highlight-saturday",
    companyHoliday: "highlight-company",
    restrictedHoliday: "highlight-restricted",
    today: "highlight-today",
  };

  // Tooltip for holidays
  function getHolidayLabel(date) {
    const dStr = date.toDateString();
    const company = holidayData.companyHolidays.find(h => new Date(h.date).toDateString() === dStr);
    if (company) return company.name;
    const restricted = holidayData.restrictedHolidays.find(h => new Date(h.date).toDateString() === dStr);
    if (restricted) return restricted.name + " (Restricted)";
    if (date.getDay() === 0) return "Sunday";
    if (isSecondOrFourthSaturday(date)) return "2nd/4th Saturday";
    return null;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <style>{`
        .highlight-sunday { background: #fee2e2 !important; color: #b91c1c !important; font-weight: bold; border-radius: 6px; }
        .highlight-saturday { background: #dbeafe !important; color: #1e40af !important; font-weight: bold; border-radius: 6px; }
        .highlight-company { background: #bbf7d0 !important; color: #166534 !important; font-weight: bold; border: 2px solid #22c55e !important; border-radius: 6px; }
        .highlight-restricted { background: #fef9c3 !important; color: #a16207 !important; font-weight: bold; border: 2px solid #eab308 !important; border-radius: 6px; }
        .highlight-today { border: 2px solid #2563eb !important; box-shadow: 0 0 0 2px #2563eb33; border-radius: 6px; }
        .rdp-day { aspect-ratio: 1/1; height: 2.2em; min-width: 2.2em; display: flex; align-items: center; justify-content: center; }
      `}</style>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><CalendarDays /> Company Holiday List {selectedYear}</CardTitle>
          <CardDescription>Official list of company holidays and restricted holidays for the current year.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <DayPicker
                mode="single"
                showOutsideDays
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                captionLayout="dropdown"
                fromYear={2000}
                toYear={2100}
                month={selectedMonth}
                onMonthChange={setSelectedMonth}
                defaultMonth={new Date()}
                renderDay={(date) => {
                  const label = getHolidayLabel(date);
                  return (
                    <div title={label || undefined} className="w-full h-full flex items-center justify-center">
                      {date.getDate()}
                    </div>
                  );
                }}
              />
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 highlight-sunday border border-red-300" /> Sunday</div>
                <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 highlight-saturday border border-blue-300" /> 2nd/4th Saturday</div>
                <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 highlight-company border border-green-400" /> Company Holiday</div>
                <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 highlight-restricted border border-yellow-400" /> Restricted Holiday</div>
              </div>
            </div>
            <div className="md:w-1/2">
              <h4 className="font-semibold text-lg mb-2">Company Holidays:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm mb-6">
                {(holidayData.companyHolidays || []).length > 0 ? (
                  holidayData.companyHolidays.map(holiday => (
                    <li key={holiday.name}><span className="font-medium">{new Date(holiday.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}:</span> {holiday.name}</li>
                  ))
                ) : (
                  <li className="text-muted-foreground">No company holidays for this year.</li>
                )}
              </ul>
              <h4 className="font-semibold text-lg mt-4 mb-2">Restricted Holidays (Choose any 2):</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {(holidayData.restrictedHolidays || []).length > 0 ? (
                  holidayData.restrictedHolidays.map(holiday => (
                    <li key={holiday.name}><span className="font-medium">{new Date(holiday.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}:</span> {holiday.name}</li>
                  ))
                ) : (
                  <li className="text-muted-foreground">No restricted holidays for this year.</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
