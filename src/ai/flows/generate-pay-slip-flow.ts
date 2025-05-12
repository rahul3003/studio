
'use server';
/**
 * @fileOverview Generates a professional pay slip using AI.
 *
 * - generatePaySlip - A function that invokes the pay slip generation flow.
 * - GeneratePaySlipInput - The input type for the pay slip generation.
 * - GeneratePaySlipOutput - The return type for the pay slip generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
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
  allowancesStr: z.string().optional().describe('List of allowances, each on a new line, e.g., "Housing Allowance: 500\\nTravel Allowance: 200".'),
  deductionsStr: z.string().optional().describe('List of deductions, each on a new line, e.g., "Income Tax: 300\\nProvident Fund: 150".'),
  companyName: z.string().describe('Name of the company.'),
  companyAddress: z.string().optional().describe('Address of the company.'),
  companyLogoUrl: z.string().url().optional().describe('URL to the company logo. Use placeholder if not provided.'),
});
export type GeneratePaySlipInput = z.infer<typeof GeneratePaySlipInputSchema>;

const GeneratePaySlipOutputSchema = z.object({
  paySlipHtml: z.string().describe('The full HTML text of the generated pay slip.'),
});
export type GeneratePaySlipOutput = z.infer<typeof GeneratePaySlipOutputSchema>;

// Helper function to format currency
const formatCurrencyLocal = (num: number | undefined): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0.00';
  }
  return num.toFixed(2);
};

// Helper function to parse pay items
const parsePayItemsLocal = (str: string | undefined): Array<{ name: string; amountStr: string }> => {
  if (!str) return [];
  return str.split('\n').map(line => {
    const parts = line.split(':');
    if (parts.length === 2) {
      const name = parts[0].trim();
      const amount = parseFloat(parts[1].trim());
      return { name, amountStr: formatCurrencyLocal(isNaN(amount) ? 0 : amount) };
    }
    return null;
  }).filter((item): item is { name: string; amountStr: string } => item !== null && item.name !== "");
};

// Define the schema for the enriched input that the prompt and flow will use
const EnrichedGeneratePaySlipInputSchema = GeneratePaySlipInputSchema.extend({ 
  currentDate: z.string(),
  basicSalaryStr: z.string(),
  grossSalaryStr: z.string(),
  totalAllowancesStrDisplay: z.string(),
  totalDeductionsStrDisplay: z.string(),
  netSalaryStr: z.string(),
  parsedAllowances: z.array(z.object({ name: z.string(), amountStr: z.string() })),
  parsedDeductions: z.array(z.object({ name: z.string(), amountStr: z.string() })),
});
type EnrichedGeneratePaySlipInput = z.infer<typeof EnrichedGeneratePaySlipInputSchema>;


export async function generatePaySlip(input: GeneratePaySlipInput): Promise<GeneratePaySlipOutput> {
  let totalAllowancesNum = 0;
  if (input.allowancesStr) {
    input.allowancesStr.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length === 2) {
            const amount = parseFloat(parts[1].trim());
            if (!isNaN(amount)) totalAllowancesNum += amount;
        }
    });
  }
  const parsedAllowances = parsePayItemsLocal(input.allowancesStr);

  let totalDeductionsNum = 0;
   if (input.deductionsStr) {
    input.deductionsStr.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length === 2) {
            const amount = parseFloat(parts[1].trim());
            if (!isNaN(amount)) totalDeductionsNum += amount;
        }
    });
  }
  const parsedDeductions = parsePayItemsLocal(input.deductionsStr);
  
  const grossSalaryNum = input.basicSalary + totalAllowancesNum;
  const netSalaryNum = grossSalaryNum - totalDeductionsNum;

  const enrichedInput: EnrichedGeneratePaySlipInput = {
    ...input,
    currentDate: format(new Date(), "MMMM d, yyyy"),
    basicSalaryStr: formatCurrencyLocal(input.basicSalary),
    grossSalaryStr: formatCurrencyLocal(grossSalaryNum),
    totalAllowancesStrDisplay: formatCurrencyLocal(totalAllowancesNum),
    totalDeductionsStrDisplay: formatCurrencyLocal(totalDeductionsNum),
    netSalaryStr: formatCurrencyLocal(netSalaryNum),
    parsedAllowances: parsedAllowances,
    parsedDeductions: parsedDeductions,
    companyLogoUrl: input.companyLogoUrl || `https://www.pesuventurelabs.com/static/media/PVL%20Logo.9cc047dd.png`, 
    companyAddress: input.companyAddress || "PESU Venture Labs, PES University, 100 Feet Ring Road, Banashankari Stage III, Bengaluru, Karnataka 560085",
  };
  return generatePaySlipFlow(enrichedInput);
}

const generatePaySlipPrompt = ai.definePrompt({
  name: 'generatePaySlipPrompt',
  input: { schema: EnrichedGeneratePaySlipInputSchema },
  output: { schema: GeneratePaySlipOutputSchema },
  prompt: `You are an expert HR assistant tasked with generating a Pay Slip for PESU Venture Labs as an HTML document string.
The pay slip should be clear, professional, and easy to read. All monetary values are pre-formatted strings representing INR amounts.
Use a base font size of 12px for the document. Table text can be slightly smaller (e.g., 0.9em of 12px).

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

Basic Salary: {{{basicSalaryStr}}}
Allowances (Parsed): {{#each parsedAllowances}}{{{this.name}}}: {{{this.amountStr}}}; {{/each}}
Deductions (Parsed): {{#each parsedDeductions}}{{{this.name}}}: {{{this.amountStr}}}; {{/each}}

Calculated Gross Salary: {{{grossSalaryStr}}}
Calculated Total Allowances: {{{totalAllowancesStrDisplay}}}
Calculated Total Deductions: {{{totalDeductionsStrDisplay}}}
Calculated Net Salary: {{{netSalaryStr}}}


**Instructions for the HTML Pay Slip:**
1.  **Overall Structure:**
    *   Wrap in \`<div class="payslip-container" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 700px; margin: 20px auto; padding: 25px; border: 1px solid #dee2e6; border-radius: 6px; box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075); background-color: #fff; font-size: 12px;">\`
2.  **Header Section:**
    *   Company Logo: \`<img src="{{{companyLogoUrl}}}" alt="{{{companyName}}} Logo" style="max-height: 60px; margin-bottom: 15px; display: block;" data-ai-hint="PESU Venture Labs logo"/>\`
    *   Company Name: \`<h1 style="font-size: 1.5em; color: #343a40; margin-bottom: 3px;">{{{companyName}}}</h1>\` (Relative to 12px base)
    *   Company Address: \`<p style="font-size: 0.85em; color: #6c757d; margin-bottom: 15px;">{{{companyAddress}}}</p>\` (Relative to 12px)
    *   Pay Slip Title: \`<h2 style="font-size: 1.3em; text-align: center; color: #495057; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ced4da;">Pay Slip</h2>\` (Relative to 12px)
    *   Pay Period & Payment Date: \`<p style="font-size: 0.9em; text-align: center; color: #6c757d; margin-bottom: 20px;">For the period: <strong>{{{payPeriodStartDate}}} to {{{payPeriodEndDate}}}</strong> | Payment Date: <strong>{{{paymentDate}}}</strong></p>\` (Relative to 12px)
3.  **Employee Details Section:** Use a two-column layout. Text here will be 12px.
    *   \`<div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 4px;">\`
    *   Left Column: Employee Name, Employee ID
    *   Right Column: Department, Position
    *   Example Item: \`<p style="font-size: 0.9em; margin: 3px 0;"><span style="color: #6c757d;">Employee Name:</span> <strong style="color: #343a40;">{{{employeeName}}}</strong></p>\` (Relative to 12px)
4.  **Earnings and Deductions Table:** Use HTML \`<table>\`. Table text should be about 0.9em of the base 12px.
    *   \`<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9em;">\`
    *   Table Header: \`<thead style="background-color: #e9ecef;"><tr><th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; color: #495057;">Earnings</th><th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; color: #495057;">Amount (INR)</th><th style="padding: 8px; border: 1px solid #dee2e6; text-align: left; color: #495057;">Deductions</th><th style="padding: 8px; border: 1px solid #dee2e6; text-align: right; color: #495057;">Amount (INR)</th></tr></thead>\`
    *   Table Body:
        *   Row for Basic Salary: \`<tr><td style="padding: 8px; border: 1px solid #dee2e6;">Basic Salary</td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">{{{basicSalaryStr}}}</td><td></td><td></td></tr>\`
        *   Dynamically list allowances using \`parsedAllowances\`:
            \`{{#each parsedAllowances}}\`
            \`<tr><td style="padding: 8px; border: 1px solid #dee2e6;">{{{this.name}}}</td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">{{{this.amountStr}}}</td><td></td><td></td></tr>\`
            \`{{/each}}\`
        *   Dynamically list deductions using \`parsedDeductions\`:
            \`{{#each parsedDeductions}}\`
            \`<tr><td></td><td></td><td style="padding: 8px; border: 1px solid #dee2e6;">{{{this.name}}}</td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;">{{{this.amountStr}}}</td></tr>\`
            \`{{/each}}\`
        *   Total Row: \`<tr><td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Gross Earnings</strong></td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;"><strong>{{{grossSalaryStr}}}</strong></td><td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Total Deductions</strong></td><td style="padding: 8px; border: 1px solid #dee2e6; text-align: right;"><strong>{{{totalDeductionsStrDisplay}}}</strong></td></tr>\`
    *   \`</table>\`
5.  **Net Pay Section:**
    *   \`<div style="text-align: right; margin-top: 10px; padding: 15px; background-color: #e9ecef; border-radius: 4px;">\`
    *   \`<strong style="font-size: 1.1em; color: #343a40;">Net Salary (INR): {{{netSalaryStr}}}</strong>\` (Relative to 12px)
    *   \`</div>\`
6.  **Footer:**
    *   \`<p style="font-size: 0.75em; color: #6c757d; text-align: center; margin-top: 25px;">This is a system-generated pay slip and does not require a signature. Generated on: {{{currentDate}}}</p>\` (Relative to 12px)
7.  **Content Focus:** Generate **only the HTML string** for the pay slip, starting with the outer \`<div>\`.

The final output must be a single, complete HTML string.
`,
});

const generatePaySlipFlow = ai.defineFlow(
  {
    name: 'generatePaySlipFlow',
    inputSchema: EnrichedGeneratePaySlipInputSchema,
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
