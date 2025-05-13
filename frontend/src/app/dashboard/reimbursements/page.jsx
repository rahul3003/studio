"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Receipt, FileText, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReimbursementForm } from "@/components/reimbursement/reimbursement-form";
import { useReimbursementStore } from "@/store/reimbursementStore"; // Import store
import { useEmployeeStore } from "@/store/employeeStore"; // For employee names

const CURRENCY_OPTIONS = ["INR", "USD", "EUR", "GBP", "JPY"];
const REIMBURSEMENT_STATUS_OPTIONS = ["Pending", "Approved", "Rejected", "Paid"];

const statusVariantMap = {
  Pending: "secondary",
  Approved: "default",
  Rejected: "destructive",
  Paid: "outline", 
};

export default function ReimbursementsPage() {
  const { toast } = useToast();
  // Use Zustand stores
  const reimbursements = useReimbursementStore((state) => state.reimbursements);
  const addReimbursement = useReimbursementStore((state) => state.addReimbursement);
  const updateReimbursement = useReimbursementStore((state) => state.updateReimbursement);
  const deleteReimbursement = useReimbursementStore((state) => state.deleteReimbursement);
  const initializeReimbursements = useReimbursementStore((state) => state._initializeReimbursements);

  const employees = useEmployeeStore((state) => state.employees);
  const MOCK_EMPLOYEES_FOR_REIMBURSEMENT = employees.map(emp => emp.name);

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedReimbursement, setSelectedReimbursement] = React.useState(null);

  React.useEffect(() => {
    initializeReimbursements(); // Ensure store is initialized
  }, [initializeReimbursements]);


  const handleAddReimbursementOpen = () => {
    setSelectedReimbursement(null);
    setIsAddDialogOpen(true);
  };

  const handleEditReimbursementOpen = (reimbursement) => {
    setSelectedReimbursement(reimbursement);
    setIsEditDialogOpen(true);
  };

  const handleDeleteReimbursementOpen = (reimbursement) => {
    setSelectedReimbursement(reimbursement);
    setIsDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedReimbursement(null);
  };

  const handleSaveReimbursement = (reimbursementData) => {
    if (selectedReimbursement && selectedReimbursement.id) {
      // Editing existing reimbursement
      updateReimbursement({ ...reimbursementData, id: selectedReimbursement.id });
      toast({ title: "Reimbursement Updated", description: `Details for reimbursement ID ${selectedReimbursement.id} have been updated.` });
    } else {
      // Adding new reimbursement
      const newId = `REIM${String(Date.now()).slice(-4)}${String(reimbursements.length + 1).padStart(3, '0')}`;
      const newReimbursement = {
        ...reimbursementData,
        id: newId,
      };
      addReimbursement(newReimbursement);
      toast({ title: "Reimbursement Added", description: `New reimbursement (ID: ${newId}) has been submitted.` });
    }
    handleDialogClose();
  };

  const handleConfirmDelete = () => {
    if (selectedReimbursement) {
      deleteReimbursement(selectedReimbursement.id);
      toast({ title: "Reimbursement Deleted", description: `Reimbursement ID ${selectedReimbursement.id} has been removed.`, variant: "destructive" });
    }
    handleDialogClose();
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Manage Reimbursements</CardTitle>
            </div>
            <CardDescription>
              View, add, edit, and manage employee expense reimbursements.
            </CardDescription>
          </div>
          <Button onClick={handleAddReimbursementOpen} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Reimbursement
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reimbursements.map((reimbursement) => (
                  <TableRow key={reimbursement.id}>
                    <TableCell className="font-medium">{reimbursement.id}</TableCell>
                    <TableCell>{reimbursement.employeeName}</TableCell>
                    <TableCell>
                      {reimbursement.amount.toLocaleString('en-IN', { style: 'currency', currency: reimbursement.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{reimbursement.description}</TableCell>
                    <TableCell>
                      {new Date(reimbursement.submissionDate).toLocaleDateString("en-IN", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[reimbursement.status] || "outline"}>
                        {reimbursement.status}
                      </Badge>
                      {reimbursement.status === "Rejected" && reimbursement.reasonForRejection && (
                        <p className="text-xs text-muted-foreground mt-1 italic truncate" title={reimbursement.reasonForRejection}>
                          Reason: {reimbursement.reasonForRejection}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {reimbursement.fileName ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span className="truncate" title={reimbursement.fileName}>{reimbursement.fileName}</span>
                        </div>
                      ) : (
                         <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
                           <XCircle className="h-3 w-3" />
                           <span>No file</span>
                         </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-1 hover:bg-accent/20"
                        onClick={() => handleEditReimbursementOpen(reimbursement)}
                      >
                        <Edit className="h-4 w-4 text-primary" />
                        <span className="sr-only">Edit {reimbursement.id}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/20"
                        onClick={() => handleDeleteReimbursementOpen(reimbursement)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete {reimbursement.id}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {reimbursements.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">
              No reimbursements found. Click "Add New Reimbursement" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedReimbursement ? "Edit Reimbursement" : "Add New Reimbursement"}</DialogTitle>
            <DialogDescription>
              {selectedReimbursement ? "Update the details of the reimbursement claim." : "Fill in the details to submit a new reimbursement claim."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
            <ReimbursementForm
              onSubmit={handleSaveReimbursement}
              initialData={selectedReimbursement}
              onCancel={handleDialogClose}
              employeeOptions={MOCK_EMPLOYEES_FOR_REIMBURSEMENT.length > 0 ? MOCK_EMPLOYEES_FOR_REIMBURSEMENT : ["Default Employee"]}
              currencyOptions={CURRENCY_OPTIONS}
              statusOptions={REIMBURSEMENT_STATUS_OPTIONS}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this reimbursement claim?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the claim with ID:{" "}
              <strong>{selectedReimbursement?.id}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDialogClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
