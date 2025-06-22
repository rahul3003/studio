"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Eye, Edit, CheckCircle, XCircle, Download, Calendar, DollarSign, Users } from "lucide-react";
import { format } from "date-fns";

// Mock data - replace with actual API calls
const mockEmployees = [
  { id: "1", name: "John Doe", email: "john@example.com", employeeCode: "EMP001", designation: "Senior Developer" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", employeeCode: "EMP002", designation: "Product Manager" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com", employeeCode: "EMP003", designation: "UI Designer" },
];

const mockMonthlySalaries = [
  {
    id: "1",
    employeeId: "1",
    employee: mockEmployees[0],
    year: 2024,
    month: 12,
    payPeriodStart: "2024-11-25",
    payPeriodEnd: "2024-12-25",
    paymentDate: "2025-01-06",
    basicSalary: 50000,
    hra: 20000,
    da: 5000,
    conveyanceAllowance: 1600,
    medicalAllowance: 1250,
    specialAllowance: 10000,
    bonus: 0,
    incentives: 0,
    overtime: 0,
    providentFund: 6000,
    professionalTax: 200,
    tds: 5000,
    grossEarnings: 87650,
    totalDeductions: 11200,
    netSalary: 76450,
    workingDays: 22,
    paidDays: 22,
    status: "APPROVED",
    createdAt: "2024-12-26T10:00:00Z"
  },
  {
    id: "2",
    employeeId: "2",
    employee: mockEmployees[1],
    year: 2024,
    month: 12,
    payPeriodStart: "2024-11-25",
    payPeriodEnd: "2024-12-25",
    paymentDate: "2025-01-06",
    basicSalary: 60000,
    hra: 24000,
    da: 6000,
    conveyanceAllowance: 1600,
    medicalAllowance: 1250,
    specialAllowance: 12000,
    bonus: 5000,
    incentives: 0,
    overtime: 0,
    providentFund: 7200,
    professionalTax: 200,
    tds: 8000,
    grossEarnings: 106850,
    totalDeductions: 15400,
    netSalary: 91450,
    workingDays: 22,
    paidDays: 22,
    status: "PENDING",
    createdAt: "2024-12-26T11:00:00Z"
  }
];

const SalaryManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState(mockEmployees);
  const [monthlySalaries, setMonthlySalaries] = useState(mockMonthlySalaries);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Form states for creating/editing salary
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    employeeId: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    basicSalary: "",
    hra: "",
    da: "",
    conveyanceAllowance: "",
    medicalAllowance: "",
    specialAllowance: "",
    bonus: "",
    incentives: "",
    overtime: "",
    providentFund: "",
    professionalTax: "",
    tds: "",
    workingDays: "",
    paidDays: "",
    remarks: ""
  });

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "warning";
      case "APPROVED": return "success";
      case "PAID": return "default";
      case "CANCELLED": return "destructive";
      default: return "secondary";
    }
  };

  const calculateTotals = (formData) => {
    const allowances = (parseFloat(formData.hra) || 0) + 
                      (parseFloat(formData.da) || 0) + 
                      (parseFloat(formData.conveyanceAllowance) || 0) + 
                      (parseFloat(formData.medicalAllowance) || 0) + 
                      (parseFloat(formData.specialAllowance) || 0);
    
    const earnings = (parseFloat(formData.bonus) || 0) + 
                     (parseFloat(formData.incentives) || 0) + 
                     (parseFloat(formData.overtime) || 0);
    
    const grossEarnings = (parseFloat(formData.basicSalary) || 0) + allowances + earnings;
    
    const deductions = (parseFloat(formData.providentFund) || 0) + 
                       (parseFloat(formData.professionalTax) || 0) + 
                       (parseFloat(formData.tds) || 0);
    
    const netSalary = grossEarnings - deductions;
    
    return { grossEarnings, totalDeductions: deductions, netSalary };
  };

  const handleCreateSalary = async () => {
    if (!salaryForm.employeeId || !salaryForm.basicSalary) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const totals = calculateTotals(salaryForm);
      const employee = employees.find(emp => emp.id === salaryForm.employeeId);
      
      const newSalary = {
        id: Date.now().toString(),
        employeeId: salaryForm.employeeId,
        employee,
        year: salaryForm.year,
        month: salaryForm.month,
        payPeriodStart: "2024-11-25", // Calculate based on month
        payPeriodEnd: "2024-12-25",   // Calculate based on month
        paymentDate: "2025-01-06",    // Calculate based on month
        basicSalary: parseFloat(salaryForm.basicSalary),
        hra: parseFloat(salaryForm.hra) || 0,
        da: parseFloat(salaryForm.da) || 0,
        conveyanceAllowance: parseFloat(salaryForm.conveyanceAllowance) || 0,
        medicalAllowance: parseFloat(salaryForm.medicalAllowance) || 0,
        specialAllowance: parseFloat(salaryForm.specialAllowance) || 0,
        bonus: parseFloat(salaryForm.bonus) || 0,
        incentives: parseFloat(salaryForm.incentives) || 0,
        overtime: parseFloat(salaryForm.overtime) || 0,
        providentFund: parseFloat(salaryForm.providentFund) || 0,
        professionalTax: parseFloat(salaryForm.professionalTax) || 0,
        tds: parseFloat(salaryForm.tds) || 0,
        grossEarnings: totals.grossEarnings,
        totalDeductions: totals.totalDeductions,
        netSalary: totals.netSalary,
        workingDays: parseInt(salaryForm.workingDays),
        paidDays: parseInt(salaryForm.paidDays),
        status: "PENDING",
        createdAt: new Date().toISOString()
      };

      setMonthlySalaries(prev => [newSalary, ...prev]);
      setIsCreateDialogOpen(false);
      setSalaryForm({
        employeeId: "",
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        basicSalary: "",
        hra: "",
        da: "",
        conveyanceAllowance: "",
        medicalAllowance: "",
        specialAllowance: "",
        bonus: "",
        incentives: "",
        overtime: "",
        providentFund: "",
        professionalTax: "",
        tds: "",
        workingDays: "",
        paidDays: "",
        remarks: ""
      });

      toast({
        title: "Salary Created",
        description: "Monthly salary record has been created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create salary record",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveSalary = async (salaryId) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMonthlySalaries(prev => 
        prev.map(salary => 
          salary.id === salaryId 
            ? { ...salary, status: "APPROVED" }
            : salary
        )
      );
      toast({
        title: "Salary Approved",
        description: "Salary has been approved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve salary",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async (salaryId) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMonthlySalaries(prev => 
        prev.map(salary => 
          salary.id === salaryId 
            ? { ...salary, status: "PAID" }
            : salary
        )
      );
      toast({
        title: "Salary Marked as Paid",
        description: "Salary has been marked as paid"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark salary as paid",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSalaryStatistics = () => {
    const totalSalaries = monthlySalaries.length;
    const totalAmount = monthlySalaries.reduce((sum, salary) => sum + salary.netSalary, 0);
    const averageSalary = totalSalaries > 0 ? totalAmount / totalSalaries : 0;
    const pendingCount = monthlySalaries.filter(s => s.status === "PENDING").length;
    const approvedCount = monthlySalaries.filter(s => s.status === "APPROVED").length;
    const paidCount = monthlySalaries.filter(s => s.status === "PAID").length;

    return { totalSalaries, totalAmount, averageSalary, pendingCount, approvedCount, paidCount };
  };

  const filteredSalaries = monthlySalaries.filter(salary => {
    if (selectedEmployee && salary.employeeId !== selectedEmployee) return false;
    if (selectedYear && salary.year !== selectedYear) return false;
    if (selectedMonth && salary.month !== selectedMonth) return false;
    return true;
  });

  const stats = getSalaryStatistics();

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Salary Management</CardTitle>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Salary
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Monthly Salary</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new monthly salary record
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="employee">Employee *</Label>
                      <Select value={salaryForm.employeeId} onValueChange={(value) => setSalaryForm(prev => ({ ...prev, employeeId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map(employee => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name} - {employee.employeeCode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="year">Year</Label>
                        <Select value={salaryForm.year.toString()} onValueChange={(value) => setSalaryForm(prev => ({ ...prev, year: parseInt(value) }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="month">Month</Label>
                        <Select value={salaryForm.month.toString()} onValueChange={(value) => setSalaryForm(prev => ({ ...prev, month: parseInt(value) }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map(month => (
                              <SelectItem key={month.value} value={month.value.toString()}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="basicSalary">Basic Salary *</Label>
                      <Input
                        id="basicSalary"
                        type="number"
                        value={salaryForm.basicSalary}
                        onChange={(e) => setSalaryForm(prev => ({ ...prev, basicSalary: e.target.value }))}
                        placeholder="50000"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="workingDays">Working Days</Label>
                        <Input
                          id="workingDays"
                          type="number"
                          value={salaryForm.workingDays}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, workingDays: e.target.value }))}
                          placeholder="22"
                        />
                      </div>
                      <div>
                        <Label htmlFor="paidDays">Paid Days</Label>
                        <Input
                          id="paidDays"
                          type="number"
                          value={salaryForm.paidDays}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, paidDays: e.target.value }))}
                          placeholder="22"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Allowances</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hra">HRA</Label>
                        <Input
                          id="hra"
                          type="number"
                          value={salaryForm.hra}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, hra: e.target.value }))}
                          placeholder="20000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="da">DA</Label>
                        <Input
                          id="da"
                          type="number"
                          value={salaryForm.da}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, da: e.target.value }))}
                          placeholder="5000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="conveyanceAllowance">Conveyance</Label>
                        <Input
                          id="conveyanceAllowance"
                          type="number"
                          value={salaryForm.conveyanceAllowance}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, conveyanceAllowance: e.target.value }))}
                          placeholder="1600"
                        />
                      </div>
                      <div>
                        <Label htmlFor="medicalAllowance">Medical</Label>
                        <Input
                          id="medicalAllowance"
                          type="number"
                          value={salaryForm.medicalAllowance}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, medicalAllowance: e.target.value }))}
                          placeholder="1250"
                        />
                      </div>
                      <div>
                        <Label htmlFor="specialAllowance">Special</Label>
                        <Input
                          id="specialAllowance"
                          type="number"
                          value={salaryForm.specialAllowance}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, specialAllowance: e.target.value }))}
                          placeholder="10000"
                        />
                      </div>
                    </div>

                    <h3 className="font-semibold">Additional Earnings</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="bonus">Bonus</Label>
                        <Input
                          id="bonus"
                          type="number"
                          value={salaryForm.bonus}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, bonus: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="incentives">Incentives</Label>
                        <Input
                          id="incentives"
                          type="number"
                          value={salaryForm.incentives}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, incentives: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="overtime">Overtime</Label>
                        <Input
                          id="overtime"
                          type="number"
                          value={salaryForm.overtime}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, overtime: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <h3 className="font-semibold">Deductions</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="providentFund">PF</Label>
                        <Input
                          id="providentFund"
                          type="number"
                          value={salaryForm.providentFund}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, providentFund: e.target.value }))}
                          placeholder="6000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="professionalTax">PT</Label>
                        <Input
                          id="professionalTax"
                          type="number"
                          value={salaryForm.professionalTax}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, professionalTax: e.target.value }))}
                          placeholder="200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tds">TDS</Label>
                        <Input
                          id="tds"
                          type="number"
                          value={salaryForm.tds}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, tds: e.target.value }))}
                          placeholder="5000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSalary} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Salary
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Manage employee salaries, track payments, and generate reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="salaries">Salary Records</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Salaries</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalSalaries}</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Net salary paid</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{Math.round(stats.averageSalary).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Per employee</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingCount}</div>
                    <p className="text-xs text-muted-foreground">Awaiting approval</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Salary Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlySalaries.slice(0, 5).map(salary => (
                        <div key={salary.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{salary.employee.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {months[salary.month - 1]?.label} {salary.year}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{salary.netSalary.toLocaleString()}</p>
                            <Badge variant={getStatusColor(salary.status)}>
                              {salary.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Pending</span>
                        <Badge variant="warning">{stats.pendingCount}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Approved</span>
                        <Badge variant="success">{stats.approvedCount}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Paid</span>
                        <Badge variant="default">{stats.paidCount}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="salaries" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Employees</SelectItem>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Months</SelectItem>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Salary Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Basic Salary</TableHead>
                        <TableHead>Gross Earnings</TableHead>
                        <TableHead>Deductions</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSalaries.map(salary => (
                        <TableRow key={salary.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{salary.employee.name}</p>
                              <p className="text-sm text-muted-foreground">{salary.employee.employeeCode}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{months[salary.month - 1]?.label} {salary.year}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(salary.payPeriodStart), 'MMM dd')} - {format(new Date(salary.payPeriodEnd), 'MMM dd')}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>₹{salary.basicSalary.toLocaleString()}</TableCell>
                          <TableCell>₹{salary.grossEarnings.toLocaleString()}</TableCell>
                          <TableCell>₹{salary.totalDeductions.toLocaleString()}</TableCell>
                          <TableCell className="font-medium">₹{salary.netSalary.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(salary.status)}>
                              {salary.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              {salary.status === "PENDING" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleApproveSalary(salary.id)}
                                  disabled={isLoading}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {salary.status === "APPROVED" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleMarkAsPaid(salary.id)}
                                  disabled={isLoading}
                                >
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Salary Reports</CardTitle>
                  <CardDescription>
                    Generate and download salary reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-32 flex flex-col gap-2">
                      <Download className="h-8 w-8" />
                      <span>Monthly Payroll Report</span>
                    </Button>
                    <Button variant="outline" className="h-32 flex flex-col gap-2">
                      <Download className="h-8 w-8" />
                      <span>Yearly Salary Summary</span>
                    </Button>
                    <Button variant="outline" className="h-32 flex flex-col gap-2">
                      <Download className="h-8 w-8" />
                      <span>Department-wise Report</span>
                    </Button>
                    <Button variant="outline" className="h-32 flex flex-col gap-2">
                      <Download className="h-8 w-8" />
                      <span>Tax Deduction Report</span>
                    </Button>
                    <Button variant="outline" className="h-32 flex flex-col gap-2">
                      <Download className="h-8 w-8" />
                      <span>Allowance Report</span>
                    </Button>
                    <Button variant="outline" className="h-32 flex flex-col gap-2">
                      <Download className="h-8 w-8" />
                      <span>Custom Report</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Salary Settings</CardTitle>
                  <CardDescription>
                    Configure salary-related settings and defaults
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Default Allowances</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="defaultHra">Default HRA (%)</Label>
                          <Input id="defaultHra" type="number" placeholder="40" />
                        </div>
                        <div>
                          <Label htmlFor="defaultDa">Default DA (%)</Label>
                          <Input id="defaultDa" type="number" placeholder="10" />
                        </div>
                        <div>
                          <Label htmlFor="defaultConveyance">Default Conveyance</Label>
                          <Input id="defaultConveyance" type="number" placeholder="1600" />
                        </div>
                        <div>
                          <Label htmlFor="defaultMedical">Default Medical</Label>
                          <Input id="defaultMedical" type="number" placeholder="1250" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Default Deductions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="defaultPf">Default PF (%)</Label>
                          <Input id="defaultPf" type="number" placeholder="12" />
                        </div>
                        <div>
                          <Label htmlFor="defaultPt">Default Professional Tax</Label>
                          <Input id="defaultPt" type="number" placeholder="200" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Pay Period Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="payPeriodStart">Pay Period Start Day</Label>
                          <Input id="payPeriodStart" type="number" placeholder="25" />
                        </div>
                        <div>
                          <Label htmlFor="paymentDay">Payment Day</Label>
                          <Input id="paymentDay" type="number" placeholder="6" />
                        </div>
                      </div>
                    </div>

                    <Button>Save Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryManagement; 