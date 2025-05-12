'use server';
/**
 * @fileOverview Generates a professional experience letter using AI.
 *
 * - generateExperienceLetter - A function that invokes the experience letter generation flow.
 * - GenerateExperienceLetterInput - The input type for the experience letter generation.
 * - GenerateExperienceLetterOutput - The return type for the experience letter generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod'; 
import { format } from 'date-fns';

// User-facing input schema (matches what the form sends)
const GenerateExperienceLetterInputSchema = z.object({
  employeeName: z.string().describe('The full name of the former employee.'),
  employeeId: z.string().optional().describe('The employee ID (if applicable).'),
  positionTitle: z.string().describe('The last held position title of the employee.'),
  department: z.string().describe('The department the employee worked in.'),
  joiningDate: z.string().describe("The employee's date of joining, formatted as 'MMMM d, yyyy'."),
  lastWorkingDate: z.string().describe("The employee's last working date, formatted as 'MMMM d, yyyy'."),
  keyResponsibilities: z.string().describe('A brief summary of key responsibilities and contributions. Use bullet points if appropriate, prefix with "- ".'),
  companyName: z.string().describe('The name of the company issuing the letter.'),
  issuingAuthorityName: z.string().describe('Name of the person signing the letter (e.g., HR Manager).'),
  issuingAuthorityTitle: z.string().describe('Title of the person signing the letter.'),
  companyAddress: z.string().optional().describe('The address of the company.'),
  companyContact: z.string().optional().describe('Company contact phone or email for verification.'),
  employeeEmail: z.string().email().describe("The employee's email address (for sending the document)."),
});
export type GenerateExperienceLetterInput = z.infer<typeof GenerateExperienceLetterInputSchema>;

// Schema for the data actually passed to the prompt and flow internals
const EnrichedPromptInputSchema = GenerateExperienceLetterInputSchema.extend({
  issueDate: z.string().describe('The date the letter is issued, formatted as "MMMM d, yyyy".'),
  keyResponsibilitiesHtml: z.string().describe('HTML formatted key responsibilities section.'),
});
type EnrichedPromptInput = z.infer<typeof EnrichedPromptInputSchema>;

const GenerateExperienceLetterOutputSchema = z.object({
  experienceLetterHtml: z.string().describe('The full HTML text of the generated experience letter.'),
});
export type GenerateExperienceLetterOutput = z.infer<typeof GenerateExperienceLetterOutputSchema>;

// Preprocessing function for key responsibilities
function preprocessKeyResponsibilities(keyResponsibilitiesText: string): string {
  if (!keyResponsibilitiesText || keyResponsibilitiesText.trim() === "") {
    return '<p style="margin-top: 5px; margin-bottom: 15px;">The employee fulfilled their duties as per the job description.</p>';
  }
  
  const lines = keyResponsibilitiesText.split('\n').map(s => s.trim()).filter(s => s);
  const hasBulletPoints = lines.some(line => line.startsWith("- "));

  if (hasBulletPoints) {
    // When using 12px base font, list items will also be 12px
    let htmlList = '<ul style="margin-top: 5px; margin-bottom: 15px; padding-left: 20px; font-size: 12px;">';
    lines.forEach(line => {
      if (line.startsWith("- ")) {
        const itemText = line.substring(2).replace(/</g, "&lt;").replace(/>/g, "&gt;");
        htmlList += `<li style="margin-bottom: 5px;">${itemText}</li>`;
      }
    });
    htmlList += '</ul>';
    return htmlList;
  } else {
    const paragraphText = keyResponsibilitiesText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br />');
    return `<p style="margin-top: 5px; margin-bottom: 15px; font-size: 12px;">${paragraphText}</p>`;
  }
}

export async function generateExperienceLetter(input: GenerateExperienceLetterInput): Promise<GenerateExperienceLetterOutput> {
  const keyResponsibilitiesHtml = preprocessKeyResponsibilities(input.keyResponsibilities);
  const enrichedInput: EnrichedPromptInput = {
    ...input, 
    issueDate: format(new Date(), "MMMM d, yyyy"),
    keyResponsibilitiesHtml,
  };
  return generateExperienceLetterFlow(enrichedInput);
}

const generateExperienceLetterPrompt = ai.definePrompt({
  name: 'generateExperienceLetterPrompt',
  input: { schema: EnrichedPromptInputSchema },
  output: { schema: GenerateExperienceLetterOutputSchema },
  prompt: `You are an expert HR assistant tasked with drafting a formal and professional Experience Letter as an HTML document string.
The letter should be on a formal letterhead style.
Use 12px font size for general paragraph text and 14px for main section titles like 'EXPERIENCE LETTER'. Company name can be larger.

**Letter Details:**
Issue Date: {{{issueDate}}}
Company Name: {{{companyName}}}
Company Address: {{{companyAddress}}} (e.g., "123 Innovation Drive, Tech City, ST 12345")
Company Contact: {{{companyContact}}} (e.g., "contact@company.com or +1-555-0100")

Employee Name: {{{employeeName}}}
Employee ID: {{{employeeId}}}
Position Held: {{{positionTitle}}}
Department: {{{department}}}
Date of Joining: {{{joiningDate}}}
Last Working Date: {{{lastWorkingDate}}}
Key Responsibilities/Contributions (Formatted HTML): {{{keyResponsibilitiesHtml}}}

Issuing Authority Name: {{{issuingAuthorityName}}}
Issuing Authority Title: {{{issuingAuthorityTitle}}}


**Instructions for the HTML Letter:**
1.  **Overall Structure:**
    *   Wrap the entire letter in \`<div class="experience-letter-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 30px auto; padding: 30px; border: 1px solid #cccccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); line-height: 1.6; font-size: 12px;">\`
2.  **Header (Letterhead Style):**
    *   Company Logo (placeholder): \`<img src="https://picsum.photos/180/60?grayscale" alt="Company Logo - Placeholder" style="display: block; margin-bottom: 20px; max-height: 60px;" data-ai-hint="company logo" />\`
    *   Company Name: \`<h1 style="font-size: 1.6em; color: #333; margin-bottom: 5px;">{{{companyName}}}</h1>\` (Relative to 12px base)
    *   Company Address: \`<p style="margin-bottom: 5px; font-size: 0.9em; color: #555;">{{{companyAddress}}}</p>\` (Relative to 12px, ~10.8px)
    *   Company Contact: \`<p style="margin-bottom: 20px; font-size: 0.9em; color: #555;">{{{companyContact}}}</p>\` (Relative to 12px, ~10.8px)
    *   Date of Issue: \`<p style="text-align: right; margin-bottom: 30px;"><strong>Date:</strong> {{{issueDate}}}</p>\` (12px)
3.  **Title:** \`<h2 style="font-size: 1.4em; text-align: center; color: #444; margin-bottom: 25px; text-decoration: underline;">EXPERIENCE LETTER</h2>\` (Relative to 12px base, this is ~16.8px, close to requested 14px for main sections)
4.  **Salutation/To Whom It May Concern:** \`<p style="margin-bottom: 20px;"><strong>TO WHOM IT MAY CONCERN,</strong></p>\` (12px)
5.  **Body Paragraphs:** Use \`<p>\` tags. All body text should be 12px.
    *   **Introduction:** Confirm employment.
        "This is to certify that <strong>{{{employeeName}}}</strong>{{#if employeeId}} (Employee ID: {{{employeeId}}}){{/if}} was employed with <strong>{{{companyName}}}</strong>."
    *   **Employment Period:** State the duration of employment.
        "They joined our organization on <strong>{{{joiningDate}}}</strong> and their last working day was <strong>{{{lastWorkingDate}}}</strong>."
    *   **Position and Department:**
        "During their tenure, {{{employeeName}}} held the position of <strong>{{{positionTitle}}}</strong> in the <strong>{{{department}}}</strong> department."
    *   **Responsibilities/Contributions:**
        "Their key responsibilities and contributions included:"
        {{{keyResponsibilitiesHtml}}} <!-- This will already be 12px from preprocessing -->
    *   **Concluding Remark (Optional positive statement):**
        "During their employment, {{{employeeName}}} was found to be diligent and responsible. We wish them all the best in their future endeavors." (Or a similar neutral/positive closing).
6.  **Closing:** Professional closing. (12px)
    \`<p style="margin-top: 30px;">Sincerely,</p>\`
7.  **Signature Block:** (Signature text 12px, title/company name slightly smaller if desired, e.g. 0.95em of 12px)
    \`<div style="margin-top: 20px;">\`
    \`<div style="height: 60px; width: 200px; border-bottom: 1px solid #000; margin-bottom:5px;"></div>\` (Placeholder for signature)
    \`<p style="font-weight: bold;">{{{issuingAuthorityName}}}</p>\`
    \`<p style="font-size: 0.95em;">{{{issuingAuthorityTitle}}}</p>\`
    \`<p style="font-size: 0.95em;">{{{companyName}}}</p>\`
    \`</div>\`
8.  **Styling:** Ensure good readability and a professional, modern look with 12px text and 14px for titles.
9.  **Content Focus:** Generate **only the HTML string**, starting with the outer \`<div>\` and ending with its closing \`</div>\`.

The final output must be a single, complete HTML string.
`,
});

const generateExperienceLetterFlow = ai.defineFlow(
  {
    name: 'generateExperienceLetterFlow',
    inputSchema: EnrichedPromptInputSchema, 
    outputSchema: GenerateExperienceLetterOutputSchema,
  },
  async (input) => { 
    const { output } = await generateExperienceLetterPrompt(input);
    if (!output || !output.experienceLetterHtml) {
      throw new Error("AI failed to generate an experience letter or returned empty content.");
    }
    return { experienceLetterHtml: output.experienceLetterHtml };
  }
);

