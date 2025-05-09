
'use server';
/**
 * @fileOverview Mock email service.
 * This service simulates sending emails for development purposes.
 * In a production environment, this would integrate with a real email provider.
 */

export interface SendEmailParams {
  to: string;
  subject: string;
  htmlBody: string;
  from?: string; // Optional: from email address
}

/**
 * Simulates sending an email.
 * @param params - The email parameters.
 * @returns A promise that resolves with a success or error message.
 */
export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; message: string }> {
  console.log("Attempting to send email (mock)...");
  console.log("To:", params.to);
  console.log("From:", params.from || "noreply@hrmsportal.com");
  console.log("Subject:", params.subject);
  // console.log("HTML Body:", params.htmlBody); // Avoid logging potentially large HTML bodies

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate success/failure (can be made more complex if needed)
  if (!params.to || !params.subject || !params.htmlBody) {
    console.error("Email sending failed: Missing required parameters.");
    return { success: false, message: "Email sending failed: Missing required parameters." };
  }
  
  if (!params.to.includes('@')) {
    console.error(`Email sending failed: Invalid recipient email: ${params.to}`);
    return { success: false, message: `Email sending failed: Invalid recipient email: ${params.to}` };
  }

  console.log(`Mock email successfully "sent" to ${params.to}.`);
  return { success: true, message: `Email successfully sent to ${params.to} (mock).` };
}
