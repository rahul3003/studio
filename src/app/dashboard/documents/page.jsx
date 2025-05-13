
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
import { sendEmail } from '@/services/emailService'; // Import direct email service
import { Loader2, FileText, Copy, Download, Mail } from "lucide-react";
import html2pdf from 'html2pdf.js';
import { format } from "date-fns";


const DOCUMENT_TYPES = {
  OFFER_LETTER: 'offer-letter',
  EMPLOYEE_CONTRACT: 'employee-contract',
  EXPERIENCE_LETTER: 'experience-letter',
  PAY_SLIP: 'pay-slip',
};

// Placeholder HTML generation functions
const generatePlaceholderOfferLetterHtml = (data) => {
  const currentDate = format(new Date(), "MMMM d, yyyy");
  return `
<div class="offer-letter-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 30px auto; padding: 30px; border: 1px solid #cccccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); line-height: 1.6; font-size: 12px;">
  <img src="https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png" alt="${data.companyName} Logo" style="display: block; margin-bottom: 20px; max-height: 50px;" data-ai-hint="company logo PESU Venture Labs" />
  <h1 style="font-size: 1.5em; color: #333; margin-bottom: 5px;">${data.companyName}</h1>
  <p style="margin-bottom: 15px; font-size: 0.9em; color: #555;">PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085</p>
  <p style="text-align: right; margin-bottom: 20px;"><strong>Date:</strong> ${currentDate}</p>
  <p style="margin-top: 20px; margin-bottom: 15px;">Dear ${data.candidateName},</p>
  <p>Following our recent discussions, we are delighted to extend an offer of employment to you for the position of <strong>${data.positionTitle}</strong> at <strong>${data.companyName}</strong>.</p>
  <h3 style="font-size: 14px; color: #444; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Offer Details</h3>
  <p><strong>Position Title:</strong> ${data.positionTitle}</p>
  <p><strong>Department:</strong> ${data.department}</p>
  <p><strong>Reporting Manager:</strong> ${data.reportingManager}</p>
  <p><strong>Proposed Start Date:</strong> ${data.startDate}</p>
  <h3 style="font-size: 14px; color: #444; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Compensation & Benefits</h3>
  <p><strong>Salary:</strong> ${data.salary}</p>
  <p>Further details on benefits will be shared upon joining.</p>
  <p>To accept this offer, please sign and return this letter by <strong>${data.offerExpiryDate}</strong>. You can reply to this email with your signed acceptance.</p>
  <p style="margin-top: 25px;">We are very excited about the possibility of you joining our team and look forward to welcoming you to <strong>${data.companyName}</strong>.</p>
  <p style="margin-top: 30px;">Sincerely,</p>
  <p style="margin-top: 20px; font-weight: bold;">The Hiring Team</p>
  <p style="font-size: 0.95em;">${data.companyName}</p>
</div>
  `;
};

