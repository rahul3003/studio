"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, TrendingUp, Users, FileText, CheckCircle, Clock, AlertCircle, Plus } from "lucide-react";
import useSalaryStore from "@/store/salaryStore";
import { useAuthStore } from "@/store/authStore";

export default function SalaryManagementPage() {
  const { currentRole } = useAuthStore();
  const { 
    monthlySalaries, 
    statistics, 
    loading, 
    error,
    fetchMonthlySalaries, 
    fetchStatistics,
    approveSalary,
    rejectSalary,
    createMonthlySalary,
    createSampleData
  } = useSalaryStore();

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Only fetch data if we have the required methods
    if (fetchMonthlySalaries && fetchStatistics) {
      fetchMonthlySalaries();
      fetchStatistics();
    }
  }, [fetchMonthlySalaries, fetchStatistics]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canManageSalaries = ['SUPERADMIN', 'ADMIN', 'ACCOUNTS', 'HR'].includes(currentRole);

  const handleCreateSampleData = async () => {
    try {
      const result = await createSampleData();
      if (result && result.length > 0) {
        alert(`Successfully created ${result.length} salary records!`);
      } else {
        alert('No new salary records created. All employees already have salary records for this month.');
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Error creating sample data: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Error loading salary data: {error}</p>
              {canManageSalaries && (
                <Button onClick={handleCreateSampleData} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Sample Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salary Management</h1>
          <p className="text-muted-foreground">
            Manage employee salaries, approvals, and payroll processing
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">Salary Records</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(statistics?.totalPayroll || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.totalEmployees || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active employees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.pendingApprovals || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Require action
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(statistics?.averageSalary || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Per employee
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Salary Activities</CardTitle>
              <CardDescription>
                Latest salary processing and approval activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlySalaries.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No salary records found</p>
                    <p className="text-sm text-muted-foreground mb-4">Salary records will appear here once they are created</p>
                    {canManageSalaries && (
                      <Button onClick={handleCreateSampleData} className="mt-2">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Sample Data
                      </Button>
                    )}
                  </div>
                ) : (
                  monthlySalaries.slice(0, 5).map((salary) => (
                    <div key={salary.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{salary.employee?.name || 'Unknown Employee'}</p>
                          <p className="text-sm text-muted-foreground">
                            {`${salary.month}/${salary.year}`} • {salary.employee?.department?.name || 'No Department'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(salary.netSalary)}</p>
                          <p className="text-sm text-muted-foreground">{salary.status}</p>
                        </div>
                        {getStatusBadge(salary.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Salary Records</CardTitle>
              <CardDescription>
                View and manage all salary records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    {canManageSalaries && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlySalaries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManageSalaries ? 7 : 6} className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No salary records found</p>
                        <p className="text-sm text-muted-foreground mb-4">Salary records will appear here once they are created</p>
                        {canManageSalaries && (
                          <Button onClick={handleCreateSampleData} className="mt-2">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Sample Data
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    monthlySalaries.map((salary) => (
                      <TableRow key={salary.id}>
                        <TableCell className="font-medium">
                          {salary.employee?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>{salary.employee?.department?.name || 'N/A'}</TableCell>
                        <TableCell>{`${salary.month}/${salary.year}`}</TableCell>
                        <TableCell>{formatCurrency(salary.basicSalary)}</TableCell>
                        <TableCell>{formatCurrency(salary.netSalary)}</TableCell>
                        <TableCell>{getStatusBadge(salary.status)}</TableCell>
                        {canManageSalaries && (
                          <TableCell>
                            <div className="flex space-x-2">
                              {salary.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => approveSalary(salary.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => rejectSalary(salary.id)}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Salary Distribution</CardTitle>
                <CardDescription>
                  Salary distribution across departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!statistics?.departmentStats || statistics.departmentStats.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No department data available</p>
                      <p className="text-sm text-muted-foreground">Department statistics will appear here once salary records are created</p>
                    </div>
                  ) : (
                    statistics.departmentStats.map((dept) => (
                      <div key={dept.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{dept.name}</span>
                          <span>{formatCurrency(dept.totalSalary)}</span>
                        </div>
                        <Progress value={dept.percentage} className="h-2" />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>
                  Salary trends over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!statistics?.monthlyTrends || statistics.monthlyTrends.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No trend data available</p>
                      <p className="text-sm text-muted-foreground">Monthly trends will appear here once salary records are created</p>
                    </div>
                  ) : (
                    statistics.monthlyTrends.map((trend) => (
                      <div key={trend.month} className="flex justify-between items-center">
                        <span className="text-sm">{trend.month}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{formatCurrency(trend.amount)}</span>
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Salary Settings</CardTitle>
              <CardDescription>
                Configure salary processing and approval workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Auto-approval threshold</label>
                    <p className="text-sm text-muted-foreground">
                      Salaries below this amount will be auto-approved
                    </p>
                  </div>
                  <div>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      placeholder="50000"
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Pay day</label>
                    <p className="text-sm text-muted-foreground">
                      Day of month when salaries are processed
                    </p>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="w-full p-2 border rounded"
                      placeholder="25"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Notification settings</label>
                    <p className="text-sm text-muted-foreground">
                      Email notifications for salary approvals
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Enable notifications</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 