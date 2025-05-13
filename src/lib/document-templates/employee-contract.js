
import { format } from "date-fns";

export const generatePlaceholderEmployeeContractHtml = (data) => {
  const contractDate = format(new Date(), "MMMM d, yyyy");
  return `
<div class="contract-container" style="font-family: 'Times New Roman', Times, serif; max-width: 850px; margin: 30px auto; padding: 40px; border: 1px solid #888888; box-shadow: 0 2px 10px rgba(0,0,0,0.1); line-height: 1.6; font-size: 12px;">
  <h1 style="font-size: 1.7em; text-align: center; color: #222; margin-bottom: 30px; text-transform: uppercase; border-bottom: 2px solid #555; padding-bottom: 10px;">Employment Contract</h1>
  <p style="text-align: right; margin-bottom: 20px;"><strong>Date:</strong> ${contractDate}</p>
  <p>This Employment Contract ("Contract") is entered into as of ${contractDate}, by and between:</p>
  <p><strong>${data.companyName}</strong>, a company registered at ${data.companyAddress} (hereinafter referred to as the "Employer"),</p>
  <p>AND</p>
  <p><strong>${data.employeeName}</strong>, residing at ${data.employeeAddress} (hereinafter referred to as the "Employee").</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">1. Position and Duties</h3>
  <p>The Employee is appointed to the position of <strong>${data.positionTitle}</strong> in the <strong>${data.department}</strong> department. The Employee's duties will include tasks typically associated with this role.</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">2. Commencement and Duration</h3>
  <p>This contract shall commence on <strong>${data.startDate}</strong> and shall continue indefinitely, subject to termination as per clause 8.</p>
  ${data.probationPeriod ? `<h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">3. Probation Period</h3><p>The Employee's employment is subject to a probation period of ${data.probationPeriod}.</p>` : ''}
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">4. Remuneration</h3>
  <p>The Employer shall pay the Employee a salary of ${data.salary}.</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">5. Working Hours</h3>
  <p>The Employee's standard working hours will be ${data.workingHours}.</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">6. Leave Entitlement</h3>
  <p>The Employee is entitled to ${data.leaveEntitlement}.</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">7. Confidentiality</h3>
  <p>${data.confidentialityClause || "The Employee agrees to maintain the confidentiality of the Employer's proprietary information."}</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">8. Termination</h3>
  <p>This Contract may be terminated by either party by giving ${data.terminationNotice} written notice.</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">9. Governing Law</h3>
  <p>This Contract shall be governed by and construed in accordance with the laws of ${data.governingLaw}.</p>
  <h3 style="font-size: 14px; color: #333; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">10. Entire Agreement</h3>
  <p>This Contract constitutes the entire agreement between the Employer and the Employee.</p>
  <div style="margin-top: 50px; display: flex; justify-content: space-between;">
    <div style="width: 45%;"><p><strong>For and on behalf of ${data.companyName} (Employer):</strong></p><div style="height: 50px; border-bottom: 1px solid #000; margin-top: 30px;"></div><p style="font-size: 0.9em;">Authorised Signatory</p></div>
    <div style="width: 45%;"><p><strong>Accepted and Agreed by ${data.employeeName} (Employee):</strong></p><div style="height: 50px; border-bottom: 1px solid #000; margin-top: 30px;"></div><p style="font-size: 0.9em;">Signature</p></div>
  </div>
</div>
  `;
};
