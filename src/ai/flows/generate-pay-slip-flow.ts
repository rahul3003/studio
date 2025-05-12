
'use server';
/**
 * @fileOverview Generates a professional pay slip using AI.
 *
 * - generatePaySlip - A function that invokes the pay slip generation flow.
 * - GeneratePaySlipInput - The input type for the pay slip generation.
 * - GeneratePaySlipOutput - The return type for the pay slip generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod'; // Corrected: import z from zod
import { handlebars } from 'genkit/handlebars'; // Reverted to specific import for handlebars
import { format } from 'date-fns';

const PayItemSchema = z.object({
  name: z.string().describe('Name of the earning or deduction item.'),
  amount: z.number().describe('Amount of the earning or deduction item.'),
});

const GeneratePaySlipInputSchema = z.object({
  employeeName: z.string().describe('Full name of the employee.'),
  employeeId: z.string().describe('Employee identification number.'),
  employeeEmail: z.string().email().describe("The employee's email address (for sending the document)."),
  department: z.string().describe('Department of the employee.'),
  positionTitle: z.string().describe('Job title of the employee.'),
  payPeriodStartDate: z.string().describe("Start date of the pay period, formatted as 'MMMM d, yyyy'."),
  payPeriodEndDate: z.string().describe("End date of the pay period, formatted as 'MMMM d, yyyy'."),
  paymentDate: z.string().describe("Date of payment, formatted as 'MMMM d, yyyy'."),
  basicSalary: z.number().describe('Basic salary for the period.'),
  // For simplicity, allowances and deductions are strings. AI will parse lines.
  // A more robust solution would use z.array(PayItemSchema).
  allowancesStr: z.string().optional().describe('List of allowances, each on a new line, e.g., "Housing Allowance: 500\\nTravel Allowance: 200". The AI should parse this into table rows.'),
  deductionsStr: z.string().optional().describe('List of deductions, each on a new line, e.g., "Income Tax: 300\\nProvident Fund: 150". The AI should parse this into table rows.'),
  companyName: z.string().describe('Name of the company.'),
  companyAddress: z.string().optional().describe('Address of the company.'),
  companyLogoUrl: z.string().url().optional().describe('URL to the company logo. Use placeholder if not provided.'),
});
export type GeneratePaySlipInput = z.infer<typeof GeneratePaySlipInputSchema>;

const GeneratePaySlipOutputSchema = z.object({
  paySlipHtml: z.string().describe('The full HTML text of the generated pay slip.'),
});
export type GeneratePaySlipOutput = z.infer<typeof GeneratePaySlipOutputSchema>;

export async function generatePaySlip(input: GeneratePaySlipInput): Promise<GeneratePaySlipOutput> {
  // Calculate total allowances, total deductions, and net salary before sending to prompt
  // This is a simplified calculation. Real-world scenarios are more complex.
  let totalAllowances = 0;
  if (input.allowancesStr) {
    input.allowancesStr.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length === 2) {
        const amount = parseFloat(parts[1].trim());
        if (!isNaN(amount)) totalAllowances += amount;
      }
    });
  }

  let totalDeductions = 0;
  if (input.deductionsStr) {
    input.deductionsStr.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length === 2) {
        const amount = parseFloat(parts[1].trim());
        if (!isNaN(amount)) totalDeductions += amount;
      }
    });
  }
  
  const grossSalary = input.basicSalary + totalAllowances;
  const netSalary = grossSalary - totalDeductions;

  const enrichedInput = {
    ...input,
    currentDate: format(new Date(), "MMMM d, yyyy"),
    grossSalary,
    totalAllowances,
    totalDeductions,
    netSalary,
    companyLogoUrl: input.companyLogoUrl || `https://picsum.photos/150/50?random&t=${Date.now()}` // Ensure unique placeholder
  };
  return generatePaySlipFlow(enrichedInput);
}

const generatePaySlipPrompt = ai.definePrompt({
  name: 'generatePaySlipPrompt',
  input: { schema: GeneratePaySlipInputSchema.extend({ 
    currentDate: z.string(),
    grossSalary: z.number(),
    totalAllowances: z.number(),
    totalDeductions: z.number(),
    netSalary: z.number(),
  }) },
  output: { schema: GeneratePaySlipOutputSchema },
  prompt: `You are an expert HR assistant tasked with generating a Pay Slip as an HTML document string.
The pay slip should be clear, professional, and easy to read, with all monetary values formatted to two decimal places.

**Pay Slip Details:**
Company Name: {{{companyName}}}
Company Address: {{{companyAddress}}}
Company Logo URL: {{{companyLogoUrl}}}
Pay Slip for the period: {{{payPeriodStartDate}}} - {{{payPeriodEndDate}}}
Date of Payment: {{{paymentDate}}}
Generated on: {{{currentDate}}}

Employee Name: {{{employeeName}}}
Employee ID: {{{employeeId}}}
Department: {{{department}}}
Position: {{{positionTitle}}}

Basic Salary: {{{basicSalary}}}
Allowances (String format): {{{allowancesStr}}}
Deductions (String format): {{{deductionsStr}}}

Calculated Gross Salary: {{{grossSalary}}}
Calculated Total Allowances: {{{totalAllowances}}}
Calculated Total Deductions: {{{totalDeductions}}}
Calculated Net Salary: {{{netSalary}}}


**Instructions for the HTML Pay Slip:**
1.  **Overall Structure:**
    *   Wrap in \`<div class="payslip-container" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 700px; margin: 20px auto; padding: 25px; border: 1px solid #dee2e6; border-radius: 6px; box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075); background-color: #fff;">\`
2.  **Header Section:**
    *   Company Logo: \`<img src="{{{companyLogoUrl}}}" alt="Company Logo" style="max-height: 60px; margin-bottom: 15px; display: block;" data-ai-hint="company logo"/>\`
    *   Company Name: \`<h1 style="font-size: 1.6em; color: #343a40; margin-bottom: 3px;">{{{companyName}}}</h1>\`
    *   Company Address: \`<p style="font-size: 0.85em; color: #6c757d; margin-bottom: 15px;">{{{companyAddress}}}</p>\`
    *   Pay Slip Title: \`<h2 style="font-size: 1.3em; text-align: center; color: #495057; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ced4da;">Pay Slip</h2>\`
    *   Pay Period & Payment Date: \`<p style="font-size: 0.9em; text-align: center; color: #6c757d; margin-bottom: 20px;">For the period: <strong>{{{payPeriodStartDate}}} to {{{payPeriodEndDate}}}</strong> | Payment Date: <strong>{{{paymentDate}}}</strong></p>\`
3.  **Employee Details Section:** Use a two-column layout (e.g., using flexbox or a simple table).
    *   \`<div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 4px;">\`
    *   Left Column: Employee Name, Employee ID
    *   Right Column: Department, Position
    *   Example Item: \`<p style="font-size: 0.9em; margin: 3px 0;"><span style="color: #6c757d;">Employee Name:</span> <strong style="color: #343a40;">{{{employeeName}}}</strong></p>\`
4.  **Earnings and Deductions Table:** Use HTML \`<table>\` for clarity.
    *   \`<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9em;">\`
    *   Table Header: \`<thead style="background-color: #e9ecef;"><tr><th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; color: #495057;">Earnings</th><th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; color: #495057;">Amount (USD)</th><th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; color: #495057;">Deductions</th><th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; color: #495057;">Amount (USD)</th></tr></thead>\`
    *   Table Body:
        *   Row for Basic Salary: \`<tr><td style="padding: 8px; border: 1px solid #dee2e6;">Basic Salary</td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">{{formatCurrency basicSalary}}</td><td></td><td></td></tr>\`
        *   Dynamically parse \`{{{allowancesStr}}}\` and \`{{{deductionsStr}}}\`. Each line like "Name: Amount" should become a table row.
            Example for allowances, using the 'parsePayItems' helper that returns an array of {name, amount} objects:
            \`{{#each (parsePayItems allowancesStr) as |item|}}\`
            \`<tr><td style="padding: 8px; border: 1px solid #dee2e6;">{{{item.name}}}</td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">{{formatCurrency item.amount}}</td><td></td><td></td></tr>\`
            \`{{/each}}\`
            Example for deductions:
            \`{{#each (parsePayItems deductionsStr) as |item|}}\`
            \`<tr><td></td><td></td><td style="padding: 8px; border: 1px solid #dee2e6;">{{{item.name}}}</td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">{{formatCurrency item.amount}}</td></tr>\`
            \`{{/each}}\`
            Ensure that if one side (earnings/deductions) has more items, the other side has corresponding empty cells to maintain table structure. You might need to iterate a combined list or use conditional rendering for this.
            The provided examples above will list all earnings first, then all deductions.
        *   Total Row: \`<tr><td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Gross Earnings</strong></td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;"><strong>{{formatCurrency grossSalary}}</strong></td><td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Total Deductions</strong></td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;"><strong>{{formatCurrency totalDeductions}}</strong></td></tr>\`
    *   \`</table>\`
5.  **Net Pay Section:**
    *   \`<div style="text-align: right; margin-top: 10px; padding: 15px; background-color: #e9ecef; border-radius: 4px;">\`
    *   \`<strong style="font-size: 1.1em; color: #343a40;">Net Salary: {{formatCurrency netSalary}}</strong>\`
    *   \`</div>\`
6.  **Footer:**
    *   \`<p style="font-size: 0.75em; color: #6c757d; text-align: center; margin-top: 25px;">This is a system-generated pay slip and does not require a signature. Generated on: {{{currentDate}}}</p>\`
7.  **Monetary Formatting:** All monetary values MUST be formatted to two decimal places using the 'formatCurrency' helper.
8.  **Content Focus:** Generate **only the HTML string** for the pay slip, starting with the outer \`<div>\`.

The final output must be a single, complete HTML string.
`,
  customizers: [
    handlebars.helpers({
      formatCurrency: (num) => (typeof num === 'number' ? num.toFixed(2) : '0.00'),
      parsePayItems: (str) => {
        if (!str) return [];
        return str.split('\n').map(line => {
          const parts = line.split(':');
          if (parts.length === 2) {
            const name = parts[0].trim();
            const amount = parseFloat(parts[1].trim());
            return { name, amount: isNaN(amount) ? 0 : amount };
          }
          return null;
        }).filter(item => item !== null && item.name !== ""); // Ensure item and name are valid
      },
    })
  ]
});

const generatePaySlipFlow = ai.defineFlow(
  {
    name: 'generatePaySlipFlow',
    inputSchema: GeneratePaySlipInputSchema.extend({ 
      currentDate: z.string(),
      grossSalary: z.number(),
      totalAllowances: z.number(),
      totalDeductions: z.number(),
      netSalary: z.number(),
    }),
    outputSchema: GeneratePaySlipOutputSchema,
  },
  async (input) => {
    const { output } = await generatePaySlipPrompt(input);
    if (!output || !output.paySlipHtml) {
      throw new Error("AI failed to generate a pay slip or returned empty content.");
    }
    return { paySlipHtml: output.paySlipHtml };
  }
);

