import React from "react";

export function generatePlaceholderOfferLetterHtml(data) {
  const {
    candidateName,
    candidateEmail,
    positionTitle,
    department,
    salary,
    startDate,
    offerExpiryDate,
    companyName = "PESU Venture Labs",
    reportingManager = "Mr. Prashanth R",
  } = data;

  return `
    <div class="offer-letter-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
        <div style="padding-top: 20px;">
          <img
            src="https://images.crunchbase.com/image/upload/c_pad,f_auto,q_auto:eco,dpr_1/xalctkna6eqyvi9jbgfz"
            alt="Company Logo"
            style="height: 80px; object-fit: contain;"
          />
        </div>
        <div style="text-align: right; font-size: 14px;">
          <p style="margin: 0; padding: 0;"><strong>${companyName}</strong></p>
          <p style="margin: 0; padding: 0;">PES University, 12th Floor, B-Wing</p>
          <p style="margin: 0; padding: 0;">100 Feet Ring Road</p>
          <p style="margin: 0; padding: 0;">Banashankari Stage III, Dwaraka Nagar</p>
          <p style="margin: 0; padding: 0;">Banashankari, Bengaluru, Karnataka 560085</p>
        </div>
      </div>

      <div style="text-align: right; margin-bottom: 30px;">
        <p>Date: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold;">OFFER LETTER</h1>
      </div>

      <div style="margin-bottom: 20px;">
        <p>Dear ${candidateName},</p>
        <p>Welcome Aboard!</p>
        <p>After careful consideration of your application and subsequent interviews, we are delighted to extend an offer for you to join ${companyName}, a unit of PES University and CoCreate Ventures. Please find the particulars of your offer as listed below.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px;">Article 1:- Offer Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr><td style="padding: 5px; width: 40%;">Designation:</td><td style="padding: 5px;">${positionTitle}</td></tr>
            <tr><td style="padding: 5px;">Category:</td><td style="padding: 5px;">${department}</td></tr>
            <tr><td style="padding: 5px;">Offer Type:</td><td style="padding: 5px;">Full-Time Employee</td></tr>
            <tr><td style="padding: 5px;">Work Hours:</td><td style="padding: 5px;">45 Hours/week (Minimum)</td></tr>
            <tr><td style="padding: 5px;">Joining Date:</td><td style="padding: 5px;">${startDate}</td></tr>
            <tr><td style="padding: 5px;">Work Location:</td><td style="padding: 5px;">Hybrid (To be reviewed on a quarterly basis)</td></tr>
            <tr><td style="padding: 5px;">Compensation:</td><td style="padding: 5px;">${salary}</td></tr>
            <tr><td style="padding: 5px;">Reporting Manager:</td><td style="padding: 5px;">${reportingManager} (Subject to change post-joining)</td></tr>
            <tr><td style="padding: 5px;">Weekly Offs:</td><td style="padding: 5px;">Sundays & 2nd Saturday. We work 6 days a week.</td></tr>
            <tr><td style="padding: 5px;">Probation:</td><td style="padding: 5px;">3 Months - Paid.</td></tr>
            <tr><td style="padding: 5px;">Notice Period:</td><td style="padding: 5px;">3 months - Either party can terminate the offer with a notice period.</td></tr>
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px;">Additional Notes</h2>
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>Review the Employee Handbook and seek clarification on any queries.</li>
          <li>Sign the NDA form before commencing work at the location.</li>
          <li>Tax Deducted At Source (TDS) of 10% may apply to your salary.</li>
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px;">Leaves/ Holidays</h2>
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>Max 15 days/year accumulated as Paid Annual Leave at the rate of 1.25 days/month.</li>
          <li>An employee is allowed to carry forward up to 6 days of Paid Annual Leave at the end of the year.</li>
          <li>Leaves beyond the accumulated amount will be considered 'Loss Of Pay.'</li>
          <li>Leave count resets every year on 1st January.</li>
          <li>Bereavement will be 3 days (covering parents/ spouse/siblings/ parents-in-law).</li>
          <li>PVL has a right to decide holidays (upto maximum of 10 days) in a calendar year.</li>
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px;">Job Responsibilities</h2>
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>Collaborate with management to accomplish objectives with enhanced quality results in your respective business services.</li>
          <li>Manage key business metrics focusing on business service-level agreements (SLAs) with clients.</li>
          <li>Document every known issue and solution promptly and communicate.</li>
          <li>Gather and convey customer feedback to management.</li>
          <li>Enhance the overall quality and efficiency of services delivered to customers.</li>
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px;">Working Conditions</h2>
        <p>The principal place of work is the ${companyName} Office in Bengaluru, unless your manager agrees for a Remote Working option. In such a case, your work location is considered as "home" (with an address provided by you).</p>
        <p>Prior permission from the reporting manager is necessary for remote work.</p>
        <p>The regular working hours are as per Article 1, with a daily unpaid break as required by law.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px;">Moonlighting Clause</h2>
        <p>The employee agrees not to engage in other employment or consulting without written consent from the employer. Violation may result in termination.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px;">Additional Benefits/ Perks</h2>
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>Eligible employees may participate in our Employee Stock Ownership Plan (ESOP) or equity programs (terms provided separately).</li>
          <li>Bonuses may be awarded for successful project launches.</li>
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px;">General Terms</h2>
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>Responsibilities may be amended to align with company needs.</li>
          <li>The employee must perform duties loyally.</li>
          <li>Travel may be required without additional pay.</li>
          <li>The employee cannot commit the company without approval.</li>
          <li>Attendance and sign-in/out are mandatory.</li>
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px;">Performance Review</h2>
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>Regular status updates are expected.</li>
          <li>Performance reviews may impact variable income and role progression.</li>
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <p><strong>NOTE:</strong> This offer of Employment is strictly confidential and must not be disclosed.</p>
      </div>

      <div style="margin-top: 50px;">
        <div style="float: left; width: 45%;">
          <p>Sincerely,</p>
          <p style="margin-top: 50px;">ROHIT. H. R</p>
          <p>HR Operations Team</p>
          <p>${companyName}</p>
          <p>& CoCreate Ventures</p>
        </div>
        <div style="float: right; width: 45%;">
          <p>Reviewed and accepted by</p>
          <p style="margin-top: 50px;">Candidate Signature:</p>
          <p>Candidate Name: ${candidateName}</p>
        </div>
        <div style="clear: both;"></div>
      </div>
</div>
  `;
}

// Reusable Section Component
const Section = ({ title, items }) => (
  <div style={{ marginBottom: "20px" }}>
    <h2 style={{ fontSize: "18px" }}>{title}</h2>
    <ul style={{ paddingLeft: "20px" }}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);
