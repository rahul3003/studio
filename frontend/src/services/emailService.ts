'use server';
/**
 * @fileOverview Email service using Nodemailer.
 * This service sends emails using SMTP.
 * It requires environment variables to be set for SMTP configuration:
 * - EMAIL_HOST: SMTP server host
 * - EMAIL_PORT: SMTP server port (e.g., 587 for TLS, 465 for SSL)
 * - EMAIL_USER: SMTP username
 * - EMAIL_PASS: SMTP password
 * - EMAIL_FROM: The "From" address for emails (e.g., "HRMS Portal <noreply@yourdomain.com>")
 */

import nodemailer from 'nodemailer';

export interface EmailAttachment {
  filename: string;
  content: string; // For HTML content string or base64 encoded string for other file types
  contentType?: string; // e.g., 'text/html', 'application/pdf'
  encoding?: string; // e.g., 'base64' if content is base64 encoded
}

export interface SendEmailParams {
  to: string;
  subject: string;
  htmlBody: string; // Main body of the email
  from?: string;
  attachments?: EmailAttachment[];
}

/**
 * Sends an email using Nodemailer.
 * @param params - The email parameters.
 * @returns A promise that resolves with a success or error message.
 */
export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; message: string }> {
  const { to, subject, htmlBody, attachments } = params;

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM) {
    console.error("Email service misconfiguration: Missing one or more required SMTP environment variables (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM).");
    return { success: false, message: "Email service is not configured. Please contact administrator." };
  }
  
  const fromAddress = params.from || process.env.EMAIL_FROM;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production', 
    }
  });

  const mailOptions: nodemailer.SendMailOptions = { // Explicitly type mailOptions
    from: fromAddress,
    to: to,
    subject: subject,
    html: htmlBody,
    attachments: attachments?.map(att => ({
      filename: att.filename,
      content: att.content,
      contentType: att.contentType,
      encoding: att.encoding as ('base64' | undefined), // Cast encoding to accepted types
    })),
  };

  try {
    await transporter.verify(); 
    console.log("SMTP Connection verified. Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: %s", info.messageId);
    return { success: true, message: `Email successfully sent to ${to}. Message ID: ${info.messageId}` };
  } catch (error) {
    console.error("Error sending email:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while sending the email.";
    return { success: false, message: `Failed to send email: ${errorMessage}` };
  }
}
