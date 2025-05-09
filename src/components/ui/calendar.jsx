
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DropdownProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" // Import Select component
import { ScrollArea } from "./scroll-area"


function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "buttons", // default to original buttons
  ...props
}) {

  const handleCalendarChange = (_key, value, _dropdown) => {
    const newDate = new Date(props.month || new Date());
    if (_dropdown === "month") {
      newDate.setMonth(value);
    } else if (_dropdown === "year") {
      newDate.setFullYear(value);
    }
    props.onMonthChange?.(newDate);
  };
  
  const CustomDropdown = (dropdownProps) => {
    const { fromMonth, fromYear, toMonth, toYear } = dropdownProps;
    const currentYear = props.month?.getFullYear() || new Date().getFullYear();
    const currentMonth = props.month?.getMonth() || new Date().getMonth();

    const months = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(currentYear, i);
      return {
        value: i,
        label: format(monthDate, "MMMM")
      };
    }).filter(month => 
      !(fromMonth && currentYear === fromMonth.getFullYear() && i < fromMonth.getMonth()) &&
      !(toMonth && currentYear === toMonth.getFullYear() && i > toMonth.getMonth())
    );

    const years = [];
    const startYear = fromYear || (new Date().getFullYear() - 100);
    const endYear = toYear || (new Date().getFullYear() + 10);
    for (let i = startYear; i <= endYear; i++) {
      years.push({ value: i, label: i.toString() });
    }

    return (
      <div className="rdp-caption_dropdowns">
        <Select
          value={currentMonth.toString()}
          onValueChange={(value) => handleCalendarChange("month", parseInt(value), "month")}
        >
          <SelectTrigger className="rdp-dropdown_month w-[120px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
            </ScrollArea>
          </SelectContent>
        </Select>
        <Select
          value={currentYear.toString()}
          onValueChange={(value) => handleCalendarChange("year", parseInt(value), "year")}
        >
          <SelectTrigger className="rdp-dropdown_year w-[90px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
             <ScrollArea className="h-[200px]">
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value.toString()}>
                  {year.label}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
    );
  };


  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: cn("flex justify-center pt-1 relative items-center", captionLayout === "dropdown-buttons" && "w-full"),
        caption_label: cn("text-sm font-medium", captionLayout === "dropdown-buttons" && "hidden"),
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30", // Added opacity for selected outside days
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className: c, ...rest }) => ( // Renamed className to c to avoid conflict
          <ChevronLeft className={cn("h-4 w-4", c)} {...rest} />
        ),
        IconRight: ({ className: c, ...rest }) => ( // Renamed className to c
          <ChevronRight className={cn("h-4 w-4", c)} {...rest} />
        ),
        Dropdown: captionLayout === "dropdown-buttons" ? CustomDropdown : undefined,
      }}
      captionLayout={captionLayout}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

// Helper to format date for labels, etc. (could be in utils)
const format = (date, fmt) => {
  // Basic formatting, replace with date-fns if available and needed for complex formats
  if (fmt === "MMMM") return date.toLocaleString('default', { month: 'long' });
  return date.toLocaleDateString();
};


export { Calendar }


    