"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalInformationEditDialog } from "@/components/profile/personal-information-edit-dialog";
import { useToast } from "@/hooks/use-toast";

import {
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Briefcase,
  Edit3,
  Award,
  DollarSign,
  FileText as FileTextIcon,
  CalendarCheck,
  Building,
  ArrowRight,
} from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuthStore();
  const { toast } = useToast();
  
  const profileData = useProfileStore((state) => state.profileData);
  const updatePersonalInformation = useProfileStore((state) => state.updatePersonalInformation);
  const initializeProfile = useProfileStore(state => state.initializeProfileForUser);

  const [isEditPersonalOpen, setIsEditPersonalOpen] = React.useState(false);

  React.useEffect(() => {
    if (user && (!profileData || profileData.personal.companyEmail !== user.email)) {
      initializeProfile(user);
    }
  }, [user, profileData, initializeProfile]);

  if (authLoading || !user || !profileData || !profileData.personal) { 
    return <div>Loading profile...</div>;
  }

  const handleSavePersonalInformation = (data) => {
    updatePersonalInformation(data);
    toast({ title: "Personal Information Updated", description: "Your details have been saved." });
    setIsEditPersonalOpen(false);
  };
  
  const { personal, secondaryData, rewards, companyName } = profileData;

  return (
    <div className="space-y-8 p-4 md:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={personal.profilePhotoUrl} alt={personal.name} data-ai-hint="person face portrait"/>
              <AvatarFallback>{personal.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{personal.name}</CardTitle>
              <CardDescription className="text-md">{secondaryData.currentPosition} at {companyName}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Personal & Secondary Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-xl"><UserCircle2 /> Personal Information</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsEditPersonalOpen(true)}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Company Email:</strong><span className="ml-2 text-muted-foreground">{personal.companyEmail}</span></div>
              <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Personal Email:</strong><span className="ml-2 text-muted-foreground">{personal.personalEmail || "N/A"}</span></div>
              <div className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Phone:</strong><span className="ml-2 text-muted-foreground">{personal.phone}</span></div>
              <div className="flex items-start col-span-1 md:col-span-2"><MapPin className="mr-2 mt-1 h-4 w-4 text-muted-foreground shrink-0" /><strong>Address:</strong><span className="ml-2 text-muted-foreground">{personal.address}</span></div>
              <div className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /><strong>City:</strong><span className="ml-2 text-muted-foreground">{personal.city || "N/A"}</span></div>
              <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Joining Date:</strong><span className="ml-2 text-muted-foreground">{new Date(secondaryData.joiningDate).toLocaleDateString('en-IN')}</span></div>
              <div className="flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Department:</strong><span className="ml-2 text-muted-foreground">{secondaryData.department}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Briefcase /> Work Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="flex items-center"><strong>Current Position:</strong><span className="ml-2 text-muted-foreground">{secondaryData.currentPosition}</span></div>
              <div className="flex items-center"><DollarSign className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Remuneration:</strong><span className="ml-2 text-muted-foreground">{secondaryData.currentRemuneration}</span></div>
              <div className="flex items-center"><strong>Annual Leave Balance:</strong><span className="ml-2 text-muted-foreground">{secondaryData.leaveBalance.annual} / {secondaryData.leaveBalance.totalAnnual} days</span></div>
              <div className="flex items-center"><strong>Sick Leave Balance:</strong><span className="ml-2 text-muted-foreground">{secondaryData.leaveBalance.sick} / {secondaryData.leaveBalance.totalSick} days</span></div>
              <div className="flex items-center"><strong>Manager:</strong><span className="ml-2 text-muted-foreground">{secondaryData.managerName} ({secondaryData.managerDepartment})</span></div>
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Quick Links/Summary Cards */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Award className="text-yellow-500" /> Rewards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Points Balance:</strong> {rewards.accruedPoints || 0}</p>
              <p><strong>Points to Share:</strong> {(rewards.totalAnnualSharablePoints - rewards.pointsSharedThisYear) || 0} (Yearly)</p>
              <Link href="/dashboard/profile/rewards" passHref>
                <Button variant="outline" size="sm" className="w-full mt-2">Manage Rewards <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><CalendarCheck className="text-blue-500" /> Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p><strong>Annual Leave:</strong> {secondaryData.leaveBalance.annual} / {secondaryData.leaveBalance.totalAnnual} days</p>
                <p><strong>Sick Leave:</strong> {secondaryData.leaveBalance.sick} / {secondaryData.leaveBalance.totalSick} days</p>
              <Link href="/dashboard/profile/my-attendance" passHref>
                <Button variant="outline" size="sm" className="w-full mt-2">View Attendance & Apply Leave <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><DollarSign className="text-green-500" /> Remuneration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Annual CTC:</strong> {profileData.remuneration.breakup.annualSalary}</p>
              <Link href="/dashboard/profile/remuneration" passHref>
                <Button variant="outline" size="sm" className="w-full mt-2">View Details <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><FileTextIcon className="text-red-500" /> Documents & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/profile/my-documents" passHref>
                <Button variant="outline" size="sm" className="w-full">Access Documents <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><CalendarDays className="text-purple-500" /> Holiday List</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/profile/holidays" passHref>
                <Button variant="outline" size="sm" className="w-full">View Company Holidays <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>
      
      {isEditPersonalOpen && <PersonalInformationEditDialog isOpen={isEditPersonalOpen} onClose={() => setIsEditPersonalOpen(false)} initialData={personal} onSubmit={handleSavePersonalInformation} />}
    </div>
  );
}