
import { format } from "date-fns";

export const generatePlaceholderOfferLetterHtml = (data) => {
  const currentDate = format(new Date(), "MMMM d, yyyy");
  return `
<div class="offer-letter-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 30px auto; padding: 30px; border: 1px solid #cccccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); line-height: 1.6; font-size: 12px;">
  <img src="https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png" alt="${data.companyName} Logo" style="display: block; margin-bottom: 20px; max-height: 50px;" data-ai-hint="company logo PESU Venture Labs" />
  <h1 style="font-size: 1.5em; color: #333; margin-bottom: 5px;">${data.companyName}</h1>
  <p style="margin-bottom: 15px; font-size: 0.9em; color: #555;">PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085</p>
  <p style="text-align: right; margin-bottom: 20px;"><strong>Date:</strong> ${currentDate}</p>
  <p style="margin-top: 20px; margin-bottom: 15px;">Dear ${data.candidateName},</p>
  <p>Following our recent discussions, we are delighted to extend an offer of employment to you for the position of <strong>${data.positionTitle}</strong> at <strong>${data.companyName}</strong>.</p>
  <h3 style="font-size: 14px; color: #444; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Offer Details</h3>
  <p><strong>Position Title:</strong> ${data.positionTitle}</p>
  <p><strong>Department:</strong> ${data.department}</p>
  <p><strong>Reporting Manager:</strong> ${data.reportingManager}</p>
  <p><strong>Proposed Start Date:</strong> ${data.startDate}</p>
  <h3 style="font-size: 14px; color: #444; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Compensation & Benefits</h3>
  <p><strong>Salary:</strong> ${data.salary}</p>
  <p>Further details on benefits will be shared upon joining.</p>
  <p>To accept this offer, please sign and return this letter by <strong>${data.offerExpiryDate}</strong>. You can reply to this email with your signed acceptance.</p>
  <p style="margin-top: 25px;">We are very excited about the possibility of you joining our team and look forward to welcoming you to <strong>${data.companyName}</strong>.</p>
  <p style="margin-top: 30px;">Sincerely,</p>
  <p style="margin-top: 20px; font-weight: bold;">The Hiring Team</p>
  <p style="font-size: 0.95em;">${data.companyName}</p>
</div>
  `;
};