const generatePlaceholderEmployeeContractHtml = (data) => {
  const contractDate = format(new Date(), "MMMM d, yyyy");
  return `
<div class="contract-container" style="font-family: 'Times New Roman', Times, serif; max-width: 850px; margin: 30px auto; padding: 40px; border: 1px solid #888888; box-shadow: 0 2px 10px rgba(0,0,0,0.1); line-height: 1.6; font-size: 12px;">
  <h1 style="font-size: 1.7em; text-align: center; color: #222; margin-bottom: 30px; text-transform: uppercase; border-bottom: 2px solid #555; padding-bottom: 10px;">Employment Contract</h1>
  <p style="text-align: right; margin-bottom: 20px;"><strong>Date:</strong> ${contractDate}</p>
  <p>This Employment Contract ("Contract") is entered into as of ${contractDate}, by and between:</p>
  <p><strong>${data.companyName}</strong>, a company registered at ${data.companyAddress} (hereinafter referred to as the "Employer"),</p>
  <p>AND</p>
  <p><strong>${data.employeeName}</strong>, residing at ${data.employeeAddress} (hereinafter referred to as the "Employee").</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">1. Position and Duties</h3>
  <p>The Employee is appointed to the position of <strong>${data.positionTitle}</strong> in the <strong>${data.department}</strong> department. The Employee's duties will include tasks typically associated with this role.</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">2. Commencement and Duration</h3>
  <p>This contract shall commence on <strong>${data.startDate}</strong> and shall continue indefinitely, subject to termination as per clause 8.</p>
  ${data.probationPeriod ? `<h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">3. Probation Period</h3><p>The Employee's employment is subject to a probation period of ${data.probationPeriod}.</p>` : ''}
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">4. Remuneration</h3>
  <p>The Employer shall pay the Employee a salary of ${data.salary}.</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">5. Working Hours</h3>
  <p>The Employee's standard working hours will be ${data.workingHours}.</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">6. Leave Entitlement</h3>
  <p>The Employee is entitled to ${data.leaveEntitlement}.</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">7. Confidentiality</h3>
  <p>${data.confidentialityClause || "The Employee agrees to maintain the confidentiality of the Employer's proprietary information."}</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">8. Termination</h3>
  <p>This Contract may be terminated by either party by giving ${data.terminationNotice} written notice.</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">9. Governing Law</h3>
  <p>This Contract shall be governed by and construed in accordance with the laws of ${data.governingLaw}.</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">10. Entire Agreement</h3>
  <p>This Contract constitutes the entire agreement between the Employer and the Employee.</p>
  <div style="margin-top: 50px; display: flex; justify-content: space-between;">
    <div style="width: 45%;"><p><strong>For and on behalf of ${data.companyName} (Employer):</strong></p><div style="height: 50px; border-bottom: 1px solid #000; margin-top: 30px;"></div><p style="font-size: 0.9em;">Authorised Signatory</p></div>
    <div style="width: 45%;"><p><strong>Accepted and Agreed by ${data.employeeName} (Employee):</strong></p><div style="height: 50px; border-bottom: 1px solid #000; margin-top: 30px;"></div><p style="font-size: 0.9em;">Signature</p></div>
  </div>
</div>
  `;
};

const generatePlaceholderExperienceLetterHtml = (data) => {
  const issueDate = format(new Date(), "MMMM d, yyyy");
  let responsibilitiesHtml = '';
  if (data.keyResponsibilities) {
    const lines = data.keyResponsibilities.split('\n').map(s => s.trim()).filter(s => s);
    if (lines.some(line => line.startsWith("- "))) {
      responsibilitiesHtml = '<ul style="margin-top: 5px; margin-bottom: 15px; padding-left: 20px; font-size: 12px;">';
      lines.forEach(line => {
        if (line.startsWith("- ")) {
          responsibilitiesHtml += `<li style="margin-bottom: 5px;">${line.substring(2)}</li>`;
        }
      });
      responsibilitiesHtml += '</ul>';
    } else {
      responsibilitiesHtml = `<p style="margin-top: 5px; margin-bottom: 15px; font-size: 12px;">${lines.join('<br />')}</p>`;
    }
  } else {
    responsibilitiesHtml = '<p style="margin-top: 5px; margin-bottom: 15px;">The employee fulfilled their duties as per the job description.</p>';
  }

  return `
<div class="experience-letter-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 30px auto; padding: 30px; border: 1px solid #cccccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); line-height: 1.6; font-size: 12px;">
  <img src="https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png" alt="${data.companyName} Logo" style="display: block; margin-bottom: 20px; max-height: 60px;" data-ai-hint="company logo PESU Venture Labs" />
  <h1 style="font-size: 1.6em; color: #333; margin-bottom: 5px;">${data.companyName}</h1>
  <p style="margin-bottom: 5px; font-size: 0.9em; color: #555;">${data.companyAddress || 'PESU Venture Labs, PES University, Bengaluru'}</p>
  <p style="margin-bottom: 20px; font-size: 0.9em; color: #555;">${data.companyContact || 'hr@pesuventurelabs.com'}</p>
  <p style="text-align: right; margin-bottom: 30px;"><strong>Date:</strong> ${issueDate}</p>
  <h2 style="font-size: 1.4em; text-align: center; color: #444; margin-bottom: 25px; text-decoration: underline;">EXPERIENCE LETTER</h2>
  <p style="margin-bottom: 20px;"><strong>TO WHOM IT MAY CONCERN,</strong></p>
  <p>This is to certify that <strong>${data.employeeName}</strong> ${data.employeeId ? `(Employee ID: ${data.employeeId})` : ''} was employed with <strong>${data.companyName}</strong>.</p>
  <p>They joined our organization on <strong>${data.joiningDate}</strong> and their last working day was <strong>${data.lastWorkingDate}</strong>.</p>
  <p>During their tenure, ${data.employeeName} held the position of <strong>${data.positionTitle}</strong> in the <strong>${data.department}</strong> department.</p>
  <p>Their key responsibilities and contributions included:</p>
  ${responsibilitiesHtml}
  <p>During their employment, ${data.employeeName} was found to be diligent and responsible. We wish them all the best in their future endeavors.</p>
  <p style="margin-top: 30px;">Sincerely,</p>
  <div style="margin-top: 20px;">
    <div style="height: 60px; width: 200px; border-bottom: 1px solid #000; margin-bottom:5px;"></div>
    <p style="font-weight: bold;">${data.issuingAuthorityName}</p>
    <p style="font-size: 0.95em;">${data.issuingAuthorityTitle}</p>
    <p style="font-size: 0.95em;">${data.companyName}</p>
  </div>
</div>
  `;
};

const generatePlaceholderPaySlipHtml = (data) => {
  const currentDate = format(new Date(), "MMMM d, yyyy");
  const formatCurrency = (num) => typeof num === 'number' ? num.toFixed(2) : '0.00';
  
  let allowancesHtml = '';
  let totalAllowances = 0;
  if (data.allowancesStr) {
    data.allowancesStr.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length === 2) {
        const name = parts[0].trim();
        const amount = parseFloat(parts[1].trim());
        if (name && !isNaN(amount)) {
          allowancesHtml += `<tr><td style="padding: 8px; border: 1px solid #dee2e6;">${name}</td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">${formatCurrency(amount)}</td><td></td><td></td></tr>`;
          totalAllowances += amount;
        }
      }
    });
  }

  let deductionsHtml = '';
  let totalDeductions = 0;
  if (data.deductionsStr) {
    data.deductionsStr.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length === 2) {
        const name = parts[0].trim();
        const amount = parseFloat(parts[1].trim());
        if (name && !isNaN(amount)) {
          deductionsHtml += `<tr><td></td><td></td><td style="padding: 8px; border: 1px solid #dee2e6;">${name}</td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">${formatCurrency(amount)}</td></tr>`;
          totalDeductions += amount;
        }
      }
    });
  }

  const grossSalary = (data.basicSalary || 0) + totalAllowances;
  const netSalary = grossSalary - totalDeductions;
  const companyLogo = data.companyLogoUrl || 'https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png';


  return `
<div class="payslip-container" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 700px; margin: 20px auto; padding: 25px; border: 1px solid #dee2e6; border-radius: 6px; box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075); background-color: #fff; font-size: 12px;">
  <img src="${companyLogo}" alt="${data.companyName} Logo" style="max-height: 60px; margin-bottom: 15px; display: block;" data-ai-hint="company logo PESU Venture Labs"/>
  <h1 style="font-size: 1.5em; color: #343a40; margin-bottom: 3px;">${data.companyName}</h1>
  <p style="font-size: 0.85em; color: #6c757d; margin-bottom: 15px;">${data.companyAddress || 'PESU Venture Labs, PES University, Bengaluru'}</p>
  <h2 style="font-size: 1.3em; text-align: center; color: #495057; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ced4da;">Pay Slip</h2>
  <p style="font-size: 0.9em; text-align: center; color: #6c757d; margin-bottom: 20px;">For the period: <strong>${data.payPeriodStartDate} to ${data.payPeriodEndDate}</strong> | Payment Date: <strong>${data.paymentDate}</strong></p>
  
  <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 4px;">
    <div style="width: 48%;">
      <p style="font-size: 0.9em; margin: 3px 0;"><span style="color: #6c757d;">Employee Name:</span> <strong style="color: #343a40;">${data.employeeName}</strong></p>
      <p style="font-size: 0.9em; margin: 3px 0;"><span style="color: #6c757d;">Employee ID:</span> <strong style="color: #343a40;">${data.employeeId}</strong></p>
    </div>
    <div style="width: 48%;">
      <p style="font-size: 0.9em; margin: 3px 0;"><span style="color: #6c757d;">Department:</span> <strong style="color: #343a40;">${data.department}</strong></p>
      <p style="font-size: 0.9em; margin: 3px 0;"><span style="color: #6c757d;">Position:</span> <strong style="color: #343a40;">${data.positionTitle}</strong></p>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9em;">
    <thead style="background-color: #e9ecef;">
      <tr>
        <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; color: #495057;">Earnings</th>
        <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; color: #495057;">Amount (INR)</th>
        <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; color: #495057;">Deductions</th>
        <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; color: #495057;">Amount (INR)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding: 8px; border: 1px solid #dee2e6;">Basic Salary</td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">${formatCurrency(data.basicSalary)}</td><td></td><td></td></tr>
      ${allowancesHtml}
      ${deductionsHtml}
      <tr>
        <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Gross Earnings</strong></td>
        <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;"><strong>${formatCurrency(grossSalary)}</strong></td>
        <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Total Deductions</strong></td>
        <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;"><strong>${formatCurrency(totalDeductions)}</strong></td>
      </tr>
    </tbody>
  </table>
  
  <div style="text-align: right; margin-top: 10px; padding: 15px; background-color: #e9ecef; border-radius: 4px;">
    <strong style="font-size: 1.1em; color: #343a40;">Net Salary (INR): ${formatCurrency(netSalary)}</strong>
  </div>
  <p style="font-size: 0.75em; color: #6c757d; text-align: center; margin-top: 25px;">This is a system-generated pay slip and does not require a signature. Generated on: ${currentDate}</p>
</div>
  `;
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
      // Simulate a brief delay for "generation"
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
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' } // Changed to A4 for better fit
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
