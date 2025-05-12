"use client";

import * as React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMockAuth } from "@/hooks/use-mock-auth";

import {
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Briefcase,
  Paperclip,
} from "lucide-react";

// Mock data relevant to this page
const mockProfileData = {
  primaryData: {
    phone: "+1 234 567 8900",
    address: "123 Innovation Drive, Tech City, TC 54321",
    profilePhoto: "https://i.pravatar.cc/150?u=profile",
    idProof: "ID_Proof_JohnDoe.pdf",
    addressProof: "Address_Proof_JohnDoe.pdf",
    joiningDate: "2022-08-15",
    department: "Technology",
    companyName: "PESU Venture Labs"
  },
  secondaryData: {
    currentPosition: "Senior Software Engineer",
    currentRemuneration: "USD 95,000 per annum",
    leaveBalance: { // This might also move to 'My Attendance' page later or be a summary here
      annual: 15,
      sick: 8,
      totalAnnual: 20,
      totalSick: 10,
    },
    managerName: "Alice Wonderland",
    managerDepartment: "Technology",
  },
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useMockAuth();

  if (authLoading || !user) {
    return <div>Loading profile...</div>; // Or a skeleton loader
  }

  const profilePhotoUrl = user.avatar || mockProfileData.primaryData.profilePhoto || `https://i.pravatar.cc/150?u=${user.email}`;

  return (
    <div className="space-y-8 p-4 md:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={profilePhotoUrl} alt={user.name} data-ai-hint="person face portrait"/>
              <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{user.name}</CardTitle>
              <CardDescription className="text-md">{mockProfileData.secondaryData.currentPosition}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Primary Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><UserCircle2 /> Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Email:</strong><span className="ml-2 text-muted-foreground">{user.email}</span></div>
          <div className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Phone:</strong><span className="ml-2 text-muted-foreground">{mockProfileData.primaryData.phone}</span></div>
          <div className="flex items-start col-span-1 md:col-span-2"><MapPin className="mr-2 mt-1 h-4 w-4 text-muted-foreground shrink-0" /><strong>Address:</strong><span className="ml-2 text-muted-foreground">{mockProfileData.primaryData.address}</span></div>
          <div className="flex items-center"><Paperclip className="mr-2 h-4 w-4 text-muted-foreground" /><strong>ID Proof:</strong><Button variant="link" size="sm" className="p-0 h-auto ml-2 text-primary">{mockProfileData.primaryData.idProof}</Button></div>
          <div className="flex items-center"><Paperclip className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Address Proof:</strong><Button variant="link" size="sm" className="p-0 h-auto ml-2 text-primary">{mockProfileData.primaryData.addressProof}</Button></div>
        </CardContent>
      </Card>

      {/* Secondary Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Briefcase /> Work Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Joining Date:</strong><span className="ml-2 text-muted-foreground">{new Date(mockProfileData.primaryData.joiningDate).toLocaleDateString()}</span></div>
          <div className="flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Department:</strong><span className="ml-2 text-muted-foreground">{mockProfileData.primaryData.department}</span></div>
          <div className="flex items-center"><strong>Current Position:</strong><span className="ml-2 text-muted-foreground">{mockProfileData.secondaryData.currentPosition}</span></div>
          <div className="flex items-center"><strong>Reporting Manager:</strong><span className="ml-2 text-muted-foreground">{mockProfileData.secondaryData.managerName} ({mockProfileData.secondaryData.managerDepartment})</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
