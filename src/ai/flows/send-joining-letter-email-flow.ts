
'use server';
/**
 * @fileOverview Flow for sending a generated joining letter via email.
 *
 * - sendJoiningLetterEmail - A function that invokes the email sending flow.
 * - SendJoiningLetterEmailInput - The input type for the email sending flow.
 * - SendJoiningLetterEmailOutput - The return type for the email sending flow.
 */

import { ai } from '@/ai/genkit';
import { sendEmail } from '@/services/emailService';
import { z } from 'zod';

const SendJoiningLetterEmailInputSchema = z.object({
  employeeEmail: z.string().email().describe("The new employee's email address."),
  employeeName: z.string().describe("The new employee's full name."),
  joiningLetterHtml: z.string().describe("The HTML content of the joining letter."),
  companyName: z.string().describe("The name of the company sending the letter."),
});
export type SendJoiningLetterEmailInput = z.infer<typeof SendJoiningLetterEmailInputSchema>;

const SendJoiningLetterEmailOutputSchema = z.object({
  success: z.boolean().describe("Whether the email was sent successfully."),
  message: z.string().describe("A message indicating the result of the email sending attempt."),
});
export type SendJoiningLetterEmailOutput = z.infer<typeof SendJoiningLetterEmailOutputSchema>;

export async function sendJoiningLetterEmail(input: SendJoiningLetterEmailInput): Promise<SendJoiningLetterEmailOutput> {
  return sendJoiningLetterEmailFlow(input);
}

const sendJoiningLetterEmailFlow = ai.defineFlow(
  {
    name: 'sendJoiningLetterEmailFlow',
    inputSchema: SendJoiningLetterEmailInputSchema,
    outputSchema: SendJoiningLetterEmailOutputSchema,
  },
  async (input) => {
    const subject = `Welcome to ${input.companyName} - Your Joining Letter`;
    const companyDomain = input.companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, '') + '.com';
    const defaultDomain = 'pesuventurelabs.com';
    const fromAddress = `hr@${companyDomain || defaultDomain}`;

    try {
      const emailResult = await sendEmail({
        to: input.employeeEmail,
        from: process.env.EMAIL_FROM || fromAddress,
        subject: subject,
        htmlBody: input.joiningLetterHtml,
      });
      return emailResult;
    } catch (error) {
      console.error('Error in sendJoiningLetterEmailFlow:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while sending the email.';
      return { success: false, message: errorMessage };
    }
  }
);
