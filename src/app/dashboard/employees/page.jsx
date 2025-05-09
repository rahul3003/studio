
"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

// Mock employee data
const employees = [
  {
    id: "EMP001",
    name: "Alice Wonderland",
    email: "alice.wonderland@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=alice",
    role: "Software Engineer",
    department: "Technology",
    status: "Active",
    joinDate: "2022-08-15",
  },
  {
    id: "EMP002",
    name: "Bob The Builder",
    email: "bob.builder@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=bob",
    role: "Project Manager",
    department: "Operations",
    status: "Active",
    joinDate: "2021-05-20",
  },
  {
    id: "EMP003",
    name: "Charlie Chaplin",
    email: "charlie.chaplin@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=charlie",
    role: "UX Designer",
    department: "Design",
    status: "On Leave",
    joinDate: "2023-01-10",
  },
  {
    id: "EMP004",
    name: "Diana Prince",
    email: "diana.prince@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=diana",
    role: "HR Specialist",
    department: "Human Resources",
    status: "Active",
    joinDate: "2020-03-01",
  },
  {
    id: "EMP005",
    name: "Edward Scissorhands",
    email: "edward.hands@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=edward",
    role: "Frontend Developer",
    department: "Technology",
    status: "Terminated",
    joinDate: "2022-11-01",
  },
  {
    id: "EMP006",
    name: "Fiona Gallagher",
    email: "fiona.gallagher@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=fiona",
    role: "Sales Executive",
    department: "Sales",
    status: "Active",
    joinDate: "2023-06-22",
  },
];

const statusVariantMap = {
  Active: "default", // Uses primary theme color
  "On Leave": "secondary", // Uses secondary theme color (typically grayish)
  Terminated: "destructive", // Uses destructive theme color (typically red)
};

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-3xl">Manage Employees</CardTitle>
            <CardDescription>
              View, add, and manage employee information within the HRMS portal.
            </CardDescription>
          </div>
          <Button className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Employee
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="person face" />
                        <AvatarFallback>
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      {new Date(employee.joinDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[employee.status] || "outline"}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="mr-1 hover:bg-accent/20">
                        <Edit className="h-4 w-4 text-primary" />
                        <span className="sr-only">Edit {employee.name}</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-destructive/20">
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete {employee.name}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {employees.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">
              No employees found. Click "Add New Employee" to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
