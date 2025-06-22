"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, subMonths, addMonths, setDate } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Search } from "lucide-react";
import { useEmployeeStore } from "@/store/employeeStore";
import { useToast } from "@/hooks/use-toast";

// Function to convert number to words
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + numberToWords(num % 100000) : '');
  return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + numberToWords(num % 10000000) : '');
};

const paySlipFormSchema = z.object({
  selectedEmployeeId: z.string().min(1, { message: "Please select an employee." }),
  employeeName: z.string().min(2, { message: "Employee name is required." }),
  employeeId: z.string().min(1, { message: "Employee ID is required." }),
  employeeEmail: z.string().email({ message: "Please enter a valid email for the employee."}),
  department: z.string().min(2, { message: "Department is required." }),
  positionTitle: z.string().min(3, { message: "Position title is required." }),
  payPeriodStartDate: z.date({ required_error: "Pay period start date is required." }),
  payPeriodEndDate: z.date({ required_error: "Pay period end date is required." }),
  paymentDate: z.date({ required_error: "Payment date is required." }),
  yearlySalary: z.preprocess(
    (val) => (val === "" ? undefined : parseFloat(String(val))), 
    z.number({ required_error: "Yearly salary is required.", invalid_type_error: "Yearly salary must be a number." })
     .positive({ message: "Yearly salary must be positive." })
  ),
  allowancesStr: z.string().optional(),
  deductionsStr: z.string().optional(),
}).refine(data => data.payPeriodEndDate >= data.payPeriodStartDate, {
    message: "Pay period end date must be after or same as start date.",
    path: ["payPeriodEndDate"],
});

