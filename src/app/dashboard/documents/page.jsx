
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
import { generateOfferLetter } from "@/ai/flows/generate-offer-letter-flow";
import { generateEmployeeContract } from "@/ai/flows/generate-employee-contract-flow";
import { generateExperienceLetter } from "@/ai/flows/generate-experience-letter-flow";
import { generatePaySlip } from "@/ai/flows/generate-pay-slip-flow";
import { sendOfferLetterEmail } from "@/ai/flows/send-offer-letter-email-flow"; 
import { Loader2, FileText, Copy, Download, Mail } from "lucide-react";
import html2pdf from 'html2pdf.js';

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

    let result;
    let htmlContent;
    try {
      switch (docType) {
        case DOCUMENT_TYPES.OFFER_LETTER:
          result = await generateOfferLetter(data);
          htmlContent = result?.offerLetterText;
          if (htmlContent) setGeneratedDocumentHtml(htmlContent);
          break;
        case DOCUMENT_TYPES.EMPLOYEE_CONTRACT:
          result = await generateEmployeeContract(data);
          htmlContent = result?.contractHtml;
          if (htmlContent) setGeneratedDocumentHtml(htmlContent);
          break;
        case DOCUMENT_TYPES.EXPERIENCE_LETTER:
          result = await generateExperienceLetter(data);
          htmlContent = result?.experienceLetterHtml;
          if (htmlContent) setGeneratedDocumentHtml(htmlContent);
          break;
        case DOCUMENT_TYPES.PAY_SLIP:
          result = await generatePaySlip(data);
          htmlContent = result?.paySlipHtml;
          if (htmlContent) setGeneratedDocumentHtml(htmlContent);
          break;
        default:
          throw new Error("Invalid document type for generation.");
      }

      if (!htmlContent) {
        throw new Error("No content received from AI or content is empty.");
      }
       toast({
          title: `${getTabTitle(docType)} Generated`,
          description: `The ${getTabTitle(docType).toLowerCase()} has been successfully generated.`,
        });

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

    const element = document.createElement('div');
    // Style to be off-screen for layout calculation, but processable by html2canvas
    element.style.position = 'fixed';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    element.style.width = '210mm'; // A5 width, helps with layouting before PDF conversion.
    element.innerHTML = generatedDocumentHtml;
    document.body.appendChild(element);


    const containerSelector = '.offer-letter-container, .contract-container, .experience-letter-container, .payslip-container';
    const letterContainer = element.querySelector(containerSelector);
    
    if (!letterContainer) {
        document.body.removeChild(element); // Clean up
        toast({ title: "PDF Generation Error", description: "Could not find the main document container for PDF conversion.", variant: "destructive" });
        return;
    }
    
    // Ensure content is actually visible within the letterContainer for html2canvas
    // For example, by ensuring it has dimensions and isn't display:none
    // This is generally handled if the AI provides a container with content.

    const personNameForFilename = currentDocumentData.candidateName || currentDocumentData.employeeName || "Document";
    const filename = `${personNameForFilename.replace(/ /g, '_')}_${getTabTitle(activeTab).replace(/ /g, '_')}.pdf`;

    const opt = {
      margin:       [10, 5, 10, 5], // [top, right, bottom, left] in mm
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        logging: false, 
        allowTaint: true, 
        foreignObjectRendering: true,
        // Ensure html2canvas captures the full content of the letterContainer
        // width: letterContainer.scrollWidth, 
        // height: letterContainer.scrollHeight,
        // Using windowWidth/Height can sometimes be more stable if scrollWidth/Height is problematic
        windowWidth: letterContainer.scrollWidth, 
        windowHeight: letterContainer.scrollHeight
      },
      jsPDF:        { unit: 'mm', format: 'a5', orientation: 'portrait' }
    };

    toast({ title: "Generating PDF", description: "Your PDF is being prepared for download..." });

    html2pdf().from(letterContainer).set(opt).save()
      .then(() => {
        toast({ title: "PDF Downloaded", description: `The ${getTabTitle(activeTab).toLowerCase()} PDF has been saved.` });
      })
      .catch(err => {
        console.error("Error generating PDF:", err);
        toast({ title: "PDF Generation Failed", description: "An error occurred while generating the PDF.", variant: "destructive" });
      })
      .finally(() => {
         document.body.removeChild(element); // Clean up the temporary element
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
      const emailInput = {
        candidateEmail: recipientEmail, 
        candidateName: currentDocumentData.candidateName || currentDocumentData.employeeName, 
        offerLetterHtml: generatedDocumentHtml, 
        companyName: currentDocumentData.companyName,
      };
      const subjectTitle = getTabTitle(activeTab); 
      
      const result = await sendOfferLetterEmail(emailInput); 
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
            Generate various HR and office-related documents using AI. Select a document type below.
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

