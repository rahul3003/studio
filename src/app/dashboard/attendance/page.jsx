
"use client";

import * as React from "react";
import {
  Calendar as CalendarIconLucide,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Edit3,
  CheckCircle,
  XCircle,
  MinusCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday as dateFnsIsToday,
  parseISO,
} from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkAttendanceDialog } from "@/components/attendance/mark-attendance-dialog";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WeeklyView } from "@/components/attendance/weekly-view";
import { MonthlySummary } from "@/components/attendance/monthly-summary";

const initialAttendanceRecords = {
  // Example records (YYYY-MM-DD format)
  [format(subDays(new Date(), 2), "yyyy-MM-dd")]: { status: "Present", notes: "Full day work" },
  [format(subDays(new Date(), 3), "yyyy-MM-dd")]: { status: "Absent", notes: "Sick leave" },
  [format(subDays(new Date(), 5), "yyyy-MM-dd")]: { status: "Leave", notes: "Personal leave" },
  "2024-01-01": { status: "Holiday", notes: "New Year's Day" }, // Example holiday
};

const statusConfig = {
  Present: { icon: CheckCircle, className: "rdp-day_present", color: "text-green-500", label: "Present" },
  Absent: { icon: XCircle, className: "rdp-day_absent", color: "text-red-500", label: "Absent" },
  Leave: { icon: MinusCircle, className: "rdp-day_leave", color: "text-yellow-500", label: "Leave" },
  Holiday: { icon: Info, className: "rdp-day_holiday", color: "text-blue-500", label: "Holiday" },
  Default: { icon: AlertTriangle, className: "text-muted-foreground", color: "text-muted-foreground", label: "N/A" },
};

