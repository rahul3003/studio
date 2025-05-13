
import { format } from "date-fns";

export const generatePlaceholderExperienceLetterHtml = (data) => {
  const issueDate = format(new Date(), "MMMM d, yyyy");
  let responsibilitiesHtml = '';
  if (data.keyResponsibilities) {
    const lines = data.keyResponsibilities.split('\n').map(s => s.trim()).filter(s => s);
    if (lines.some(line => line.startsWith("- "))) {
      responsibilitiesHtml = '<ul style="margin-top: 5px; margin-bottom: 15px; padding-left: 20px; font-size: 12px;">';
      lines.forEach(line => {
        if (line.startsWith("- ")) {
          responsibilitiesHtml += `<li style="margin-bottom: 5px;">${line.substring(2)}</li>`;
        }
      });
      responsibilitiesHtml += '</ul>';
    } else {
      responsibilitiesHtml = `<p style="margin-top: 5px; margin-bottom: 15px; font-size: 12px;">${lines.join('<br />')}</p>`;
    }
  } else {
    responsibilitiesHtml = '<p style="margin-top: 5px; margin-bottom: 15px;">The employee fulfilled their duties as per the job description.</p>';
  }

  return `
<div class="experience-letter-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 30px auto; padding: 30px; border: 1px solid #cccccc; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); line-height: 1.6; font-size: 12px;">
  <img src="https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png" alt="${data.companyName} Logo" style="display: block; margin-bottom: 20px; max-height: 60px;" data-ai-hint="company logo PESU Venture Labs" />
  <h1 style="font-size: 1.6em; color: #333; margin-bottom: 5px;">${data.companyName}</h1>
  <p style="margin-bottom: 5px; font-size: 0.9em; color: #555;">${data.companyAddress || 'PESU Venture Labs, PES University, Bengaluru'}</p>
  <p style="margin-bottom: 20px; font-size: 0.9em; color: #555;">${data.companyContact || 'hr@pesuventurelabs.com'}</p>
  <p style="text-align: right; margin-bottom: 30px;"><strong>Date:</strong> ${issueDate}</p>
  <h2 style="font-size: 1.4em; text-align: center; color: #444; margin-bottom: 25px; text-decoration: underline;">EXPERIENCE LETTER</h2>
  <p style="margin-bottom: 20px;"><strong>TO WHOM IT MAY CONCERN,</strong></p>
  <p>This is to certify that <strong>${data.employeeName}</strong> ${data.employeeId ? `(Employee ID: ${data.employeeId})` : ''} was employed with <strong>${data.companyName}</strong>.</p>
  <p>They joined our organization on <strong>${data.joiningDate}</strong> and their last working day was <strong>${data.lastWorkingDate}</strong>.</p>
  <p>During their tenure, ${data.employeeName} held the position of <strong>${data.positionTitle}</strong> in the <strong>${data.department}</strong> department.</p>
  <p>Their key responsibilities and contributions included:</p>
  ${responsibilitiesHtml}
  <p>During their employment, ${data.employeeName} was found to be diligent and responsible. We wish them all the best in their future endeavors.</p>
  <p style="margin-top: 30px;">Sincerely,</p>
  <div style="margin-top: 20px;">
    <div style="height: 60px; width: 200px; border-bottom: 1px solid #000; margin-bottom:5px;"></div>
    <p style="font-weight: bold;">${data.issuingAuthorityName}</p>
    <p style="font-size: 0.95em;">${data.issuingAuthorityTitle}</p>
    <p style="font-size: 0.95em;">${data.companyName}</p>
  </div>
</div>
  `;
};