export function PaySlipForm({ onSubmit, isLoading }) {
  const { toast } = useToast();
  const { employees, initializeEmployees } = useEmployeeStore();
  const [isLoadingEmployees, setIsLoadingEmployees] = React.useState(false);
  const [salaryBreakdown, setSalaryBreakdown] = React.useState(null);

  // Calculate default dates
  const getDefaultDates = () => {
    const now = new Date();
    const previousMonth = subMonths(now, 1);
    const currentMonth = now;
    
    const payPeriodStart = setDate(previousMonth, 25);
    const payPeriodEnd = setDate(currentMonth, 25);
    const paymentDate = setDate(addMonths(currentMonth, 1), 6);
    
    return { payPeriodStart, payPeriodEnd, paymentDate };
  };

  const defaultDates = getDefaultDates();

  const form = useForm({
    resolver: zodResolver(paySlipFormSchema),
    defaultValues: {
      selectedEmployeeId: "",
      employeeName: "",
      employeeId: "",
      employeeEmail: "",
      department: "",
      positionTitle: "",
      payPeriodStartDate: defaultDates.payPeriodStart,
      payPeriodEndDate: defaultDates.payPeriodEnd,
      paymentDate: defaultDates.paymentDate,
      yearlySalary: "", // Yearly salary in INR
      allowancesStr: "",
      deductionsStr: "",
    },
  });

  // Watch yearly salary for breakdown calculation
  const yearlySalary = form.watch("yearlySalary");

  // Calculate salary breakdown when yearly salary changes and update allowances/deductions
  React.useEffect(() => {
    if (yearlySalary && !isNaN(yearlySalary)) {
      const monthlySalary = yearlySalary / 12;
      const basicSalary = monthlySalary * 0.5; // 50% of monthly salary as basic
      const hra = monthlySalary * 0.4; // 40% of monthly salary as HRA
      const specialAllowance = monthlySalary * 0.1; // 10% as special allowance
      
      const totalAllowances = hra + specialAllowance;
      const grossSalary = basicSalary + totalAllowances;
      const tds = grossSalary * 0.1; // 10% TDS
      const netSalary = grossSalary - tds;

      // Update allowances field with calculated values
      const allowancesText = `Basic Salary (50%): ₹${Math.round(basicSalary).toLocaleString()}\nHouse Rent Allowance (HRA) (40%): ₹${Math.round(hra).toLocaleString()}\nSpecial Allowance (10%): ₹${Math.round(specialAllowance).toLocaleString()}\nTotal Allowances: ₹${Math.round(totalAllowances).toLocaleString()}\nGross Salary: ₹${Math.round(grossSalary).toLocaleString()}`;
      
      // Update deductions field with TDS only
      const deductionsText = `Tax Deducted at Source (TDS) (10%): ₹${Math.round(tds).toLocaleString()}\nNet Salary: ₹${Math.round(netSalary).toLocaleString()}\n${numberToWords(Math.round(netSalary))} Rupees Only`;

      form.setValue("allowancesStr", allowancesText);
      form.setValue("deductionsStr", deductionsText);

      setSalaryBreakdown({
        monthlySalary: Math.round(monthlySalary),
        basicSalary: Math.round(basicSalary),
        hra: Math.round(hra),
        specialAllowance: Math.round(specialAllowance),
        totalAllowances: Math.round(totalAllowances),
        grossSalary: Math.round(grossSalary),
        tds: Math.round(tds),
        netSalary: Math.round(netSalary),
        netSalaryInWords: numberToWords(Math.round(netSalary))
      });
    } else {
      setSalaryBreakdown(null);
      form.setValue("allowancesStr", "");
      form.setValue("deductionsStr", "");
    }
  }, [yearlySalary, form]);

  // Load employees on component mount
  React.useEffect(() => {
    const loadEmployees = async () => {
      setIsLoadingEmployees(true);
      try {
        await initializeEmployees();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load employees. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, [initializeEmployees, toast]);

  // Auto-fill employee details when employee is selected
  const handleEmployeeSelect = (employeeId) => {
    const selectedEmployee = employees.find(emp => emp.id === employeeId);
    if (selectedEmployee) {
      form.setValue("selectedEmployeeId", employeeId);
      form.setValue("employeeName", selectedEmployee.name || "");
      form.setValue("employeeId", selectedEmployee.employeeCode || "");
      form.setValue("employeeEmail", selectedEmployee.email || "");
      form.setValue("department", selectedEmployee.department || "");
      form.setValue("positionTitle", selectedEmployee.designation || "");
      
      // Set yearly salary if available
      if (selectedEmployee.salary) {
        // Remove currency symbols and convert to number
        const salaryStr = selectedEmployee.salary.toString().replace(/[₹,]/g, '');
        const salary = parseFloat(salaryStr);
        if (!isNaN(salary)) {
          form.setValue("yearlySalary", salary.toString());
        }
      }

      toast({
        title: "Employee Selected",
        description: `Details for ${selectedEmployee.name} have been auto-filled.`,
      });
    }
  };

  const handleSubmit = (values) => {
    const formattedValues = {
      ...values,
      payPeriodStartDate: format(values.payPeriodStartDate, "MMMM d, yyyy"),
      payPeriodEndDate: format(values.payPeriodEndDate, "MMMM d, yyyy"),
      paymentDate: format(values.paymentDate, "MMMM d, yyyy"),
      yearlySalary: parseFloat(values.yearlySalary),
      basicSalary: salaryBreakdown ? salaryBreakdown.basicSalary : 0,
      netSalary: salaryBreakdown ? salaryBreakdown.netSalary : 0,
      netSalaryInWords: salaryBreakdown ? salaryBreakdown.netSalaryInWords : "",
      companyName: "PESU Venture Labs",
      companyAddress: "PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085",
      companyLogoUrl: "https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png",
    };
    onSubmit(formattedValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="selectedEmployeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Employee</FormLabel>
              <Select
                onValueChange={handleEmployeeSelect}
                value={field.value}
                disabled={isLoadingEmployees}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingEmployees ? "Loading employees..." : "Select an employee to auto-fill details"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{employee.name}</span>
                        <span className="text-muted-foreground">({employee.employeeCode})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Employee Details
          </h3>
        </div>

        <FormField
          control={form.control}
          name="employeeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Vijay Kumar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g., PVL00234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="employeeEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g., vijay.kumar@pesuventurelabs.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Engineering" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="positionTitle"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Position Title</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Software Development Engineer II" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="payPeriodStartDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Pay Period Start Date</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="payPeriodEndDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Pay Period End Date</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Payment Date</FormLabel>
                <DatePicker date={field.value} setDate={field.onChange} />
                <FormMessage />
                </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="yearlySalary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Yearly Salary (INR)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 600000" {...field} step="1000"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allowancesStr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allowances & Salary Breakdown</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Salary breakdown will be auto-populated when you enter yearly salary"
                  className="resize-none"
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deductionsStr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deductions & Net Salary</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deductions and net salary will be auto-populated when you enter yearly salary"
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Pay Slip...
            </>
          ) : (
            "Generate Pay Slip"
          )}
        </Button>
      </form>
    </Form>
  );
}
