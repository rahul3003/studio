import { format } from "date-fns";

export function generatePlaceholderJoiningLetterHtml(data) {
  const {
    employeeName,
    employeeEmail,
    positionTitle,
    department,
    startDate,
    salary,
    employeeType,
    companyName = "PESU Venture Labs",
    companyAddress = "PES University, 12th Floor, B-Wing, 100 Feet Ring Road, Banashankari Stage III, Dwaraka Nagar, Banashankari, Bengaluru, Karnataka 560085",
    reportingManager = "Mr. Prashanth R",
  } = data;

  return `
    <div class="joining-letter-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: right; margin-bottom: 30px;">
        <p>${companyName}</p>
        <p>${companyAddress}</p>
      </div>

      <div style="text-align: right; margin-bottom: 30px;">
        <p>Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold;">JOINING LETTER</h1>
      </div>

      <div style="margin-bottom: 20px;">
        <p>Dear ${employeeName},</p>
        <p>Welcome to PESU Venture Labs!</p>
        <p>We are pleased to confirm your appointment as ${positionTitle} in the ${department} department, effective from ${startDate}. This letter serves as a formal confirmation of your employment with PESU Venture Labs.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold;">Terms of Employment</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px; width: 40%;">Designation:</td>
            <td style="padding: 5px;">${positionTitle}</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Department:</td>
            <td style="padding: 5px;">${department}</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Employment Type:</td>
            <td style="padding: 5px;">${employeeType}</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Work Hours:</td>
            <td style="padding: 5px;">45 Hours/week (Minimum)</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Joining Date:</td>
            <td style="padding: 5px;">${startDate}</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Work Location:</td>
            <td style="padding: 5px;">Hybrid (To be reviewed on a quarterly basis)</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Compensation:</td>
            <td style="padding: 5px;">₹ ${salary} Lakhs per month</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Reporting Manager:</td>
            <td style="padding: 5px;">${reportingManager}</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Weekly Offs:</td>
            <td style="padding: 5px;">Sundays & 2nd Saturday. We work 6 days a week.</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Probation Period:</td>
            <td style="padding: 5px;">3 Months - Paid</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Notice Period:</td>
            <td style="padding: 5px;">3 months</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold;">Important Information</h2>
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>Please bring the following documents on your joining date:
            <ul style="list-style-type: circle; padding-left: 20px;">
              <li>Original and photocopies of educational certificates</li>
              <li>Previous employment documents (if applicable)</li>
              <li>PAN Card and Aadhar Card</li>
              <li>Passport size photographs</li>
              <li>Bank account details</li>
            </ul>
          </li>
          <li>Please report to the HR department at 9:00 AM on your joining date</li>
          <li>Dress code: Business Casual</li>
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold;">Company Policies</h2>
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>Please review and sign the Employee Handbook on your joining date</li>
          <li>Complete the NDA and other required documentation</li>
          <li>Familiarize yourself with the company's code of conduct</li>
          <li>Understand the attendance and leave policies</li>
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold;">Benefits & Perks</h2>
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>Health Insurance coverage</li>
          <li>ESOP opportunities (subject to eligibility)</li>
          <li>Performance-based bonuses</li>
          <li>Professional development opportunities</li>
          <li>15 days of paid annual leave per year</li>
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <p>We are excited to have you join our team and look forward to your contributions to PESU Venture Labs. If you have any questions before your joining date, please feel free to contact the HR department.</p>
      </div>

      <div style="margin-top: 50px;">
        <div style="float: left; width: 45%;">
          <p>Sincerely,</p>
          <p style="margin-top: 50px;">ROHIT. H. R</p>
          <p>HR Operations Team</p>
          <p>PESU Venture Labs</p>
          <p>& CoCreate Ventures</p>
        </div>
        <div style="float: right; width: 45%;">
          <p>Accepted by</p>
          <p style="margin-top: 50px;">Employee Signature:</p>
          <p>Employee Name: ${employeeName}</p>
        </div>
        <div style="clear: both;"></div>
  </div>
</div>
  `;
}
