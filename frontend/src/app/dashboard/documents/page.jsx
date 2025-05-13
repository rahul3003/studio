
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OfferLetterForm } from "@/components/document/offer-letter-form";
import { EmployeeContractForm } from "@/components/document/employee-contract-form";
import { ExperienceLetterForm } from "@/components/document/experience-letter-form";
import { PaySlipForm } from "@/components/document/pay-slip-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendEmail } from '@/services/emailService'; 
import { Loader2, FileText, Copy, Download, Mail } from "lucide-react";
import html2pdf from 'html2pdf.js';
import { format } from "date-fns";

// Import HTML generation functions
import { generatePlaceholderOfferLetterHtml } from '@/lib/document-templates/offer-letter';
import { generatePlaceholderEmployeeContractHtml } from '@/lib/document-templates/employee-contract';
import { generatePlaceholderExperienceLetterHtml } from '@/lib/document-templates/experience-letter';
import { generatePlaceholderPaySlipHtml } from '@/lib/document-templates/pay-slip';


const DOCUMENT_TYPES = {
  OFFER_LETTER: 'offer-letter',
  EMPLOYEE_CONTRACT: 'employee-contract',
  EXPERIENCE_LETTER: 'experience-letter',
  PAY_SLIP: 'pay-slip',
};

export default function DocumentsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState(DOCUMENT_TYPES.OFFER_LETTER);
  
  const [generatedDocumentHtml, setGeneratedDocumentHtml] = React.useState("");
  const [currentDocumentData, setCurrentDocumentData] = React.useState(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isEmailing, setIsEmailing] = React.useState(false);

  const resetPreview = () => {
    setGeneratedDocumentHtml("");
    setCurrentDocumentData(null);
  };

  React.useEffect(() => {
    resetPreview();
  }, [activeTab]);

  const handleSubmit = async (docType, data) => {
    setIsLoading(true);
    resetPreview();
    setCurrentDocumentData(data);

    let htmlContent;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      switch (docType) {
        case DOCUMENT_TYPES.OFFER_LETTER:
          htmlContent = generatePlaceholderOfferLetterHtml(data);
          break;
        case DOCUMENT_TYPES.EMPLOYEE_CONTRACT:
          htmlContent = generatePlaceholderEmployeeContractHtml(data);
          break;
        case DOCUMENT_TYPES.EXPERIENCE_LETTER:
          htmlContent = generatePlaceholderExperienceLetterHtml(data);
          break;
        case DOCUMENT_TYPES.PAY_SLIP:
          htmlContent = generatePlaceholderPaySlipHtml(data);
          break;
        default:
          throw new Error("Invalid document type for generation.");
      }

      if (htmlContent) {
        setGeneratedDocumentHtml(htmlContent);
        toast({
          title: `${getTabTitle(docType)} Generated`,
          description: `The ${getTabTitle(docType).toLowerCase()} has been successfully generated.`,
        });
      } else {
        throw new Error("Failed to generate HTML content.");
      }

    } catch (error) {
      console.error(`Error generating ${docType}:`, error);
      toast({
        title: "Generation Failed",
        description: error.message || `Could not generate the ${getTabTitle(docType).toLowerCase()}. Please try again.`,
        variant: "destructive",
      });
      setGeneratedDocumentHtml(`<p class="p-4 text-destructive-foreground bg-destructive rounded-md">Error: Could not generate document. ${error.message || 'Please check console for details.'}</p>`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedDocumentHtml) return;
    navigator.clipboard.writeText(generatedDocumentHtml)
      .then(() => {
        toast({ title: "Copied to Clipboard", description: `${getTabTitle(activeTab)} HTML copied.` });
      })
      .catch(err => {
        toast({ title: "Copy Failed", description: "Could not copy HTML.", variant: "destructive" });
      });
  };

  const handleDownloadPdf = () => {
    if (!generatedDocumentHtml || !currentDocumentData) {
      toast({ title: "No Document", description: `Please generate the ${getTabTitle(activeTab).toLowerCase()} first.`, variant: "destructive" });
      return;
    }

    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    tempElement.style.top = '0px';
    tempElement.style.width = '1000px'; 
    tempElement.innerHTML = generatedDocumentHtml;
    document.body.appendChild(tempElement);

    const containerSelector = '.offer-letter-container, .contract-container, .experience-letter-container, .payslip-container';
    const documentToCapture = tempElement.querySelector(containerSelector);
    
    if (!documentToCapture) {
        document.body.removeChild(tempElement);
        toast({ title: "PDF Generation Error", description: "Could not find the main document container for PDF conversion.", variant: "destructive" });
        return;
    }
    
    const _ = documentToCapture.offsetHeight; 

    const personNameForFilename = currentDocumentData.candidateName || currentDocumentData.employeeName || "Document";
    const filename = `${personNameForFilename.replace(/ /g, '_')}_${getTabTitle(activeTab).replace(/ /g, '_')}.pdf`;

    const opt = {
      margin:       [10, 10, 10, 10], 
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false, allowTaint: true, width: documentToCapture.scrollWidth, windowWidth: documentToCapture.scrollWidth },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' } 
    };

    toast({ title: "Generating PDF", description: "Your PDF is being prepared for download..." });

    html2pdf().from(documentToCapture).set(opt).save()
      .then(() => {
        toast({ title: "PDF Downloaded", description: `The ${getTabTitle(activeTab).toLowerCase()} PDF has been saved.` });
      })
      .catch(err => {
        console.error("Error generating PDF:", err);
        toast({ title: "PDF Generation Failed", description: "An error occurred while generating the PDF. Check console for details.", variant: "destructive" });
      })
      .finally(() => {
         document.body.removeChild(tempElement);
      });
  };

  const handleEmailDocument = async () => {
    const recipientEmail = currentDocumentData?.candidateEmail || currentDocumentData?.employeeEmail;
    if (!generatedDocumentHtml || !currentDocumentData || !recipientEmail) {
      toast({ title: "Cannot Send Email", description: `Please generate the ${getTabTitle(activeTab).toLowerCase()} and ensure recipient email is provided.`, variant: "destructive" });
      return;
    }

    setIsEmailing(true);
    try {
      const subjectTitle = getTabTitle(activeTab); 
      const emailBody = `<p>Dear ${currentDocumentData.candidateName || currentDocumentData.employeeName},</p><p>Please find your ${subjectTitle.toLowerCase()} attached to this email.</p><p>Sincerely,<br/>The ${currentDocumentData.companyName} Team</p>`;
      
      const result = await sendEmail({
        to: recipientEmail,
        subject: `Your ${subjectTitle} from ${currentDocumentData.companyName}`,
        htmlBody: emailBody,
        attachments: [
          {
            filename: `${subjectTitle.replace(/ /g, '_')}.html`,
            content: generatedDocumentHtml,
            contentType: 'text/html',
          },
        ],
      });

      if (result.success) {
        toast({ title: `${subjectTitle} Emailed`, description: result.message });
      } else {
        throw new Error(result.message || `Failed to email ${subjectTitle.toLowerCase()}.`);
      }
    } catch (error) {
      console.error(`Error emailing ${activeTab}:`, error);
      toast({ title: "Email Sending Failed", description: error.message || `Could not send the ${getTabTitle(activeTab).toLowerCase()}. Please try again.`, variant: "destructive" });
    } finally {
      setIsEmailing(false);
    }
  };

  const getTabTitle = (tabValue) => {
    switch(tabValue) {
      case DOCUMENT_TYPES.OFFER_LETTER: return "Offer Letter";
      case DOCUMENT_TYPES.EMPLOYEE_CONTRACT: return "Employee Contract";
      case DOCUMENT_TYPES.EXPERIENCE_LETTER: return "Experience Letter";
      case DOCUMENT_TYPES.PAY_SLIP: return "Pay Slip";
      default: return "Document";
    }
  };
  
  const recipientEmailAvailable = currentDocumentData?.candidateEmail || currentDocumentData?.employeeEmail;


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Document Generation</CardTitle>
          </div>
          <CardDescription>
            Generate various HR and office-related documents. Select a document type below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value={DOCUMENT_TYPES.OFFER_LETTER}>Offer Letter</TabsTrigger>
              <TabsTrigger value={DOCUMENT_TYPES.EMPLOYEE_CONTRACT}>Contract</TabsTrigger>
              <TabsTrigger value={DOCUMENT_TYPES.EXPERIENCE_LETTER}>Experience Letter</TabsTrigger>
              <TabsTrigger value={DOCUMENT_TYPES.PAY_SLIP}>Pay Slip</TabsTrigger>
            </TabsList>
            
            {[DOCUMENT_TYPES.OFFER_LETTER, DOCUMENT_TYPES.EMPLOYEE_CONTRACT, DOCUMENT_TYPES.EXPERIENCE_LETTER, DOCUMENT_TYPES.PAY_SLIP].map(docType => (
              <TabsContent key={docType} value={docType} className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <h3 className="text-xl font-semibold mb-4">Generate {getTabTitle(docType)}</h3>
                    {docType === DOCUMENT_TYPES.OFFER_LETTER && <OfferLetterForm onSubmit={(data) => handleSubmit(docType, data)} isLoading={isLoading && activeTab === docType} />}
                    {docType === DOCUMENT_TYPES.EMPLOYEE_CONTRACT && <EmployeeContractForm onSubmit={(data) => handleSubmit(docType, data)} isLoading={isLoading && activeTab === docType} />}
                    {docType === DOCUMENT_TYPES.EXPERIENCE_LETTER && <ExperienceLetterForm onSubmit={(data) => handleSubmit(docType, data)} isLoading={isLoading && activeTab === docType} />}
                    {docType === DOCUMENT_TYPES.PAY_SLIP && <PaySlipForm onSubmit={(data) => handleSubmit(docType, data)} isLoading={isLoading && activeTab === docType} />}
                  </div>
                  <div className="lg:col-span-2">
                    <h3 className="text-xl font-semibold mb-4">Generated Document Preview</h3>
                    {(isLoading && activeTab === docType) && (
                      <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] min-h-[400px] border rounded-md bg-muted/30">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="ml-2 mt-4 text-lg text-muted-foreground">Generating your {getTabTitle(docType).toLowerCase()}...</p>
                        <p className="text-sm text-muted-foreground">This may take a few moments.</p>
                      </div>
                    )}
                    {!(isLoading && activeTab === docType) && generatedDocumentHtml && activeTab === docType && (
                      <div className="space-y-3">
                        <div 
                          className="p-6 border rounded-md bg-white shadow-sm overflow-auto max-h-[70vh] min-h-[400px] prose prose-sm max-w-none dark:bg-slate-900 dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: generatedDocumentHtml }}
                        />
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button onClick={handleCopyToClipboard} variant="outline" size="sm" disabled={!generatedDocumentHtml || isLoading || isEmailing}>
                            <Copy className="mr-2 h-4 w-4" /> Copy HTML
                          </Button>
                          <Button onClick={handleDownloadPdf} variant="outline" size="sm" disabled={!generatedDocumentHtml || isLoading || isEmailing}>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                          </Button>
                          <Button onClick={handleEmailDocument} variant="outline" size="sm" disabled={!generatedDocumentHtml || isLoading || isEmailing || !recipientEmailAvailable}>
                            {isEmailing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                            {isEmailing ? "Sending..." : `Email ${getTabTitle(activeTab)}`}
                          </Button>
                        </div>
                      </div>
                    )}
                    {!(isLoading && activeTab === docType) && !generatedDocumentHtml && activeTab === docType && (
                      <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] min-h-[400px] border-2 border-dashed rounded-md bg-muted/20">
                        <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <p className="text-lg text-muted-foreground">Your generated {getTabTitle(docType).toLowerCase()} will appear here.</p>
                        <p className="text-sm text-muted-foreground">Fill out the form on the left to begin.</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
