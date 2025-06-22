"use client";
import React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Edit3, CheckCircle2, XCircle, Plus, History } from "lucide-react";
import { useEmployeeStore } from "@/store/employeeStore";
import { useAuthStore } from "@/store/authStore";
import {
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Briefcase,
  Award,
  DollarSign,
  FileText as FileTextIcon,
  CalendarCheck,
  Building,
  ArrowRight,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PersonalInfoEditModal from '@/components/employee/PersonalInfoEditModal';
import SecondaryDataEditModal from '@/components/employee/SecondaryDataEditModal';
import DocumentVerificationModal from '@/components/employee/DocumentVerificationModal';
import BankDetailsEditModal from '@/components/employee/BankDetailsEditModal';
import DocumentUploadModal from '@/components/employee/DocumentUploadModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const employees = useEmployeeStore((state) => state.employees);
  const personalData = useEmployeeStore((state) => state.personalData);
  const secondaryData = useEmployeeStore((state) => state.secondaryData);
  const loading = useEmployeeStore((state) => state.loading);
  const error = useEmployeeStore((state) => state.error);
  const fetchEmployeeById = useEmployeeStore((state) => state.fetchEmployeeById);
  const fetchEmployeePersonal = useEmployeeStore((state) => state.fetchEmployeePersonal);
  const fetchEmployeeSecondary = useEmployeeStore((state) => state.fetchEmployeeSecondary);
  const updateEmployeePersonal = useEmployeeStore((state) => state.updateEmployeePersonal);
  const updateEmployeeSecondary = useEmployeeStore((state) => state.updateEmployeeSecondary);
  const updateDocumentStatus = useEmployeeStore((state) => state.updateDocumentStatus);
  const updateBankDetails = useEmployeeStore((state) => state.updateBankDetails);
  const addDocument = useEmployeeStore((state) => state.addDocument);
  const uploadDocument = useEmployeeStore((state) => state.uploadDocument);
  const uploadProfile = useEmployeeStore((state) => state.uploadProfile);

  const [initialized, setInitialized] = React.useState(false);
  const [fetchError, setFetchError] = React.useState(null);
  const [isPersonalEditOpen, setIsPersonalEditOpen] = React.useState(false);
  const [isSecondaryEditOpen, setIsSecondaryEditOpen] = React.useState(false);
  const [selectedDocument, setSelectedDocument] = React.useState(null);
  const [isBankDetailsEditOpen, setIsBankDetailsEditOpen] = React.useState(false);
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = React.useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = React.useState(null);
  const [isDocumentVerificationOpen, setIsDocumentVerificationOpen] = React.useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const canEdit = ['ADMIN', 'HR'].includes(user?.role);
  const canVerifyDocuments = ['ADMIN', 'HR', 'MANAGER'].includes(user?.role);

  React.useEffect(() => {
    async function fetchAll() {
      if (!id) return;
      try {
        setFetchError(null);
      await fetchEmployeeById(id);
      await fetchEmployeePersonal(id);
        try {
      await fetchEmployeeSecondary(id);
        } catch (secondaryError) {
          console.error('Error fetching secondary data:', secondaryError);
          setFetchError('Failed to fetch secondary data. Some information may be incomplete.');
        }
      setInitialized(true);
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setFetchError('Failed to fetch employee data. Please try again later.');
      }
    }
    fetchAll();
  }, [id, fetchEmployeeById, fetchEmployeePersonal, fetchEmployeeSecondary]);

  const employee = employees.find(e => e.id === id);
  const personal = personalData?.[id];
  const secondary = secondaryData?.[id];

  const handlePersonalUpdate = async (data) => {
    try {
      const result = await updateEmployeePersonal(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update personal information');
      }
      
      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
    } catch (error) {
      console.error('Error updating personal information:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update personal information",
        variant: "destructive",
      });
    }
  };

  const handleSecondaryUpdate = async (data) => {
    try {
      const result = await updateEmployeeSecondary(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update secondary information');
      }
      
      toast({
        title: "Success",
        description: "Secondary information updated successfully",
      });
    } catch (error) {
      console.error('Error updating secondary information:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update secondary information",
        variant: "destructive",
      });
    }
  };

  const handleDocumentVerify = async (document, newStatus, remarks) => {
    try {
      const result = await updateDocumentStatus(id, document.id, newStatus, remarks);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update document status');
      }
      
      toast({
        title: "Success",
        description: `Document ${newStatus.toLowerCase()} successfully`,
      });
    } catch (error) {
      console.error('Error updating document status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update document status",
        variant: "destructive",
      });
    }
  };

  const handleBankDetailsUpdate = async (data) => {
    try {
      const result = await updateBankDetails(id, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update bank details');
      }
      
      toast({
        title: "Success",
        description: "Bank details updated successfully",
      });
    } catch (error) {
      console.error('Error updating bank details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update bank details",
        variant: "destructive",
      });
    }
  };

  const handleDocumentUpload = async (document) => {
    try {
      const result = await uploadDocument(id, document);
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload document');
      }
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    }
  };

  const handleProfileUpload = async (file) => {
    try {
      const result = await uploadProfile(id, file, file.type);
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload profile picture');
      }
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    }
  };

  // Helper function to safely get string value from any property
  const safeGetValue = (value, defaultValue = 'N/A') => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'object') {
      return value.name || defaultValue;
    }
    return String(value);
  };

  if (loading && !initialized) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!employee) return <div className="p-8">Employee not found.</div>;

  return (
    <div className="space-y-8 p-4 md:p-6">
      {fetchError && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
          {fetchError}
        </div>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={employee.avatarUrl} alt={safeGetValue(employee.name)} />
              <AvatarFallback>{safeGetValue(employee.name).split(" ").map(n => n[0]).join("").toUpperCase()}</AvatarFallback>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-0 right-0"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleProfileUpload(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              )}
          </Avatar>
            <div>
              <CardTitle className="text-3xl">{safeGetValue(employee.name)}</CardTitle>
              <CardDescription className="text-md">{safeGetValue(employee.designation)} at {safeGetValue(employee.department)}</CardDescription>
              <Badge variant="default" className="mt-2">{safeGetValue(employee.status)}</Badge>
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
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => setIsPersonalEditOpen(true)}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Company Email:</strong><span className="ml-2 text-muted-foreground">{safeGetValue(employee.email)}</span></div>
              {personal ? (
                <>
                  <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Personal Email:</strong><span className="ml-2 text-muted-foreground">{safeGetValue(personal.personalEmail)}</span></div>
                  <div className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Phone:</strong><span className="ml-2 text-muted-foreground">{safeGetValue(personal.phone)}</span></div>
                  <div className="flex items-start col-span-1 md:col-span-2"><MapPin className="mr-2 mt-1 h-4 w-4 text-muted-foreground shrink-0" /><strong>Address:</strong><span className="ml-2 text-muted-foreground">{safeGetValue(personal.address)}</span></div>
                  <div className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /><strong>City:</strong><span className="ml-2 text-muted-foreground">{safeGetValue(personal.city)}</span></div>
                </>
              ) : (
                <div className="col-span-2">
                  <Button variant="outline" size="sm" onClick={() => setIsPersonalEditOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" /> Upload Personal Information
                  </Button>
                </div>
              )}
              <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Joining Date:</strong><span className="ml-2 text-muted-foreground">{employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-IN') : 'N/A'}</span></div>
              <div className="flex items-center"><Building className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Department:</strong><span className="ml-2 text-muted-foreground">{safeGetValue(employee.department)}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-xl"><Briefcase /> Work Overview</CardTitle>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => setIsSecondaryEditOpen(true)}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div className="flex items-center"><strong>Role:</strong><span className="ml-2 text-muted-foreground">{safeGetValue(employee.role)}</span></div>
              <div className="flex items-center"><strong>Designation:</strong><span className="ml-2 text-muted-foreground">{safeGetValue(employee.designation)}</span></div>
              <div className="flex items-center"><strong>Employee Type:</strong><span className="ml-2 text-muted-foreground">{safeGetValue(employee.employeeType)}</span></div>
              <div className="flex items-center"><strong>Reporting Manager:</strong><span className="ml-2 text-muted-foreground">{safeGetValue(employee.reportingManager)}</span></div>
              {secondary ? (
                <>
                  <div className="flex items-center"><DollarSign className="mr-2 h-4 w-4 text-muted-foreground" /><strong>Remuneration:</strong><span className="ml-2 text-muted-foreground">{safeGetValue(secondary.currentRemuneration)}</span></div>
                  <div className="flex items-center"><strong>Annual Leave Balance:</strong><span className="ml-2 text-muted-foreground">{safeGetValue(secondary.annualLeaveBalance)} / {safeGetValue(secondary.totalAnnualLeave)} days</span></div>
                  <div className="flex items-center"><strong>Sick Leave Balance:</strong><span className="ml-2 text-muted-foreground">{safeGetValue(secondary.sickLeaveBalance)} / {safeGetValue(secondary.totalSickLeave)} days</span></div>
                </>
              ) : (
                <div className="col-span-2">
                  <Button variant="outline" size="sm" onClick={() => setIsSecondaryEditOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" /> Upload Secondary Information
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Quick Links/Summary Cards */}
        <div className="lg:col-span-1 space-y-6">
          {/* Bank Details Card */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="text-green-500" /> Bank Details
              </CardTitle>
              {canEdit && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsBankDetailsEditOpen(true)}
                >
                  <Edit3 className="mr-2 h-4 w-4" /> 
                  {personal?.bankDetails ? 'Edit' : 'Add'} Bank Details
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {personal?.bankDetails ? (
                <>
                  <p><strong>Account Number:</strong> {safeGetValue(personal.bankDetails.accountNumber)}</p>
                  <p><strong>Bank Name:</strong> {safeGetValue(personal.bankDetails.bankName)}</p>
                  <p><strong>IFSC Code:</strong> {safeGetValue(personal.bankDetails.ifsc)}</p>
                  <p><strong>Branch:</strong> {safeGetValue(personal.bankDetails.branch)}</p>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">No bank details available</p>
                  {canEdit && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsBankDetailsEditOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Bank Details
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents Card */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileTextIcon className="text-red-500" /> Documents
              </CardTitle>
              {canEdit && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedDocumentType(null);
                    setIsDocumentUploadOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Document
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {personal?.documents && personal.documents.length > 0 ? (
                <div className="space-y-2">
                  {personal.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="h-4 w-4 text-gray-400" />
                        <Button
                          variant="link"
                          className="p-0 h-auto font-normal"
                          onClick={() => doc.url && window.open(doc.url, '_blank')}
                        >
                          <span className="hover:underline">{safeGetValue(doc.name)}</span>
                        </Button>
                        {doc.number && (
                          <span className="text-muted-foreground text-xs">
                            ({doc.number})
                          </span>
                        )}
              </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.status === 'VERIFIED' ? 'default' : 'secondary'}>
                          {safeGetValue(doc.status)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {doc.url && (
                              <DropdownMenuItem onClick={() => window.open(doc.url, '_blank')}>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                View Document
                              </DropdownMenuItem>
                            )}
                            {canVerifyDocuments && doc.status !== 'VERIFIED' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setIsDocumentVerificationOpen(true);
                                }}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Verify Document
                              </DropdownMenuItem>
                            )}
                            {canEdit && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setSelectedDocumentType(doc.name);
                                  setIsDocumentUploadOpen(true);
                                }}
                              >
                                <Edit3 className="mr-2 h-4 w-4" />
                                Update Document
                              </DropdownMenuItem>
                            )}
                            {doc.history && doc.history.length > 0 && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setIsDocumentVerificationOpen(true);
                                }}
                              >
                                <History className="mr-2 h-4 w-4" />
                                View History
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
              </div>
            </div>
                  ))}
              </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">No documents uploaded</p>
                  {canEdit && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedDocumentType(null);
                        setIsDocumentUploadOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Document
                    </Button>
                  )}
              </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><CalendarCheck className="text-blue-500" /> Leave Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {secondary ? (
                <>
                  <p><strong>Annual Leave:</strong> {safeGetValue(secondary.annualLeaveBalance)} / {safeGetValue(secondary.totalAnnualLeave)} days</p>
                  <p><strong>Sick Leave:</strong> {safeGetValue(secondary.sickLeaveBalance)} / {safeGetValue(secondary.totalSickLeave)} days</p>
                </>
              ) : (
                <p className="text-muted-foreground">Leave information not available</p>
          )}
        </CardContent>
      </Card>
        </div>
      </div>

      {/* Modals */}
      <PersonalInfoEditModal
        isOpen={isPersonalEditOpen}
        onClose={() => setIsPersonalEditOpen(false)}
        initialData={personal}
        onSubmit={handlePersonalUpdate}
      />

      <SecondaryDataEditModal
        isOpen={isSecondaryEditOpen}
        onClose={() => setIsSecondaryEditOpen(false)}
        initialData={secondary}
        onSubmit={handleSecondaryUpdate}
      />

      <DocumentVerificationModal
        isOpen={isDocumentVerificationOpen}
        onClose={() => {
          setIsDocumentVerificationOpen(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
        onVerify={handleDocumentVerify}
      />

      <BankDetailsEditModal
        isOpen={isBankDetailsEditOpen}
        onClose={() => setIsBankDetailsEditOpen(false)}
        initialData={personal?.bankDetails}
        onSubmit={handleBankDetailsUpdate}
      />

      <DocumentUploadModal
        isOpen={isDocumentUploadOpen}
        onClose={() => {
          setIsDocumentUploadOpen(false);
          setSelectedDocumentType(null);
          setSelectedDocument(null);
        }}
        documentType={selectedDocumentType}
        onUploadComplete={handleDocumentUpload}
        existingDocument={selectedDocument}
        uploadedDocuments={personal?.documents || []}
      />
    </div>
  );
} 