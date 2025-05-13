
import { format } from "date-fns";

export const generatePlaceholderPaySlipHtml = (data) => {
  const currentDate = format(new Date(), "MMMM d, yyyy");
  const formatCurrency = (num) => typeof num === 'number' ? num.toFixed(2) : '0.00';
  
  let allowancesHtml = '';
  let totalAllowances = 0;
  if (data.allowancesStr) {
    data.allowancesStr.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length === 2) {
        const name = parts[0].trim();
        const amount = parseFloat(parts[1].trim());
        if (name && !isNaN(amount)) {
          allowancesHtml += `<tr><td style="padding: 8px; border: 1px solid #dee2e6;">${name}</td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">${formatCurrency(amount)}</td><td></td><td></td></tr>`;
          totalAllowances += amount;
        }
      }
    });
  }

  let deductionsHtml = '';
  let totalDeductions = 0;
  if (data.deductionsStr) {
    data.deductionsStr.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length === 2) {
        const name = parts[0].trim();
        const amount = parseFloat(parts[1].trim());
        if (name && !isNaN(amount)) {
          deductionsHtml += `<tr><td></td><td></td><td style="padding: 8px; border: 1px solid #dee2e6;">${name}</td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">${formatCurrency(amount)}</td></tr>`;
          totalDeductions += amount;
        }
      }
    });
  }

  const grossSalary = (data.basicSalary || 0) + totalAllowances;
  const netSalary = grossSalary - totalDeductions;
  const companyLogo = data.companyLogoUrl || 'https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png';


  return `
<div class="payslip-container" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 700px; margin: 20px auto; padding: 25px; border: 1px solid #dee2e6; border-radius: 6px; box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075); background-color: #fff; font-size: 12px;">
  <img src="${companyLogo}" alt="${data.companyName} Logo" style="max-height: 60px; margin-bottom: 15px; display: block;" data-ai-hint="company logo PESU Venture Labs"/>
  <h1 style="font-size: 1.5em; color: #343a40; margin-bottom: 3px;">${data.companyName}</h1>
  <p style="font-size: 0.85em; color: #6c757d; margin-bottom: 15px;">${data.companyAddress || 'PESU Venture Labs, PES University, Bengaluru'}</p>
  <h2 style="font-size: 1.3em; text-align: center; color: #495057; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ced4da;">Pay Slip</h2>
  <p style="font-size: 0.9em; text-align: center; color: #6c757d; margin-bottom: 20px;">For the period: <strong>${data.payPeriodStartDate} to ${data.payPeriodEndDate}</strong> | Payment Date: <strong>${data.paymentDate}</strong></p>
  
  <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 4px;">
    <div style="width: 48%;">
      <p style="font-size: 0.9em; margin: 3px 0;"><span style="color: #6c757d;">Employee Name:</span> <strong style="color: #343a40;">${data.employeeName}</strong></p>
      <p style="font-size: 0.9em; margin: 3px 0;"><span style="color: #6c757d;">Employee ID:</span> <strong style="color: #343a40;">${data.employeeId}</strong></p>
    </div>
    <div style="width: 48%;">
      <p style="font-size: 0.9em; margin: 3px 0;"><span style="color: #6c757d;">Department:</span> <strong style="color: #343a40;">${data.department}</strong></p>
      <p style="font-size: 0.9em; margin: 3px 0;"><span style="color: #6c757d;">Position:</span> <strong style="color: #343a40;">${data.positionTitle}</strong></p>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9em;">
    <thead style="background-color: #e9ecef;">
      <tr>
        <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; color: #495057;">Earnings</th>
        <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; color: #495057;">Amount (INR)</th>
        <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; color: #495057;">Deductions</th>
        <th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; color: #495057;">Amount (INR)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding: 8px; border: 1px solid #dee2e6;">Basic Salary</td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">${formatCurrency(data.basicSalary)}</td><td></td><td></td></tr>
      ${allowancesHtml}
      ${deductionsHtml}
      <tr>
        <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Gross Earnings</strong></td>
        <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;"><strong>${formatCurrency(grossSalary)}</strong></td>
        <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Total Deductions</strong></td>
        <td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;"><strong>${formatCurrency(totalDeductions)}</strong></td>
      </tr>
    </tbody>
  </table>
  
  <div style="text-align: right; margin-top: 10px; padding: 15px; background-color: #e9ecef; border-radius: 4px;">
    <strong style="font-size: 1.1em; color: #343a40;">Net Salary (INR): ${formatCurrency(netSalary)}</strong>
  </div>
  <p style="font-size: 0.75em; color: #6c757d; text-align: center; margin-top: 25px;">This is a system-generated pay slip and does not require a signature. Generated on: ${currentDate}</p>
</div>
  `;
};
