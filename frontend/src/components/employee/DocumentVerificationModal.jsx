import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Loader2, FileText, Image } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import useDocumentStore from '@/store/documentStore';

const documentVerificationSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED', 'PENDING'], {
    required_error: "Please select a status",
  }),
  remarks: z.string().optional(),
}).refine((data) => {
  if (data.status === 'REJECTED') {
    return data.remarks && data.remarks.trim().length > 0;
  }
  return true;
}, {
  message: "Remarks are required when rejecting a document",
  path: ["remarks"]
});

const DocumentVerificationModal = ({ isOpen, onClose, document, onVerify }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const { fetchDocuments } = useDocumentStore();

  const form = useForm({
    resolver: zodResolver(documentVerificationSchema),
    defaultValues: {
      status: document?.status || 'PENDING',
      remarks: '',
    },
  });

  const status = form.watch('status');

  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED':
        return 'success';
      case 'REJECTED':
        return 'destructive';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const isImageFile = (url) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const handleSubmit = async (data) => {
    if (!document) {
      toast({
        title: "Error",
        description: "No document selected for verification",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Ensure we have all required data
      const verificationData = {
        documentId: document._id || document.id, // Handle both MongoDB and other ID formats
        status: data.status,
        remarks: data.remarks || (data.status === 'REJECTED' ? 'Document rejected' : 'Document verified')
      };

      // Debug log to check document structure
      console.log('Document data:', document);
      console.log('Verification data:', verificationData);

      // Validate required fields
      if (!verificationData.documentId) {
        throw new Error('Document ID is missing. Please try refreshing the page.');
      }

      if (!verificationData.status) {
        throw new Error('Status is required');
      }

      // Call the verification function
      await onVerify(document.employeeId, verificationData);
      
      // Refresh documents after successful verification
      if (document.employeeId) {
        await fetchDocuments(document.employeeId);
      }
      
      toast({
        title: "Success",
        description: `Document ${data.status.toLowerCase()} successfully`,
      });
      onClose();
    } catch (error) {
      console.error('Error verifying document:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to verify document";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add debug logging when component mounts
  React.useEffect(() => {
    if (document) {
      console.log('Document data in modal:', document);
    }
  }, [document]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Verify Document</DialogTitle>
          <DialogDescription>
            Review and verify the uploaded document
          </DialogDescription>
        </DialogHeader>

        {document && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {isImageFile(document.url) ? (
                  <img 
                    src={document.url} 
                    alt={document.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-md">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{document.name}</h3>
                {document.number && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Number: {document.number}
                  </p>
                )}
                <div className="mt-2">
                  <Badge variant={getStatusColor(document.status)}>
                    {document.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="VERIFIED">Verified</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Remarks {status === 'REJECTED' && <span className="text-red-500">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder={status === 'REJECTED' ? "Please provide rejection reason" : "Add remarks (optional)"}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verify
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {document?.history && document.history.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Document History</h3>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-4">
                {document.history.map((entry, index) => (
                  <div key={index} className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(entry.status)}>
                          {entry.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(entry.timestamp), 'PPp')}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        by {entry.user?.name || 'System'}
                      </span>
                    </div>
                    {entry.remarks && (
                      <p className="text-sm text-muted-foreground">
                        {entry.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentVerificationModal; 