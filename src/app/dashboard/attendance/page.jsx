
"use client";

import * as React from "react";
import {
  Calendar as CalendarIconLucide,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  CheckCircle,
  XCircle,
  MinusCircle,
  AlertTriangle,
  Info,
  Users,
} from "lucide-react";
import {
  format,
  addDays,
  subDays,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
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
import { useMockAuth } from "@/hooks/use-mock-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const MOCK_EMPLOYEE_NAMES = ["Alice Wonderland", "Bob The Builder", "Charlie Chaplin", "Admin User", "Diana Prince", "Edward Scissorhands"];

const generateUserAttendance = (userName) => {
    const records = {};
    // Generate some pseudo-random records for variety
    const today = new Date();
    if (userName === "Alice Wonderland") {
        records[format(subDays(today, 2), "yyyy-MM-dd")] = { status: "Present", notes: "Full day work" };
        records[format(subDays(today, 3), "yyyy-MM-dd")] = { status: "Absent", notes: "Sick leave" };
        records[format(subDays(today, 7), "yyyy-MM-dd")] = { status: "Present", notes: "Team meeting" };
    } else if (userName === "Bob The Builder") {
        records[format(subDays(today, 1), "yyyy-MM-dd")] = { status: "Present", notes: "Morning session" };
        records[format(subDays(today, 4), "yyyy-MM-dd")] = { status: "Leave", notes: "Vacation" };
    } else if (userName === "Charlie Chaplin") {
        records[format(subDays(today, 5), "yyyy-MM-dd")] = { status: "Present", notes: "Worked on Project Alpha" };
        records[format(addDays(today, 1), "yyyy-MM-dd")] = { status: "Leave", notes: "Personal day" };
    } else if (userName === "Admin User") {
        records[format(today, "yyyy-MM-dd")] = { status: "Present", notes: "Admin tasks, system check" };
        records[format(subDays(today, 6), "yyyy-MM-dd")] = { status: "Present", notes: "User support" };
    } else if (userName === "Diana Prince") {
        records[format(subDays(today, 2), "yyyy-MM-dd")] = { status: "Holiday", notes: "Company Offsite" };
        records[format(subDays(today, 10), "yyyy-MM-dd")] = { status: "Absent", notes: "Unplanned absence" };
    } else if (userName === "Edward Scissorhands") {
        records[format(subDays(today, 0), "yyyy-MM-dd")] = { status: "Present", notes: "Full day" };
        records[format(subDays(today, 1), "yyyy-MM-dd")] = { status: "Present", notes: "Full day" };
        records[format(subDays(today, 2), "yyyy-MM-dd")] = { status: "Present", notes: "Full day" };
    }
    // Add a common holiday for all
    records["2024-07-04"] = { status: "Holiday", notes: "Independence Day" }; // Example holiday
    return records;
};

const initialAllUsersAttendanceData = MOCK_EMPLOYEE_NAMES.reduce((acc, name) => {
    acc[name] = generateUserAttendance(name);
    return acc;
}, {});


const statusConfig = {
  Present: { icon: CheckCircle, className: "rdp-day_present", color: "text-green-500", label: "Present" },
  Absent: { icon: XCircle, className: "rdp-day_absent", color: "text-red-500", label: "Absent" },
  Leave: { icon: MinusCircle, className: "rdp-day_leave", color: "text-yellow-500", label: "Leave" },
  Holiday: { icon: Info, className: "rdp-day_holiday", color: "text-blue-500", label: "Holiday" },
  Default: { icon: AlertTriangle, className: "text-muted-foreground", color: "text-muted-foreground", label: "N/A" },
};

export default function AttendancePage() {
  const { toast } = useToast();
  const { user } = useMockAuth();

  const [viewMode, setViewMode] = React.useState("daily");
  const [currentDate, setCurrentDate] = React.useState(new Date()); 
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  
  const [allUsersAttendance, setAllUsersAttendance] = React.useState(initialAllUsersAttendanceData);
  const [viewingUserName, setViewingUserName] = React.useState(null); // Name of the user whose attendance is being viewed
  const [currentRecords, setCurrentRecords] = React.useState({}); // Attendance records for the viewingUserName

  const [isMarkAttendanceDialogOpen, setIsMarkAttendanceDialogOpen] = React.useState(false);
  const [dayToMarkAttendance, setDayToMarkAttendance] = React.useState(null);

  const isAdminView = React.useMemo(() => {
    return user && (user.currentRole.value === 'admin' || user.currentRole.value === 'superadmin' || user.currentRole.value === 'manager');
  }, [user]);

  React.useEffect(() => {
    if (user) {
      if (isAdminView && MOCK_EMPLOYEE_NAMES.length > 0) {
        setViewingUserName(MOCK_EMPLOYEE_NAMES[0]); // Default to first user for admin
      } else {
        setViewingUserName(user.name); // Non-admin views their own
      }
    }
  }, [user, isAdminView]);

  React.useEffect(() => {
    if (viewingUserName && allUsersAttendance[viewingUserName]) {
      setCurrentRecords(allUsersAttendance[viewingUserName]);
    } else if (viewingUserName) { // User might not have records yet
      setCurrentRecords({});
    }
  }, [viewingUserName, allUsersAttendance]);


  const handleOpenMarkAttendanceDialog = (date) => {
    if (!viewingUserName) {
        toast({ title: "Error", description: "No user selected to mark attendance for.", variant: "destructive"});
        return;
    }
    setDayToMarkAttendance(date);
    setSelectedDate(date); 
    setIsMarkAttendanceDialogOpen(true);
  };

  const handleSaveAttendance = (date, status, notes) => {
    if (!viewingUserName) return;

    const dateString = format(date, "yyyy-MM-dd");
    setAllUsersAttendance(prevAll => {
      const userRecords = prevAll[viewingUserName] || {};
      return {
        ...prevAll,
        [viewingUserName]: {
          ...userRecords,
          [dateString]: { status, notes },
        },
      };
    });
    toast({
      title: "Attendance Updated",
      description: `Attendance for ${viewingUserName} on ${format(date, "PPP")} marked as ${status}.`,
    });
    setIsMarkAttendanceDialogOpen(false);
  };

  const handlePrev = () => {
    if (viewMode === "daily") setCurrentDate((prev) => subMonths(prev, 1));
    else if (viewMode === "weekly") setCurrentDate((prev) => subDays(currentDate, 7)); // Corrected to subDays
    else if (viewMode === "monthly") setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNext = () => {
    if (viewMode === "daily") setCurrentDate((prev) => addMonths(prev, 1));
    else if (viewMode === "weekly") setCurrentDate((prev) => addDays(currentDate, 7)); // Corrected to addDays
    else if (viewMode === "monthly") setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today); 
  };
  
  const handleMonthSelect = (month) => {
    setCurrentDate(month);
  };

  const modifiers = React.useMemo(() => {
    const mods = {};
    Object.keys(statusConfig).forEach(statusKey => {
      if (statusKey !== 'Default') {
        mods[statusKey.toLowerCase()] = (date) => 
          currentRecords[format(date, "yyyy-MM-dd")]?.status === statusKey;
      }
    });
    return mods;
  }, [currentRecords]);

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
    if (viewMode === "daily") return format(currentDate, "MMMM yyyy");
    if (viewMode === "weekly") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
    if (viewMode === "monthly") return format(currentDate, "MMMM yyyy");
    return "";
  };

  const legendItems = Object.values(statusConfig).filter(s => s.label !== "N/A");

  const cardTitleText = isAdminView && viewingUserName ? `Attendance: ${viewingUserName}` : "My Attendance";
  const cardDescriptionText = isAdminView && viewingUserName ? `Track and manage attendance for ${viewingUserName}.` : "Track and manage your attendance records.";

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {isAdminView ? <Users className="h-8 w-8 text-primary" /> : <CalendarIconLucide className="h-8 w-8 text-primary" />}
                <CardTitle className="text-3xl">{cardTitleText}</CardTitle>
              </div>
              <CardDescription>
                {cardDescriptionText}
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenMarkAttendanceDialog(selectedDate || new Date())} disabled={!viewingUserName}>
              <PlusCircle className="mr-2 h-5 w-5" /> 
              Mark Attendance {isAdminView && viewingUserName ? `for ${viewingUserName.split(' ')[0]}` : ""}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAdminView && (
            <div className="mb-6">
              <Label htmlFor="user-select" className="text-sm font-medium">View Attendance For:</Label>
              <Select value={viewingUserName || ''} onValueChange={(value) => { if(value) setViewingUserName(value); }}>
                <SelectTrigger id="user-select" className="w-full md:w-[300px] mt-1">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_EMPLOYEE_NAMES.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
                    mode="single" // For month/year navigation popover
                    selected={currentDate} // Selected is the current month for navigation
                    onSelect={(date) => { if (date) handleMonthSelect(date); }} // For changing month via popover calendar click
                    month={currentDate} // Controlled month
                    onMonthChange={setCurrentDate} // Handles built-in nav buttons of popover calendar
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear() - 5}
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
                  attendanceRecords={currentRecords} 
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
              <MonthlySummary currentDate={currentDate} attendanceRecords={currentRecords} statusConfig={statusConfig} />
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Legend:</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {legendItems.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className={`h-3 w-3 rounded-full inline-block ${item.className.split(' ')[0].replace('!','')}`}></span>
                  <span className="text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>

      {isMarkAttendanceDialogOpen && dayToMarkAttendance && viewingUserName && (
        <MarkAttendanceDialog
          isOpen={isMarkAttendanceDialogOpen}
          onClose={() => setIsMarkAttendanceDialogOpen(false)}
          selectedDate={dayToMarkAttendance}
          currentAttendance={currentRecords[format(dayToMarkAttendance, "yyyy-MM-dd")]}
          onSave={handleSaveAttendance}
          statusOptions={Object.keys(statusConfig).filter(s => s !== "Default" && s !== "Holiday")}
          userName={viewingUserName}
        />
      )}
    </div>
  );
}
