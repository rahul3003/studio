
'use server';
/**
 * @fileOverview Generates a professional offer letter using AI.
 *
 * - generateOfferLetter - A function that invokes the offer letter generation flow.
 * - GenerateOfferLetterInput - The input type for the offer letter generation.
 * - GenerateOfferLetterOutput - The return type for the offer letter generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit'; // Assuming genkit/z is an alias or genkit exports z directly. If not, adjust to `import {z} from "zod";`
import { format } from 'date-fns';

const GenerateOfferLetterInputSchema = z.object({
  candidateName: z.string().describe('The full name of the candidate receiving the offer.'),
  positionTitle: z.string().describe('The title of the position being offered.'),
  department: z.string().describe('The department the candidate will be working in.'),
  startDate: z.string().describe("The candidate's proposed start date, formatted as 'MMMM d, yyyy પ્રિય."),
  salary: z.string().describe('The offered salary and any other compensation details (e.g., "$75,000 per annum plus standard benefits").'),
  reportingManager: z.string().describe('The name of the person the candidate will report to.'),
  offerExpiryDate: z.string().describe("The date by which the candidate must accept the offer, formatted as 'MMMM d, yyyy'."),
  companyName: z.string().describe('The name of the company making the offer.'),
});
export type GenerateOfferLetterInput = z.infer<typeof GenerateOfferLetterInputSchema>;

const GenerateOfferLetterOutputSchema = z.object({
  offerLetterText: z.string().describe('The full text of the generated offer letter.'),
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
  input: { schema: GenerateOfferLetterInputSchema.extend({ currentDate: z.string() }) }, // currentDate added here
  output: { schema: GenerateOfferLetterOutputSchema },
  prompt: `You are an expert HR assistant responsible for drafting formal and professional job offer letters.
Generate a comprehensive offer letter using the details provided below.

**Company Information:**
Company Name: {{{companyName}}}
Company Address: (Assume a standard placeholder like "123 Innovation Drive, Tech City, ST 12345" if not provided. You can make one up if needed.)
Date of Offer: {{{currentDate}}}

**Candidate and Offer Details:**
Candidate Name: {{{candidateName}}}
Position Title: {{{positionTitle}}}
Department: {{{department}}}
Reporting Manager: {{{reportingManager}}}
Proposed Start Date: {{{startDate}}}
Salary and Compensation: {{{salary}}}
Offer Expiry Date: {{{offerExpiryDate}}}

**Instructions for the Letter:**
1.  **Structure:** The letter should be well-structured with clear paragraphs. Include:
    *   Salutation (e.g., "Dear {{{candidateName}}},")
    *   Opening: Clearly state the offer of employment for the specified position. Express enthusiasm.
    *   Position Details: Briefly describe the role and responsibilities (you can make this generic based on the position title if not detailed). Mention the department and reporting manager.
    *   Start Date: Clearly state the proposed start date.
    *   Compensation: Detail the salary. Mention if other benefits are standard (e.g., "eligible for our standard benefits package").
    *   Contingencies (Optional but good practice): You may include a brief, standard clause if applicable, such as "This offer is contingent upon successful completion of background checks and verification of work eligibility." (Use general phrasing).
    *   Acceptance: Explain how the candidate can accept the offer (e.g., "To accept this offer, please sign and return this letter by {{{offerExpiryDate}}}.")
    *   Closing: Professional closing (e.g., "We are excited about the possibility of you joining our team...").
    *   Signature Block: For "{{{companyName}}}", with a placeholder for "Hiring Manager" or "HR Department".

2.  **Tone:** Maintain a professional, welcoming, and enthusiastic tone throughout the letter.
3.  **Formatting:** Use standard business letter formatting. Ensure proper grammar, spelling, and punctuation.
4.  **Content Focus:** Generate only the text of the offer letter itself. Do not include any other commentary or introductory phrases before or after the letter content.

Ensure the final output is just the offer letter text.
Example of desired opening:
"Dear {{{candidateName}}},

Following our recent discussions, we are delighted to extend an offer of employment to you for the position of {{{positionTitle}}} at {{{companyName}}}."

Example of desired closing:
"We look forward to welcoming you to {{{companyName}}}.

Sincerely,

The Hiring Team
{{{companyName}}}"
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
    if (!output) {
        throw new Error("AI failed to generate an offer letter.");
    }
    return output;
  }
);

