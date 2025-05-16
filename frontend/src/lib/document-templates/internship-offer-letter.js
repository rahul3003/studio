import React from "react";

export function generatePlaceholderInternshipOfferLetterHtml(data) {
  const {
    candidateName,
    candidateEmail,
    positionTitle,
    department,
    salary = "₹15,000/month",
    startDate,
    offerExpiryDate,
    companyName = "PESU Venture Labs",
    reportingManager = "Mr. Prashanth R",
  } = data;

  return `
    <div class="offer-letter-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: right; margin-bottom: 30px;">
        <p>${companyName}</p>
        <p>PES University, 12th Floor, B-Wing</p>
        <p>100 Feet Ring Road</p>
        <p>Banashankari Stage III, Dwaraka Nagar,</p>
        <p>Banashankari, Bengaluru, Karnataka 560085</p>
      </div>

      <div style="text-align: right; margin-bottom: 30px;">
        <p>Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold;">OFFER LETTER</h1>
      </div>

      <div style="margin-bottom: 20px;">
        <p>Dear ${candidateName},</p>
        <p>We are pleased to extend an internship offer with following particulars.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold;">Article 1:- Offer Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px; width: 40%;">Designation:</td>
            <td style="padding: 5px;">${positionTitle}</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Category/ Team:</td>
            <td style="padding: 5px;">${department}</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Offer Type:</td>
            <td style="padding: 5px;">Internship - Full Time</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Offer Tenure:</td>
            <td style="padding: 5px;">4 Months</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Joining Date:</td>
            <td style="padding: 5px;">${startDate}</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Work Location:</td>
            <td style="padding: 5px;">PESU Venture Labs Office, Bengaluru</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Compensation:</td>
            <td style="padding: 5px;">${salary}</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Reporting Manager:</td>
            <td style="padding: 5px;">${reportingManager}</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Probation:</td>
            <td style="padding: 5px;">1 Month</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Notice Period:</td>
            <td style="padding: 5px;">2 weeks - Either party can terminate the offer with a notice period</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Work Hours:</td>
            <td style="padding: 5px;">45 Hours/week (Minimum)</td>
          </tr>
          <tr>
            <td style="padding: 5px;">Weekly Offs:</td>
            <td style="padding: 5px;">Sunday</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold;">Leaves:</h2>
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>Max 12 days accumulated as 1 day per month</li>
          <li>Leaves beyond what is accumulated will be considered Loss Of Pay</li>
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold;">Additional Notes:</h2>
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>You need to sign the NDA form before commencing your work at the location</li>
          <li>For "Interns", this offer can be extended based on mutual convenience</li>
          <li>For interns, leave / relaxation of working hours would be provided to account for academic responsibilities, including exams. Compensation will be pro-rated</li>
          <li>Conversion to full-time employment depends on our requirements at the time of completion of internship tenure</li>
          <li>Your probation period may be extended based on particulars mentioned in "Performance and Compliance Expectations" sections</li>
          <li>Tax Deducted At Source - Your salary may be subjected to TDS of 10%</li>
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: bold;">Performance Review:</h2>
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>Update the work status regularly</li>
          <li>A periodic review will be conducted by management focussing on performance, deliverables and overall contributions</li>
        </ul>
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
          <p>Reviewed and accepted by</p>
          <p style="margin-top: 50px;">Candidate Signature:</p>
          <p>Candidate Name: ${candidateName}</p>
        </div>
        <div style="clear: both;"></div>
      </div>
    </div>
  `;
}
