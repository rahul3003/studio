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

export interface SendEmailParams {
  to: string;
  subject: string;
  htmlBody: string;
  from?: string; // Optional: from email address, defaults to EMAIL_FROM env var
}

/**
 * Sends an email using Nodemailer.
 * @param params - The email parameters.
 * @returns A promise that resolves with a success or error message.
 */
export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; message: string }> {
  const { to, subject, htmlBody } = params;

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email service misconfiguration: Missing SMTP environment variables (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS).");
    return { success: false, message: "Email service is not configured. Please contact administrator." };
  }
  
  const fromAddress = params.from || process.env.EMAIL_FROM || "HRMS Portal <noreply@example.com>";

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
        // do not fail on invalid certs if using self-signed certificates for local development
        rejectUnauthorized: process.env.NODE_ENV === 'production', 
    }
  });

  const mailOptions = {
    from: fromAddress,
    to: to,
    subject: subject,
    html: htmlBody,
  };

  try {
    await transporter.verify(); // Verify connection configuration
    console.log("SMTP Connection verified. Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: %s", info.messageId);
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info)); // Uncomment if using ethereal.email for testing
    return { success: true, message: `Email successfully sent to ${to}.` };
  } catch (error) {
    console.error("Error sending email:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while sending the email.";
    return { success: false, message: `Failed to send email: ${errorMessage}` };
  }
}
