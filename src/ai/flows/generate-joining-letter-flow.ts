
'use server';
/**
 * @fileOverview Generates a professional joining letter using AI.
 *
 * - generateJoiningLetter - A function that invokes the joining letter generation flow.
 * - GenerateJoiningLetterInput - The input type for joining letter generation.
 * - GenerateJoiningLetterOutput - The return type for joining letter generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { format } from 'date-fns';

const GenerateJoiningLetterInputSchema = z.object({
  employeeName: z.string().describe('The full name of the new employee.'),
  employeeEmail: z.string().email().describe("The employee's email address."),
  positionTitle: z.string().describe('The title of the position being offered.'),
  department: z.string().describe('The department the employee will join.'),
  startDate: z.string().describe("The employee's start date, formatted as 'MMMM d, yyyy'."),
  salary: z.string().describe('The offered salary (e.g., "₹6,00,000 per annum").'),
  employeeType: z.string().describe('Type of employment (e.g., "Full-time", "Part-time", "Contractor", "Intern").'),
  companyName: z.string().describe('The name of the company.'),
  companyAddress: z.string().describe('The registered address of the company.'),
  reportingManager: z.string().optional().describe('Name of the reporting manager (if applicable).'),
});
export type GenerateJoiningLetterInput = z.infer<typeof GenerateJoiningLetterInputSchema>;

const GenerateJoiningLetterOutputSchema = z.object({
  joiningLetterHtml: z.string().describe('The full HTML text of the generated joining letter.'),
});
export type GenerateJoiningLetterOutput = z.infer<typeof GenerateJoiningLetterOutputSchema>;

export async function generateJoiningLetter(input: GenerateJoiningLetterInput): Promise<GenerateJoiningLetterOutput> {
  const enrichedInput = {
    ...input,
    currentDate: format(new Date(), "MMMM d, yyyy"),
  };
  return generateJoiningLetterFlow(enrichedInput);
}

const generateJoiningLetterPrompt = ai.definePrompt({
  name: 'generateJoiningLetterPrompt',
  input: { schema: GenerateJoiningLetterInputSchema.extend({ currentDate: z.string() }) },
  output: { schema: GenerateJoiningLetterOutputSchema },
  prompt: `You are an expert HR assistant for PESU Venture Labs, tasked with drafting a formal and welcoming Joining Letter as an HTML document string.
The letter should be professional, well-structured, and visually appealing. Use 12px font size for general text and 14px for headings.

**Letter Details:**
Date of Letter: {{{currentDate}}}
Company Name: {{{companyName}}}
Company Address: {{{companyAddress}}} (e.g., "PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085")

Employee Name: {{{employeeName}}}
Position Title: {{{positionTitle}}}
Department: {{{department}}}
Start Date: {{{startDate}}}
Salary: {{{salary}}}
Employment Type: {{{employeeType}}}
{{#if reportingManager}}Reporting Manager: {{{reportingManager}}}{{/if}}

**Instructions for the HTML Joining Letter:**
1.  **Overall Structure:**
    *   Wrap in \`<div class="joining-letter-container" style="font-family: 'Arial', sans-serif; max-width: 800px; margin: 30px auto; padding: 40px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); line-height: 1.6; font-size: 12px;">\`
2.  **Header (Letterhead Style):**
    *   Company Logo: \`<img src="https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png" alt="{{{companyName}}} Logo" style="display: block; margin: 0 auto 25px auto; max-height: 60px;" data-ai-hint="company logo PESU Venture Labs"/>\`
    *   Company Name: \`<h1 style="font-size: 1.7em; text-align: center; color: #2c3e50; margin-bottom: 5px;">{{{companyName}}}</h1>\` (Relative to 12px base)
    *   Company Address: \`<p style="text-align: center; margin-bottom: 20px; font-size: 0.9em; color: #555;">{{{companyAddress}}}</p>\`
    *   Date of Letter: \`<p style="text-align: right; margin-bottom: 25px;"><strong>Date:</strong> {{{currentDate}}}</p>\`
3.  **Recipient Details:**
    *   \`<p style="margin-bottom: 5px;"><strong>To,</strong></p>\`
    *   \`<p style="margin-bottom: 5px;"><strong>{{{employeeName}}}</strong></p>\`
    *   (Consider adding employee address if available/needed, for now, just name)
4.  **Salutation:** \`<p style="margin-top: 20px; margin-bottom: 15px;">Dear {{{employeeName}}},</p>\`
5.  **Subject Line:** \`<h3 style="font-size: 14px; font-weight: bold; margin-bottom: 15px; color: #333;">Subject: Joining Letter for the Position of {{{positionTitle}}}</h3>\`
6.  **Body Paragraphs:** Use \`<p>\` tags. All body text should be 12px.
    *   **Welcome & Confirmation:**
        \`<p>We are pleased to confirm your appointment at <strong>{{{companyName}}}</strong> for the position of <strong>{{{positionTitle}}}</strong> in the <strong>{{{department}}}</strong> department. We are excited to have you join our team!</p>\`
    *   **Start Date & Reporting:**
        \`<p>Your employment will commence on <strong>{{{startDate}}}</strong>. {{#if reportingManager}}You will be reporting to <strong>{{{reportingManager}}}</strong>.{{else}}Further details about your reporting structure will be shared upon joining.{{/if}}</p>\`
    *   **Employment Type & Salary:**
        \`<p>This is a <strong>{{{employeeType}}}</strong> position. Your starting salary will be <strong>{{{salary}}}</strong>, subject to statutory deductions.</p>\`
    *   **Work Location (Optional - if needed):** (Add if relevant, e.g., "Your primary work location will be our office at [Company Address].")
    *   **Probation (Standard Clause - can be adapted):**
        \`<p>You will be on a probation period of six (6) months from your date of joining. Your performance will be reviewed during this period, and your confirmation will be based on a satisfactory review.</p>\`
    *   **Documentation:**
        \`<p>Please bring the following documents on your first day for verification: (List standard documents like ID proof, address proof, educational certificates, previous employment relieving letter - if applicable). This list can be generic for now.</p>\`
        \`<ul style="margin-left: 20px; margin-bottom: 15px;"><li>Proof of Identity (Aadhaar/PAN Card)</li><li>Proof of Address</li><li>Educational Certificates (Highest Qualification)</li><li>Previous Employment Documents (if applicable)</li></ul>\`
    *   **Company Policies:**
        \`<p>Your employment will be governed by the policies and procedures of <strong>{{{companyName}}}</strong>, which will be shared with you during your induction.</p>\`
    *   **Acceptance (Optional - if this letter also serves as an offer acceptance reminder):** (Usually an offer letter precedes this, so this might be less common in a pure joining letter)
7.  **Closing:**
    \`<p style="margin-top: 25px;">We look forward to your joining and wish you a successful career with <strong>{{{companyName}}}</strong>.</p>\`
8.  **Signature Block:**
    \`<p style="margin-top: 30px;">Sincerely,</p>\`
    \`<div style="margin-top: 20px;">\`
    \`<p style="font-weight: bold;">For {{{companyName}}}</p>\`
    \`<div style="height: 50px; width: 200px; border-bottom: 1px solid #000; margin-top: 10px; margin-bottom:5px;"></div>\` (Placeholder for signature)
    \`<p style="font-size: 0.95em;">Authorized Signatory</p>\`
    \`<p style="font-size: 0.95em;">(HR Department / Hiring Manager)</p>\`
    \`</div>\`
9.  **Styling:** Ensure a formal, professional, and welcoming tone. Primary text 12px, headings 14px.
10. **Content Focus:** Generate **only the HTML string**, starting with the outer \`<div>\`.

The final output must be a single, complete HTML string.
`,
});

const generateJoiningLetterFlow = ai.defineFlow(
  {
    name: 'generateJoiningLetterFlow',
    inputSchema: GenerateJoiningLetterInputSchema.extend({ currentDate: z.string() }),
    outputSchema: GenerateJoiningLetterOutputSchema,
  },
  async (input) => {
    const { output } = await generateJoiningLetterPrompt(input);
    if (!output || !output.joiningLetterHtml) {
      throw new Error("AI failed to generate a joining letter or returned empty content.");
    }
    return { joiningLetterHtml: output.joiningLetterHtml };
  }
);