export default function AttendancePage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = React.useState("daily"); // daily, weekly, monthly
  const [currentDate, setCurrentDate] = React.useState(new Date()); // Date for navigation and display control
  const [selectedDate, setSelectedDate] = React.useState(new Date()); // Specifically selected day for marking or details
  const [attendanceRecords, setAttendanceRecords] = React.useState(initialAttendanceRecords);
  const [isMarkAttendanceDialogOpen, setIsMarkAttendanceDialogOpen] = React.useState(false);
  const [dayToMarkAttendance, setDayToMarkAttendance] = React.useState(null);

  const handleOpenMarkAttendanceDialog = (date) => {
    setDayToMarkAttendance(date);
    setSelectedDate(date); // Keep selectedDate in sync
    setIsMarkAttendanceDialogOpen(true);
  };

  const handleSaveAttendance = (date, status, notes) => {
    const dateString = format(date, "yyyy-MM-dd");
    setAttendanceRecords((prev) => ({
      ...prev,
      [dateString]: { status, notes },
    }));
    toast({
      title: "Attendance Updated",
      description: `Attendance for ${format(date, "PPP")} marked as ${status}.`,
    });
    setIsMarkAttendanceDialogOpen(false);
  };

  const handlePrev = () => {
    if (viewMode === "daily") {
      setCurrentDate((prev) => subMonths(prev, 1)); // Calendar navigates by month
    } else if (viewMode === "weekly") {
      setCurrentDate((prev) => subWeeks(prev, 1));
    } else if (viewMode === "monthly") {
      setCurrentDate((prev) => subMonths(prev, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "daily") {
      setCurrentDate((prev) => addMonths(prev, 1));
    } else if (viewMode === "weekly") {
      setCurrentDate((prev) => addWeeks(prev, 1));
    } else if (viewMode === "monthly") {
      setCurrentDate((prev) => addMonths(prev, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today); // Also update selectedDate if relevant
  };
  
  const handleMonthSelect = (month) => {
    setCurrentDate(month);
  };


  const modifiers = React.useMemo(() => {
    const mods = {};
    Object.keys(statusConfig).forEach(statusKey => {
      if (statusKey !== 'Default') {
        mods[statusKey.toLowerCase()] = (date) => 
          attendanceRecords[format(date, "yyyy-MM-dd")]?.status === statusKey;
      }
    });
    return mods;
  }, [attendanceRecords]);

  const modifierClassNames = React.useMemo(() => {
     const classNames = {};
     Object.keys(statusConfig).forEach(statusKey => {
       if (statusKey !== 'Default') {
         classNames[statusKey.toLowerCase()] = statusConfig[statusKey].className;
       }
     });
     return classNames;
  }, []);


  const getDisplayPeriod = () => {
    if (viewMode === "daily") return format(currentDate, "MMMM yyyy"); // For calendar, month is good
    if (viewMode === "weekly") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
    if (viewMode === "monthly") return format(currentDate, "MMMM yyyy");
    return "";
  };

  const legendItems = Object.values(statusConfig).filter(s => s.label !== "N/A");


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CalendarIconLucide className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl">Manage Attendance</CardTitle>
              </div>
              <CardDescription>
                Track and manage employee attendance records.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenMarkAttendanceDialog(selectedDate || new Date())}>
              <PlusCircle className="mr-2 h-5 w-5" /> Mark Attendance
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleToday}>
                Today
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIconLucide className="mr-2 h-4 w-4" />
                    {format(currentDate, "MMMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={(date) => { if (date) handleMonthSelect(date); }}
                    initialFocus
                    month={currentDate}
                    onMonthChange={setCurrentDate}
                    captionLayout="dropdown-buttons"
                    fromYear={2020}
                    toYear={new Date().getFullYear() + 5}
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-lg font-semibold text-primary">{getDisplayPeriod()}</p>
          </div>

          <Tabs value={viewMode} onValueChange={setViewMode} className="mb-6">
            <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          
            <TabsContent value="daily">
              <div className="rounded-md border p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(day) => {
                    if (day) {
                      setSelectedDate(day);
                      handleOpenMarkAttendanceDialog(day);
                    }
                  }}
                  month={currentDate}
                  onMonthChange={setCurrentDate}
                  modifiers={modifiers}
                  modifiersClassNames={modifierClassNames}
                  className="p-0"
                  classNames={{
                      day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full',
                      day_today: 'bg-accent text-accent-foreground rounded-full font-bold',
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="weekly">
              <WeeklyView 
                  currentDate={currentDate} 
                  attendanceRecords={attendanceRecords} 
                  onDayClick={handleOpenMarkAttendanceDialog}
                  statusConfig={statusConfig}
                />
            </TabsContent>

            <TabsContent value="monthly">
              <div className="rounded-md border p-4">
                  <Calendar
                      mode="month" 
                      month={currentDate}
                      onMonthChange={setCurrentDate}
                      modifiers={modifiers}
                      modifiersClassNames={modifierClassNames}
                      onDayClick={(day) => { 
                          if (day && isSameMonth(day, currentDate)) {
                              setSelectedDate(day);
                              handleOpenMarkAttendanceDialog(day);
                          }
                      }}
                      className="p-0"
                      classNames={{
                          day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full',
                          day_today: 'bg-accent text-accent-foreground rounded-full font-bold',
                      }}
                  />
              </div>
              <MonthlySummary currentDate={currentDate} attendanceRecords={attendanceRecords} statusConfig={statusConfig} />
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Legend:</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {legendItems.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className={`h-3 w-3 rounded-full inline-block ${item.className.split(' ')[0]}`}></span>
                  <span className="text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>

      {isMarkAttendanceDialogOpen && dayToMarkAttendance && (
        <MarkAttendanceDialog
          isOpen={isMarkAttendanceDialogOpen}
          onClose={() => setIsMarkAttendanceDialogOpen(false)}
          selectedDate={dayToMarkAttendance}
          currentAttendance={attendanceRecords[format(dayToMarkAttendance, "yyyy-MM-dd")]}
          onSave={handleSaveAttendance}
          statusOptions={Object.keys(statusConfig).filter(s => s !== "Default" && s !== "Holiday")}
        />
      )}
    </div>
  );
}
