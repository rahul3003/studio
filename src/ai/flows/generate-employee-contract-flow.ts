
'use server';
/**
 * @fileOverview Generates a professional employee contract using AI.
 *
 * - generateEmployeeContract - A function that invokes the employee contract generation flow.
 * - GenerateEmployeeContractInput - The input type for the employee contract generation.
 * - GenerateEmployeeContractOutput - The return type for the employee contract generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod'; // Corrected: import z from zod
import { format } from 'date-fns';

const GenerateEmployeeContractInputSchema = z.object({
  employeeName: z.string().describe('The full name of the employee.'),
  employeeAddress: z.string().describe("The employee's full residential address."),
  positionTitle: z.string().describe('The title of the position.'),
  department: z.string().describe('The department the employee will work in.'),
  startDate: z.string().describe("The employee's start date, formatted as 'MMMM d, yyyy'."),
  salary: z.string().describe('The annual salary and payment frequency (e.g., "$60,000 per annum, paid monthly").'),
  workingHours: z.string().describe('Standard working hours, e.g., "9 AM to 5 PM, Monday to Friday".'),
  probationPeriod: z.string().optional().describe('Duration of the probation period, e.g., "3 months".'),
  leaveEntitlement: z.string().describe('Annual leave entitlement, e.g., "20 paid days per year".'),
  confidentialityClause: z.string().optional().describe('Brief summary or reference to a standard confidentiality clause.'),
  terminationNotice: z.string().describe('Notice period for termination by either party, e.g., "4 weeks".'),
  companyName: z.string().describe('The name of the company.'),
  companyAddress: z.string().describe('The registered address of the company.'),
  governingLaw: z.string().describe('The jurisdiction whose laws will govern the contract, e.g., "State of California".'),
  employeeEmail: z.string().email().describe("The employee's email address (for sending the document)."),
});
export type GenerateEmployeeContractInput = z.infer<typeof GenerateEmployeeContractInputSchema>;

const GenerateEmployeeContractOutputSchema = z.object({
  contractHtml: z.string().describe('The full HTML text of the generated employee contract.'),
});
export type GenerateEmployeeContractOutput = z.infer<typeof GenerateEmployeeContractOutputSchema>;

export async function generateEmployeeContract(input: GenerateEmployeeContractInput): Promise<GenerateEmployeeContractOutput> {
  const enrichedInput = {
    ...input,
    contractDate: format(new Date(), "MMMM d, yyyy"),
  };
  return generateEmployeeContractFlow(enrichedInput);
}

const generateEmployeeContractPrompt = ai.definePrompt({
  name: 'generateEmployeeContractPrompt',
  input: { schema: GenerateEmployeeContractInputSchema.extend({ contractDate: z.string() }) },
  output: { schema: GenerateEmployeeContractOutputSchema },
  prompt: `You are an expert HR assistant tasked with drafting a formal and comprehensive Employee Contract as an HTML document string.
The contract should be well-structured, legally sound (for general purposes, not specific legal advice), and visually appealing.

**Contract Details:**
Date of Contract: {{{contractDate}}}
Company Name: {{{companyName}}}
Company Address: {{{companyAddress}}}
Employee Name: {{{employeeName}}}
Employee Address: {{{employeeAddress}}}
Position Title: {{{positionTitle}}}
Department: {{{department}}}
Start Date: {{{startDate}}}
Salary: {{{salary}}}
Working Hours: {{{workingHours}}}
Probation Period: {{{probationPeriod}}}
Leave Entitlement: {{{leaveEntitlement}}}
Confidentiality: {{{confidentialityClause}}}
Termination Notice: {{{terminationNotice}}}
Governing Law: {{{governingLaw}}}

**Instructions for the HTML Contract:**
1.  **Overall Structure:**
    *   Wrap the entire contract in \`<div class="contract-container" style="font-family: 'Times New Roman', Times, serif; max-width: 850px; margin: 30px auto; padding: 40px; border: 1px solid #888888; box-shadow: 0 2px 10px rgba(0,0,0,0.1); line-height: 1.6;">\`
    *   Use standard HTML tags: \`<p>\`, \`<h1>\`, \`<h2>\`, \`<h3>\`, \`<strong>\`, \`<em>\`, \`<ul>\`, \`<li>\`.
2.  **Header:**
    *   Title: \`<h1 style="font-size: 2em; text-align: center; color: #222; margin-bottom: 30px; text-transform: uppercase; border-bottom: 2px solid #555; padding-bottom: 10px;">Employment Contract</h1>\`
    *   Date of Contract: \`<p style="text-align: right; margin-bottom: 20px;"><strong>Date:</strong> {{{contractDate}}}</p>\`
3.  **Parties Involved:**
    *   Clearly state the parties: The Company ("Employer") and The Employee.
    *   Example: \`<p>This Employment Contract ("Contract") is entered into as of {{{contractDate}}}, by and between:</p>\`
    *   \`<p><strong>{{{companyName}}}</strong>, a company registered at {{{companyAddress}}} (hereinafter referred to as the "Employer"),</p>\`
    *   \`<p>AND</p>\`
    *   \`<p><strong>{{{employeeName}}}</strong>, residing at {{{employeeAddress}}} (hereinafter referred to as the "Employee").</p>\`
4.  **Clauses (Numbered List):** Use \`<h3 style="font-size: 1.2em; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">1. Position and Duties</h3>\` for main clauses.
    *   **1. Position and Duties:** State position, department, and briefly outline responsibilities. "The Employee is appointed to the position of <strong>{{{positionTitle}}}</strong> in the <strong>{{{department}}}</strong> department. The Employee's duties will include..." (general description).
    *   **2. Commencement and Duration:** State the start date. Specify if fixed-term or indefinite. "This contract shall commence on <strong>{{{startDate}}}</strong>..."
    *   **3. Probation Period:** "The Employee's employment is subject to a probation period of {{{probationPeriod}}}..." (if applicable).
    *   **4. Remuneration:** Detail salary and payment terms. "The Employer shall pay the Employee a salary of {{{salary}}}..."
    *   **5. Working Hours:** Specify standard working hours. "The Employee's standard working hours will be {{{workingHours}}}..."
    *   **6. Leave Entitlement:** Detail annual leave, sick leave, etc. "The Employee is entitled to {{{leaveEntitlement}}}..."
    *   **7. Confidentiality:** "The Employee agrees to maintain the confidentiality of the Employer's proprietary information..." (Use {{{confidentialityClause}}} if provided, otherwise a standard brief statement).
    *   **8. Termination:** Specify notice periods. "This Contract may be terminated by either party by giving {{{terminationNotice}}} written notice..."
    *   **9. Governing Law:** "This Contract shall be governed by and construed in accordance with the laws of {{{governingLaw}}}."
    *   **10. Entire Agreement:** "This Contract constitutes the entire agreement between the Employer and the Employee..."
5.  **Signatures:**
    *   Provide space for signatures.
    *   \`<div style="margin-top: 50px; display: flex; justify-content: space-between;">\`
    *   \`<div style="width: 45%;"><p><strong>For and on behalf of {{{companyName}}} (Employer):</strong></p><div style="height: 50px; border-bottom: 1px solid #000; margin-top: 30px;"></div><p style="font-size: 0.9em;">Authorised Signatory</p></div>\`
    *   \`<div style="width: 45%;"><p><strong>Accepted and Agreed by {{{employeeName}}} (Employee):</strong></p><div style="height: 50px; border-bottom: 1px solid #000; margin-top: 30px;"></div><p style="font-size: 0.9em;">Signature</p></div>\`
    *   \`</div>\`
6.  **Styling:**
    *   Use inline styles for a formal, traditional document appearance. Emphasize clarity and readability.
    *   Font: Times New Roman or similar serif font.
7.  **Content Focus:** Generate **only the HTML string** for the contract, starting with the outer \`<div>\` and ending with its closing \`</div>\`. Do not include any commentary or text outside this HTML.

The final output must be a single, complete HTML string.
`,
});

const generateEmployeeContractFlow = ai.defineFlow(
  {
    name: 'generateEmployeeContractFlow',
    inputSchema: GenerateEmployeeContractInputSchema.extend({ contractDate: z.string() }),
    outputSchema: GenerateEmployeeContractOutputSchema,
  },
  async (input) => {
    const { output } = await generateEmployeeContractPrompt(input);
    if (!output || !output.contractHtml) {
      throw new Error("AI failed to generate an employee contract or returned empty content.");
    }
    return { contractHtml: output.contractHtml };
  }
);
