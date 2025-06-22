"use client";
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
import { FileText, Upload, X, UploadCloud } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { s3Service } from "@/services/s3Service";
import { Textarea } from "@/components/ui/textarea";

const ACCEPTED_FILE_TYPES = {
  'Aadhaar Card': ['application/pdf', 'image/jpeg', 'image/png'],
  'PAN Card': ['application/pdf', 'image/jpeg', 'image/png'],
  'Passport': ['application/pdf', 'image/jpeg', 'image/png'],
  'Driving License': ['application/pdf', 'image/jpeg', 'image/png'],
  'Voter ID': ['application/pdf', 'image/jpeg', 'image/png'],
  'Other': ['application/pdf', 'image/jpeg', 'image/png'],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const documentUploadSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  number: z.string()
    .min(1, "Document number is required")
    .refine((val) => {
      // Aadhaar validation (12 digits)
      if (val && val.length === 12 && /^\d+$/.test(val)) return true;
      // PAN validation (10 characters: 5 letters, 4 digits, 1 letter)
      if (val && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val)) return true;
      // Passport validation (8-12 characters)
      if (val && /^[A-Z0-9]{8,12}$/.test(val)) return true;
      // Driving License validation (16 characters)
      if (val && /^[A-Z0-9]{16}$/.test(val)) return true;
      // Voter ID validation (10 characters)
      if (val && /^[A-Z]{3}[0-9]{7}$/.test(val)) return true;
      return false;
    }, "Invalid document number format"),
  file: z.instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `File size must be less than 5MB`)
    .refine(
      (file) => {
        const fileType = file.type;
        return Object.values(ACCEPTED_FILE_TYPES).flat().includes(fileType);
      },
      "File type not supported"
    ),
  remarks: z.string().optional(),
});

const DocumentUploadModal = ({ isOpen, onClose, documentType, onUploadComplete, existingDocument, uploadedDocuments }) => {
  const [previewUrl, setPreviewUrl] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [currentFileName, setCurrentFileName] = React.useState(existingDocument?.fileName || null);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const fileInputRef = React.useRef(null);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      name: existingDocument?.name || documentType || '',
      number: existingDocument?.number || '',
      file: null,
      remarks: existingDocument?.remarks || '',
    },
  });

  // Update form when existingDocument changes
  React.useEffect(() => {
    if (existingDocument) {
      form.reset({
        name: existingDocument.name,
        number: existingDocument.number || '',
        file: null,
        remarks: existingDocument.remarks || '',
      });
      setCurrentFileName(existingDocument.fileName || null);
    }
  }, [existingDocument, form]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be less than 5MB`);
      return;
    }

    // Check file type
    const fileType = file.type;
    const acceptedTypes = Object.values(ACCEPTED_FILE_TYPES).flat();
    if (!acceptedTypes.includes(fileType)) {
      setError(`File type not supported. Accepted types: ${acceptedTypes.join(', ')}`);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setCurrentFileName(file.name);
    form.setValue("file", file, { shouldValidate: true });

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    form.setValue("file", null, { shouldValidate: true });
    setSelectedFile(null);
    setCurrentFileName(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({ title: "File Removed", description: "Attachment has been cleared." });
  };

  const handleSubmit = async (data) => {
    if (!selectedFile && !existingDocument) {
      setError('Please select a file to upload');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let fileUrl = existingDocument?.url;
      let fileType = existingDocument?.fileType;
      let fileName = existingDocument?.fileName;

      // Only upload new file if one is selected
      if (selectedFile) {
        // Get presigned URL for upload
        const result = await s3Service.getPresignedUrl(
          selectedFile.name,
          selectedFile.type,
          'documents'
        );

        const presignedUrl = result?.data?.presignedUrl;
        fileUrl = result?.data?.url;
        fileType = selectedFile.type;
        fileName = selectedFile.name;

        if (!presignedUrl) {
          toast({ 
            title: "Upload Failed", 
            description: "No presigned URL returned from server.", 
            variant: "destructive" 
          });
          return;
        }

        // Upload file to S3
        await s3Service.uploadFileDirectly(selectedFile, presignedUrl);
      }

      // Prepare document data for submission
      const document = {
        name: data.name,
        number: data.number,
        url: fileUrl,
        fileType: fileType,
        fileName: fileName,
        status: existingDocument?.status || 'PENDING',
        remarks: data.remarks || 'Document uploaded',
        uploadedBy: {
          id: localStorage.getItem('userId'),
          name: localStorage.getItem('userName')
        }
      };

      await onUploadComplete(document, existingDocument);
      toast({ 
        title: "Success", 
        description: existingDocument ? "Document updated successfully" : "Document uploaded successfully" 
      });
      onClose();
    } catch (error) {
      console.error("File upload error:", error);
      // Extract the actual error message from the response
      const errorMessage = error.response?.data?.message || error.message || 'Error uploading file';
      
      // Show user-friendly error message
      if (errorMessage.includes('already exists')) {
        setError(`A ${data.name} document has already been uploaded. Please update the existing document instead.`);
        toast({ 
          title: "Document Already Exists", 
          description: `A ${data.name} document has already been uploaded. Please update the existing document instead.`,
          variant: "destructive"
        });
      } else {
        setError(errorMessage);
        toast({ 
          title: "Upload Failed", 
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!isOpen) {
      form.reset();
      setPreviewUrl(null);
      setError(null);
      setCurrentFileName(null);
      setSelectedFile(null);
    }
  }, [isOpen, form]);

  // Get list of already uploaded document types
  const uploadedDocTypes = uploadedDocuments?.map(doc => doc.name) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {existingDocument ? 'Update Document' : 'Upload Document'}
          </DialogTitle>
          <DialogDescription>
            {existingDocument
              ? 'Update or delete the existing document'
              : 'Upload a new document for verification'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!documentType || !!existingDocument}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(ACCEPTED_FILE_TYPES).map((type) => (
                        <SelectItem 
                          key={type} 
                          value={type}
                          disabled={!existingDocument && uploadedDocTypes.includes(type)}
                        >
                          {type}
                          {!existingDocument && uploadedDocTypes.includes(type) && ' (Already Uploaded)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Number (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter document number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Document File</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full sm:w-auto"
                  >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    {currentFileName ? "Change File" : "Upload File"}
                  </Button>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept={Object.values(ACCEPTED_FILE_TYPES).flat().join(',')}
                  />
                </div>
              </FormControl>
              {currentFileName && (
                <div className="mt-2 flex items-center justify-between rounded-md border border-input p-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="truncate" title={currentFileName}>{currentFileName}</span>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleRemoveFile} 
                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              )}
              {previewUrl && (
                <div className="mt-2 relative w-20 h-20">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter remarks for document"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex justify-end gap-2">
              {existingDocument && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onUploadComplete(null, existingDocument)}
                  disabled={isSubmitting}
                >
                  Delete Document
                </Button>
              )}
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
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    {existingDocument ? 'Updating...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {existingDocument ? 'Update' : 'Upload'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadModal; 