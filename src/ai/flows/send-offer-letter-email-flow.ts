
'use server';
/**
 * @fileOverview Flow for sending a generated offer letter via email.
 *
 * - sendOfferLetterEmail - A function that invokes the email sending flow.
 * - SendOfferLetterEmailInput - The input type for the email sending flow.
 * - SendOfferLetterEmailOutput - The return type for the email sending flow.
 */

import { ai } from '@/ai/genkit';
import { sendEmail } from '@/services/emailService';
import { z } from 'zod'; 

const SendOfferLetterEmailInputSchema = z.object({
  candidateEmail: z.string().email().describe("The recipient's email address."),
  candidateName: z.string().describe("The candidate's full name."),
  offerLetterHtml: z.string().describe("The HTML content of the offer letter."),
  companyName: z.string().describe("The name of the company sending the offer."),
});
export type SendOfferLetterEmailInput = z.infer<typeof SendOfferLetterEmailInputSchema>;

const SendOfferLetterEmailOutputSchema = z.object({
  success: z.boolean().describe("Whether the email was sent successfully."),
  message: z.string().describe("A message indicating the result of the email sending attempt."),
});
export type SendOfferLetterEmailOutput = z.infer<typeof SendOfferLetterEmailOutputSchema>;

export async function sendOfferLetterEmail(input: SendOfferLetterEmailInput): Promise<SendOfferLetterEmailOutput> {
  return sendOfferLetterEmailFlow(input);
}

const sendOfferLetterEmailFlow = ai.defineFlow(
  {
    name: 'sendOfferLetterEmailFlow',
    inputSchema: SendOfferLetterEmailInputSchema,
    outputSchema: SendOfferLetterEmailOutputSchema,
  },
  async (input) => {
    const subject = `Job Offer from ${input.companyName} for ${input.candidateName}`;
    // Generate a more plausible from address based on the company name or a default
    const companyDomain = input.companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, '') + '.com';
    const defaultDomain = 'pesuventurelabs.com'; // Fallback domain
    const fromAddress = `careers@${companyDomain || defaultDomain}`;


    try {
      const emailResult = await sendEmail({
        to: input.candidateEmail,
        from: process.env.EMAIL_FROM || fromAddress, // Prioritize .env, then generated,
        subject: subject,
        htmlBody: input.offerLetterHtml,
      });
      return emailResult;
    } catch (error) {
      console.error('Error in sendOfferLetterEmailFlow:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while sending the email.';
      return { success: false, message: errorMessage };
    }
  }
);

