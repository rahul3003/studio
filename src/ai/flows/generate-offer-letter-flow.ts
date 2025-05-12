
'use server';
/**
 * @fileOverview Generates a professional offer letter using AI.
 *
 * - generateOfferLetter - A function that invokes the offer letter generation flow.
 * - GenerateOfferLetterInput - The input type for the offer letter generation.
 * - GenerateOfferLetterOutput - The return type for the offer letter generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod'; 
import { format } from 'date-fns';

const GenerateOfferLetterInputSchema = z.object({
  candidateName: z.string().describe('The full name of the candidate receiving the offer.'),
  candidateEmail: z.string().email().describe("The candidate's email address."),
  positionTitle: z.string().describe('The title of the position being offered.'),
  department: z.string().describe('The department the candidate will be working in.'),
  startDate: z.string().describe("The candidate's proposed start date, formatted as 'MMMM d, yyyy'."),
  salary: z.string().describe('The offered salary and any other compensation details (e.g., "$75,000 per annum plus standard benefits").'),
  reportingManager: z.string().describe('The name of the person the candidate will report to.'),
  offerExpiryDate: z.string().describe("The date by which the candidate must accept the offer, formatted as 'MMMM d, yyyy'."),
  companyName: z.string().describe('The name of the company making the offer.'),
});
export type GenerateOfferLetterInput = z.infer<typeof GenerateOfferLetterInputSchema>;

const GenerateOfferLetterOutputSchema = z.object({
  offerLetterText: z.string().describe('The full HTML text of the generated offer letter.'),
});
export type GenerateOfferLetterOutput = z.infer<typeof GenerateOfferLetterOutputSchema>;


export async function generateOfferLetter(input: GenerateOfferLetterInput): Promise<GenerateOfferLetterOutput> {
  // Add current date to the input for the prompt
  const enrichedInput = {
    ...input,
    currentDate: format(new Date(), "MMMM d, yyyy"),
  };
  return generateOfferLetterFlow(enrichedInput);
}

const generateOfferLetterPrompt = ai.definePrompt({
  name: 'generateOfferLetterPrompt',
  input: { schema: GenerateOfferLetterInputSchema.extend({ currentDate: z.string() }) }, 
  output: { schema: GenerateOfferLetterOutputSchema },
  prompt: `You are an expert HR assistant responsible for drafting formal and professional job offer letters for PESU Venture Labs.
Generate a comprehensive offer letter **as an HTML document string**. The letter should be visually appealing and well-structured.
Use 12px font size for general paragraph text and 14px for subheadings (like 'Offer Details'). The main title can be larger.

**Company Information:**
Company Name: {{{companyName}}}
(Assume Company Address: "PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085" or similar if not explicitly provided in other inputs)
Date of Offer: {{{currentDate}}}

**Candidate and Offer Details:**
Candidate Name: {{{candidateName}}}
Position Title: {{{positionTitle}}}
Department: {{{department}}}
Reporting Manager: {{{reportingManager}}}
Proposed Start Date: {{{startDate}}}
Salary and Compensation: {{{salary}}}
Offer Expiry Date: {{{offerExpiryDate}}}

**Instructions for the HTML Letter:**
1.  **Overall Structure:**
    *   The entire letter should be wrapped in a \`<div class="offer-letter-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 30px auto; padding: 30px; border: 1px solid #cccccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); line-height: 1.6; font-size: 12px;">\`
    *   Use standard HTML tags: \`<p>\`, \`<h1>\`, \`<h3>\`, \`<strong>\`, \`<em>\`, \`<ul>\`, \`<li>\`.
2.  **Header:**
    *   Include a company logo placeholder at the top. Use: \`<img src="https://picsum.photos/150/50?grayscale" alt="PESU Venture Labs Logo - Placeholder" style="display: block; margin-bottom: 20px; max-height: 50px;" data-ai-hint="PESU Venture Labs logo" />\`
    *   Company Name: \`<h1 style="font-size: 1.5em; color: #333; margin-bottom: 5px;">{{{companyName}}}</h1>\` (This will be relative to 12px base, so ~18px)
    *   Company Address (placeholder): \`<p style="margin-bottom: 15px; font-size: 0.9em; color: #555;">PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085</p>\` (Relative to 12px, so ~10.8px)
    *   Date of Offer: \`<p style="text-align: right; margin-bottom: 20px;"><strong>Date:</strong> {{{currentDate}}}</p>\` (Will be 12px)
3.  **Salutation:** E.g., \`<p style="margin-top: 20px; margin-bottom: 15px;">Dear {{{candidateName}}},</p>\` (Will be 12px)
4.  **Body Paragraphs:** Use \`<p>\` tags for paragraphs (will be 12px). Use \`<strong>\` for emphasis on key terms.
    *   **Opening:** Clearly state the offer of employment. Express enthusiasm.
        Example: \`<p>Following our recent discussions, we are delighted to extend an offer of employment to you for the position of <strong>{{{positionTitle}}}</strong> at <strong>{{{companyName}}}</strong>.</p>\`
    *   **Position Details:** Briefly describe the role. Mention department and reporting manager.
        Create a section with a heading like \`<h3 style="font-size: 14px; color: #444; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Offer Details</h3>\`
        Include: \`<p><strong>Position Title:</strong> {{{positionTitle}}}</p>\`, etc.
    *   **Start Date:** Clearly state the proposed start date.
    *   **Compensation:** Detail the salary. Mention standard benefits.
        Create a section with a heading like \`<h3 style="font-size: 14px; color: #444; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Compensation & Benefits</h3>\`
    *   **Contingencies (Optional but good practice):** Include a standard clause if applicable (e.g., background checks).
    *   **Acceptance:** Explain how to accept and the deadline.
        Example: \`<p>To accept this offer, please sign and return this letter by <strong>{{{offerExpiryDate}}}</strong>. You can reply to this email with your signed acceptance.</p>\`
5.  **Closing:** Professional closing.
    Example: \`<p style="margin-top: 25px;">We are very excited about the possibility of you joining our team and look forward to welcoming you to <strong>{{{companyName}}}</strong>.</p>\`
6.  **Signature Block:**
    \`<p style="margin-top: 30px;">Sincerely,</p>\`
    \`<p style="margin-top: 20px; font-weight: bold;">The Hiring Team</p>\`
    \`<p style="font-size: 0.95em;">{{{companyName}}}</p>\`
7.  **Styling:**
    *   Use inline styles modestly for structure and emphasis. Ensure primary text is 12px and subheadings are 14px.
    *   Ensure good readability and a professional, modern look.
8.  **Content Focus:** Generate **only the HTML string** for the offer letter itself, starting with the outer \`<div>\` and ending with its closing \`</div>\`. Do not include any commentary, markdown, or other text outside this HTML string.

The final output must be a single, complete HTML string.
`,
});

const generateOfferLetterFlow = ai.defineFlow(
  {
    name: 'generateOfferLetterFlow',
    inputSchema: GenerateOfferLetterInputSchema.extend({ currentDate: z.string() }),
    outputSchema: GenerateOfferLetterOutputSchema,
  },
  async (input) => {
    const { output } = await generateOfferLetterPrompt(input);
    if (!output || !output.offerLetterText) {
        throw new Error("AI failed to generate an offer letter or returned empty content.");
    }
    // Ensure the output is a string and looks like HTML
    if (typeof output.offerLetterText !== 'string' || !output.offerLetterText.trim().startsWith('<div')) {
        console.warn("AI output might not be valid HTML:", output.offerLetterText);
        // Depending on strictness, you might throw an error here or try to wrap it
        // For now, we'll assume the AI mostly follows instructions.
    }
    return output;
  }
);


