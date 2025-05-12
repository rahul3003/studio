
"use client";

import * as React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMockAuth } from "@/hooks/use-mock-auth";
import { PersonalInformationEditDialog } from "@/components/profile/personal-information-edit-dialog"; // New dialog
import { useToast } from "@/hooks/use-toast";

import {
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Briefcase,
  Paperclip,
  Building,
  Edit3,
} from "lucide-react";

// Mock data relevant to this page - Indian context
const initialMockProfileData = {
  personal: {
    name: "Priya Sharma", // This will be overridden by auth user's name
    phone: "+91 98765 43210",
    address: "Apt 101, Silicon Towers, Koramangala, Bengaluru, Karnataka 560034",
    profilePhotoUrl: "https://i.pravatar.cc/150?u=priya.sharma", // Placeholder, auth user's avatar will be used
    idProofFileName: "Aadhaar_PriyaSharma.pdf", // Mock file name
    addressProofFileName: "ElectricityBill_PriyaSharma.pdf", // Mock file name
    companyEmail: "priya.sharma@pesuventurelabs.com" // This will be overridden by auth user's email
  },
  work: {
    joiningDate: "2022-08-15",
    department: "Technology",
    companyName: "PESU Venture Labs",
    currentPosition: "Senior Software Engineer",
    managerName: "Rohan Mehra",
    managerDepartment: "Technology",
  },
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useMockAuth();
  const { toast } = useToast();
  const [isEditPersonalOpen, setIsEditPersonalOpen] = React.useState(false);
  // Use state to manage profile data so it can be updated by the dialog
  const [profileData, setProfileData] = React.useState(initialMockProfileData);

  React.useEffect(() => {
    if (user) {
      // Update profileData with authenticated user's details
      setProfileData(prevData => ({
        ...prevData,
        personal: {
          ...prevData.personal,
          name: user.name,
          companyEmail: user.email,
          profilePhotoUrl: user.avatar || prevData.personal.profilePhotoUrl,
        },
        // Potentially update work info if available from user object, though less likely for this page's edit scope
      }));
    }
  }, [user]);


  if (authLoading || !user) {
    return <div>Loading profile...</div>; // Or a skeleton loader
  }

  const handleSavePersonalInformation = (data) => {
    setProfileData(prevData => ({
        ...prevData,
        personal: {
            ...prevData.personal,
            name: data.name, // Name might be updated from auth, but allow override if form changes it
            phone: data.phone,
            address: data.address,
            profilePhotoUrl: data.profilePhotoUrl || prevData.personal.profilePhotoUrl,
            idProofFileName: data.idProofFileName || prevData.personal.idProofFileName,
            addressProofFileName: data.addressProofFileName || prevData.personal.addressProofFileName,
        }
    }));
    toast({ title: "Personal Information Updated", description: "Your details have been saved." });
    setIsEditPersonalOpen(false);
  };
  
  const profilePhotoUrl = profileData.personal.profilePhotoUrl;

  return (
    <div className="space-y-8 p-4 md:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={profilePhotoUrl} alt={profileData.personal.name} data-ai-hint="person face portrait"/>
              <AvatarFallback>{profileData.personal.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{profileData.personal.name}</CardTitle>
              <CardDescription className="text-md">{profileData.work.currentPosition}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Information Section */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl"><UserCircle2 /> Personal Information</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsEditPersonalOpen(true)}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Company Email:</strong><span className="ml-2 text-muted-foreground">{profileData.personal.companyEmail}</span></div>
          <div className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Phone:</strong><span className="ml-2 text-muted-foreground">{profileData.personal.phone}</span></div>
          <div className="flex items-start col-span-1 md:col-span-2"><MapPin className="mr-2 mt-1 h-4 w-4 text-muted-foreground shrink-0" /><strong>Address:</strong><span className="ml-2 text-muted-foreground">{profileData.personal.address}</span></div>
          <div className="flex items-center"><Paperclip className="mr-2 h-4 w-4 text-muted-foreground" /><strong>ID Proof:</strong><span className="ml-2 text-primary cursor-pointer hover:underline">{profileData.personal.idProofFileName}</span></div>
          <div className="flex items-center"><Paperclip className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Address Proof:</strong><span className="ml-2 text-primary cursor-pointer hover:underline">{profileData.personal.addressProofFileName}</span></div>
        </CardContent>
      </Card>

      {/* Work Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><Briefcase /> Work Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Company:</strong><span className="ml-2 text-muted-foreground">{profileData.work.companyName}</span></div>
          <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Joining Date:</strong><span className="ml-2 text-muted-foreground">{new Date(profileData.work.joiningDate).toLocaleDateString('en-IN')}</span></div>
          <div className="flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Department:</strong><span className="ml-2 text-muted-foreground">{profileData.work.department}</span></div>
          <div className="flex items-center"><strong>Current Position:</strong><span className="ml-2 text-muted-foreground">{profileData.work.currentPosition}</span></div>
          <div className="flex items-center"><strong>Reporting Manager:</strong><span className="ml-2 text-muted-foreground">{profileData.work.managerName} ({profileData.work.managerDepartment})</span></div>
        </CardContent>
      </Card>

      {isEditPersonalOpen && (
        <PersonalInformationEditDialog
          isOpen={isEditPersonalOpen}
          onClose={() => setIsEditPersonalOpen(false)}
          initialData={profileData.personal}
          onSubmit={handleSavePersonalInformation}
        />
      )}
    </div>
  );
}
