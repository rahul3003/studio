
import { format } from "date-fns";

export const generatePlaceholderJoiningLetterHtml = (data) => {
  const currentDate = format(new Date(), "MMMM d, yyyy");
  return `
<div class="joining-letter-container" style="font-family: 'Arial', sans-serif; max-width: 800px; margin: 30px auto; padding: 40px; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); line-height: 1.6; font-size: 12px;">
  <img src="https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png" alt="${data.companyName} Logo" style="display: block; margin: 0 auto 25px auto; max-height: 60px;" data-ai-hint="company logo PESU Venture Labs"/>
  <h1 style="font-size: 1.7em; text-align: center; color: #2c3e50; margin-bottom: 5px;">${data.companyName}</h1>
  <p style="text-align: center; margin-bottom: 20px; font-size: 0.9em; color: #555;">${data.companyAddress}</p>
  <p style="text-align: right; margin-bottom: 25px;"><strong>Date:</strong> ${currentDate}</p>
  <p style="margin-bottom: 5px;"><strong>To,</strong></p>
  <p style="margin-bottom: 5px;"><strong>${data.employeeName}</strong></p>
  <p style="margin-top: 20px; margin-bottom: 15px;">Dear ${data.employeeName},</p>
  <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 15px; color: #333;">Subject: Joining Letter for the Position of ${data.positionTitle}</h3>
  <p>We are pleased to confirm your appointment at <strong>${data.companyName}</strong> for the position of <strong>${data.positionTitle}</strong> in the <strong>${data.department}</strong> department. We are excited to have you join our team!</p>
  <p>Your employment will commence on <strong>${data.startDate}</strong>. ${data.reportingManager ? `You will be reporting to <strong>${data.reportingManager}</strong>.` : 'Further details about your reporting structure will be shared upon joining.'}</p>
  <p>This is a <strong>${data.employeeType}</strong> position. Your starting salary will be <strong>${data.salary}</strong>, subject to statutory deductions.</p>
  <p>You will be on a probation period of six (6) months from your date of joining. Your performance will be reviewed during this period, and your confirmation will be based on a satisfactory review.</p>
  <p>Please bring the following documents on your first day for verification:</p>
  <ul style="margin-left: 20px; margin-bottom: 15px;"><li>Proof of Identity (Aadhaar/PAN Card)</li><li>Proof of Address</li><li>Educational Certificates (Highest Qualification)</li><li>Previous Employment Documents (if applicable)</li></ul>
  <p>Your employment will be governed by the policies and procedures of <strong>${data.companyName}</strong>, which will be shared with you during your induction.</p>
  <p style="margin-top: 25px;">We look forward to your joining and wish you a successful career with <strong>${data.companyName}</strong>.</p>
  <p style="margin-top: 30px;">Sincerely,</p>
  <div style="margin-top: 20px;">
    <p style="font-weight: bold;">For ${data.companyName}</p>
    <div style="height: 50px; width: 200px; border-bottom: 1px solid #000; margin-top: 10px; margin-bottom:5px;"></div>
    <p style="font-size: 0.95em;">Authorized Signatory</p>
    <p style="font-size: 0.95em;">(HR Department / Hiring Manager)</p>
  </div>
</div>
  `;
};
