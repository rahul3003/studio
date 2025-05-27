"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, Receipt, FileText, XCircle, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReimbursementForm } from "@/components/reimbursement/reimbursement-form";
import { useReimbursementStore } from "@/store/reimbursementStore"; // Import store
import { useEmployeeStore } from "@/store/employeeStore"; // For employee names
import { useState } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useAuthStore } from "@/store/authStore";
import { useDepartmentStore } from '@/store/departmentStore';
import { useProjectStore } from '@/store/projectStore';
import { Label } from "@/components/ui/label";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const CURRENCY_OPTIONS = ["INR", "USD", "EUR", "GBP", "JPY"];
const REIMBURSEMENT_STATUS_OPTIONS = ["Pending", "Approved", "Rejected", "Paid"];

const statusVariantMap = {
  Pending: "secondary",
  Approved: "default",
  Rejected: "destructive",
  Paid: "outline", 
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - i));

function ClaimFormView({ employee, reimbursements, onClose, departments, employees, selectedEmployee, projects }) {
  console.log('ClaimFormView reimbursements:', reimbursements);
  // Find department and head
  const department = departments?.find(dep => dep.id === employee.departmentId);
  const departmentName = department?.name || '-';
  const departmentHead = employees?.find(emp => emp.id === department?.headId);
  const departmentHeadName = departmentHead ? departmentHead.name : '-';
  const employeeCode = employee.employeeCode || employee.staffCode || '-';

  // Helper to map subCategory to column
  function getColumnAmounts(r) {
    const columns = {
      hardware: 0,
      tools: 0,
      stationery: 0,
      food: 0,
      travel: 0,
      gift: 0,
      others: 0,
    };  
    switch (r.subCategory) {
      case "Hardware/Spares":
        columns.hardware = r.amount || 0;
        break;
      case "Tools and Subscriptions":
        columns.tools = r.amount || 0;
        break;
      case "Stationery and miscellaneous":
        columns.stationery = r.amount || 0;
        break;
      case "Food and beverages":
        columns.food = r.amount || 0;
        break;
      case "Travel and Tool":
        columns.travel = r.amount || 0;
        break;
      case "Gift and entertainment":
        columns.gift = r.amount || 0;
        break;
      default:
        columns.others = r.amount || 0;
    }
    return columns;
  }

  // Calculate totals for each column
  const totalCols = reimbursements.reduce((acc, r) => {
    const col = getColumnAmounts(r);
    Object.keys(acc).forEach(key => acc[key] += col[key]);
    return acc;
  }, { hardware: 0, tools: 0, stationery: 0, food: 0, travel: 0, gift: 0, others: 0 });
  const grandTotal = Object.values(totalCols).reduce((a, b) => a + b, 0);
  // Calculate total advance and balance
  const totalAdvance = reimbursements.reduce((sum, r) => sum + (Number(r.advance) || 0), 0);
  const balance = grandTotal - totalAdvance;

  // CSV Export Handler
  function handleExportCSV() {
    // Table header rows (matching the claim form)
    const headerRow1 = [
      'Date', 'Description of the Work', 'Company', 'Company or Project to be Charged', 'KS',
      'OVERSEA Expenses', '', '',
      'Procurement and tools', '', '', '', '', '',
      'Sales and client expenses', '', '', '', '',
      'For Accounts Dept. Used', 'Total'
    ];
    const headerRow2 = [
      '', '', '', '', '',
      'Cur.', 'Current Amount', 'Exchange Rate',
      'Hardware/Spares', 'Tools and Subscriptions', 'Stationery and miscellaneous', 'Food and beverages', 'Travel and Tool', 'Gift and entertainment', 'Others (Please Specify)',
      'INR', 'INR', 'INR', 'INR', 'INR', '', ''
    ];
    // Table rows
    const rows = reimbursements.map(r => {
      const col = getColumnAmounts(r);
      const rowTotal = Object.values(col).reduce((a, b) => a + b, 0);
      return [
        r.submissionDate ? new Date(r.submissionDate).toLocaleDateString('en-IN') : '',
        r.description || '-',
        r.company || 'Amazon',
        r.project?.name || r.project || '-',
        '', '', '', '',
        col.hardware || 0,
        col.tools || 0,
        col.stationery || 0,
        col.food || 0,
        col.travel || 0,
        col.gift || 0,
        col.others || 0,
        '', '', '', '', '', '',
        rowTotal
      ];
    });
    // Total row (matching the claim form)
    const totalColsArr = [
      'Total', '', '', '', '', '', '', '',
      totalCols.hardware,
      totalCols.tools,
      totalCols.stationery,
      totalCols.food,
      totalCols.travel,
      totalCols.gift,
      totalCols.others,
      '', '', '', '', '', '',
      grandTotal
    ];
    // Add header rows and data rows
    let csvContent = '';
    csvContent += headerRow1.map(cell => `"${cell}"`).join(',') + '\n';
    csvContent += headerRow2.map(cell => `"${cell}"`).join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    csvContent += totalColsArr.map(cell => `"${cell}"`).join(',') + '\n';
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `claim_form_${employee.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // PDF Export Handler
  async function handleExportPDF() {
    const card = document.getElementById('claim-form-card');
    if (!card) return;
    const canvas = await html2canvas(card, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Fit image to page
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    pdf.save(`claim_form_${employee.name.replace(/\s+/g, '_')}.pdf`);
  }

  // Excel Export Handler (SheetJS)
  function handleExportExcel() {
    // --- HEADER/INFO ROWS ---
    const yellowHeader1 = ['PESU VENTURE LABS'];
    const yellowHeader2 = ['CLAIM FORM'];
    // Info section (right-aligned in UI, but in Excel just as extra columns)
    const infoRow1 = [
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Department :', departmentName]
    ;
    const infoRow2 = [
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Department Head :', departmentHeadName]
    ;
    const infoRow3 = [
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Staff Name :', employeeCode]
    ;
    const infoRow4 = [
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Employee Code :', employeeCode]
    ;
    const infoRow5 = [
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Bank Information', '']
    ;
    const infoRow6 = [
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', "Payee's Name :", employee.name]
    ;
    const infoRow7 = [
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Bank Name :', employee.bankName || 'HDFC Bank']
    ;
    const infoRow8 = [
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Bank Accounts No. :', employee.accountNo || 'Account - 0157116003189']
    ;
    // --- TABLE HEADER ROWS ---
    const headerRow1 = [
      'Date', 'Description of the Work', 'Company', 'Company or Project to be Charged', 'KS',
      'OVERSEA Expenses', '', '',
      'Procurement and tools', '', '', '', '', '',
      'Sales and client expenses', '', '', '', '',
      'For Accounts Dept. Used', 'Total'
    ];
    const headerRow2 = [
      '', '', '', '', '',
      'Cur.', 'Current Amount', 'Exchange Rate',
      'Hardware/Spares', 'Tools and Subscriptions', 'Stationery and miscellaneous', 'Food and beverages', 'Travel and Tool', 'Gift and entertainment', 'Others (Please Specify)',
      'INR', 'INR', 'INR', 'INR', 'INR', '', ''
    ];
    // --- DATA ROWS ---
    const rows = reimbursements.map(r => {
      const col = getColumnAmounts(r);
      const rowTotal = Object.values(col).reduce((a, b) => a + b, 0);
      return [
        r.submissionDate ? new Date(r.submissionDate).toLocaleDateString('en-IN') : '',
        r.description || '-',
        r.company || 'Amazon',
        r.project?.name || r.project || '-',
        '', '', '', '',
        col.hardware || 0,
        col.tools || 0,
        col.stationery || 0,
        col.food || 0,
        col.travel || 0,
        col.gift || 0,
        col.others || 0,
        '', '', '', '', '', '',
        rowTotal
      ];
    });
    // --- TOTAL ROW ---
    const totalColsArr = [
      'Total', '', '', '', '', '', '', '',
      totalCols.hardware,
      totalCols.tools,
      totalCols.stationery,
      totalCols.food,
      totalCols.travel,
      totalCols.gift,
      totalCols.others,
      '', '', '', '', '', '',
      grandTotal
    ];
    // --- DEDUCT/BALANCE ROWS ---
    const deductRow = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Deduct : Cash Adv', totalAdvance];
    const balanceRow = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Balance : Due to C', balance];
    const receivedByRow = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Received By :', ''];
    // --- SIGNATURE ROWS ---
    const signatureRow = ['Claimant\'s Signature:', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Approver\'s Signature:'];
    // --- BUILD SHEET DATA ---
    const wsData = [
      yellowHeader1, yellowHeader2,
      infoRow1, infoRow2, infoRow3, infoRow4, infoRow5, infoRow6, infoRow7, infoRow8,
      [], // empty row for spacing
      headerRow1, headerRow2,
      ...rows,
      [], // empty row for spacing
      totalColsArr,
      deductRow,
      balanceRow,
      receivedByRow,
      [],
      signatureRow
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    // --- MERGES ---
    ws['!merges'] = [
      // Yellow header merges
      { s: { r: 0, c: 0 }, e: { r: 0, c: 20 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 20 } },
      // Info section merges (right-aligned)
      { s: { r: 2, c: 0 }, e: { r: 2, c: 18 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 18 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 18 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 18 } },
      { s: { r: 6, c: 0 }, e: { r: 6, c: 18 } },
      { s: { r: 7, c: 0 }, e: { r: 7, c: 18 } },
      { s: { r: 8, c: 0 }, e: { r: 8, c: 18 } },
      { s: { r: 9, c: 0 }, e: { r: 9, c: 18 } },
      // Table header merges (as before)
      { s: { r: 11, c: 5 }, e: { r: 11, c: 7 } },
      { s: { r: 11, c: 8 }, e: { r: 11, c: 13 } },
      { s: { r: 11, c: 14 }, e: { r: 11, c: 18 } },
      { s: { r: 11, c: 0 }, e: { r: 12, c: 0 } },
      { s: { r: 11, c: 1 }, e: { r: 12, c: 1 } },
      { s: { r: 11, c: 2 }, e: { r: 12, c: 2 } },
      { s: { r: 11, c: 3 }, e: { r: 12, c: 3 } },
      { s: { r: 11, c: 4 }, e: { r: 12, c: 4 } },
      { s: { r: 11, c: 19 }, e: { r: 12, c: 19 } },
      { s: { r: 11, c: 20 }, e: { r: 12, c: 20 } },
      // Signature row merges
      { s: { r: wsData.length - 1, c: 0 }, e: { r: wsData.length - 1, c: 9 } },
      { s: { r: wsData.length - 1, c: 10 }, e: { r: wsData.length - 1, c: 20 } },
    ];
    // --- STYLES ---
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 24 }, // Description
      { wch: 16 }, // Company
      { wch: 22 }, // Project
      { wch: 6 },  // KS
      { wch: 10 }, { wch: 14 }, { wch: 14 }, // OVERSEA
      { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, // Procurement
      { wch: 16 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, // Sales
      { wch: 18 }, // For Accounts
      { wch: 12 }  // Total
    ];
    ws['!rows'] = [
      { hpt: 32 }, // Yellow header 1
      { hpt: 24 }, // Yellow header 2
      { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 18 },
      { hpt: 8 }, // spacing
      { hpt: 28 }, { hpt: 24 }, // table headers
    ];
    ws['A1'].s = { font: { bold: true, sz: 20 }, fill: { fgColor: { rgb: 'FFE066' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    ws['A2'].s = { font: { bold: true, sz: 16 }, fill: { fgColor: { rgb: 'FFE066' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    // Info section styles
    for (let r = 2; r <= 9; r++) {
      const cell = XLSX.utils.encode_cell({ r, c: 19 });
      if (ws[cell]) ws[cell].s = { font: { bold: true }, alignment: { horizontal: 'right', vertical: 'center' } };
    }
    // Table header styles
    for (let c = 0; c <= 20; c++) {
      const cell1 = XLSX.utils.encode_cell({ r: 11, c });
      const cell2 = XLSX.utils.encode_cell({ r: 12, c });
      if (ws[cell1]) ws[cell1].s = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' }, border: { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } } };
      if (ws[cell2]) ws[cell2].s = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' }, border: { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } } };
    }
    // Blue total row
    for (let c = 0; c <= 20; c++) {
      const cell = XLSX.utils.encode_cell({ r: 13 + rows.length + 1, c });
      if (ws[cell]) ws[cell].s = { fill: { fgColor: { rgb: 'D9EAFE' } }, font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' } };
    }
    // Deduct/Balance/Received By rows
    const deductRowIdx = 14 + rows.length + 1;
    const balanceRowIdx = deductRowIdx + 1;
    const receivedByRowIdx = balanceRowIdx + 1;
    ws[`T${deductRowIdx + 1}`].s = { font: { bold: true } };
    ws[`T${balanceRowIdx + 1}`].s = { font: { bold: true }, color: { rgb: '008000' } };
    // Signature row
    const sigRowIdx = wsData.length - 1;
    ws[`A${sigRowIdx + 1}`].s = { font: { bold: true, sz: 14 } };
    ws[`K${sigRowIdx + 1}`].s = { font: { bold: true, sz: 14 } };
    // --- EXPORT ---
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Claim Form');
    XLSX.writeFile(wb, `claim_form_${employee.name.replace(/\s+/g, '_')}.xlsx`);
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex flex-col items-center justify-center overflow-auto p-4">
      <Card id="claim-form-card" className="w-full max-w-7xl shadow-2xl border-2 border-black relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
          <Button size="sm" variant="secondary" onClick={handleExportExcel}>Export Excel</Button>
          <Button size="sm" variant="secondary" onClick={handleExportPDF}>Export PDF</Button>
        </div>
        {/* Header */}
        <div className="flex">
          <div className="flex-1">
            <div className="bg-yellow-300 text-center font-bold text-2xl py-2 border-b border-black" style={{ letterSpacing: 1 }}>PESU VENTURE LABS</div>
            <div className="bg-yellow-300 text-center font-bold text-xl py-1 border-b border-black">CLAIM FORM</div>
          </div>
          <div className="flex-1 border-l border-black p-2 text-sm">
            <div className="flex justify-between"><span>Department :</span> <span className="font-bold">{departmentName}</span></div>
            <div className="flex justify-between"><span>Department Head :</span> <span>{departmentHeadName}</span></div>
            <div className="flex justify-between"><span>Staff Name :</span> <span className="font-bold">{employee.name}</span></div>
            <div className="flex justify-between"><span>Employee Code :</span> <span>{employeeCode}</span></div>
            <div className="flex justify-between"><span>Bank Information</span></div>
            <div className="flex justify-between"><span>Payee's Name :</span> <span>{employee.name}</span></div>
            <div className="flex justify-between"><span>Bank Name :</span> <span>{employee.bankName || "HDFC Bank"}</span></div>
            <div className="flex justify-between"><span>Bank Accounts No. :</span> <span>{employee.accountNo || "Account - 0157116003189"}</span></div>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-t border-black" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th className="border border-black px-1 py-1" rowSpan={2}>Date</th>
                <th className="border border-black px-1 py-1" rowSpan={2}>Description of the Work</th>
                <th className="border border-black px-1 py-1" rowSpan={2}>Company</th>
                <th className="border border-black px-1 py-1" rowSpan={2}>Company or Project to be Charged</th>
                <th className="border border-black px-1 py-1" rowSpan={2}>KS</th>
                <th className="border border-black px-1 py-1" colSpan={3}>OVERSEA Expenses</th>
                <th className="border border-black px-1 py-1" colSpan={6}>Procurement and tools</th>
                <th className="border border-black px-1 py-1" colSpan={5}>Sales and client expenses</th>
                <th className="border border-black px-1 py-1" rowSpan={2}>For Accounts Dept. Used</th>
                <th className="border border-black px-1 py-1" rowSpan={2}>Total</th>
              </tr>
              <tr>
                <th className="border border-black px-1 py-1">Cur.</th>
                <th className="border border-black px-1 py-1">Current Amount</th>
                <th className="border border-black px-1 py-1">Exchange Rate</th>
                <th className="border border-black px-1 py-1">Hardware/Spares</th>
                <th className="border border-black px-1 py-1">Tools and Subscriptions</th>
                <th className="border border-black px-1 py-1">Stationery and miscellaneous</th>
                <th className="border border-black px-1 py-1">Food and beverages</th>
                <th className="border border-black px-1 py-1">Travel and Tool</th>
                <th className="border border-black px-1 py-1">Gift and entertainment</th>
                <th className="border border-black px-1 py-1">Others (Please Specify)</th>
                <th className="border border-black px-1 py-1">INR</th>
                <th className="border border-black px-1 py-1">INR</th>
                <th className="border border-black px-1 py-1">INR</th>
                <th className="border border-black px-1 py-1">INR</th>
                <th className="border border-black px-1 py-1">INR</th>
              </tr>
            </thead>
            <tbody>
              {reimbursements.map((r, idx) => {
                // Defensive: project can be object or ID
                let projectName = '-';
                if (typeof r.project === 'object' && r.project !== null) {
                  projectName = r.project.name || '-';
                } else if (typeof r.projectId === 'string' && Array.isArray(projects)) {
                  const proj = projects.find(p => p.id === r.projectId);
                  projectName = proj ? proj.name : '-';
                }
                // Defensive: department can be object or ID
                let departmentName = '-';
                if (typeof r.department === 'object' && r.department !== null) {
                  departmentName = r.department.name || '-';
                } else if (typeof r.departmentId === 'string' && Array.isArray(departments)) {
                  const dep = departments.find(d => d.id === r.departmentId);
                  departmentName = dep ? dep.name : '-';
                }
                // Defensive: payee can be object or ID
                let payeeName = '-';
                if (typeof r.payee === 'object' && r.payee !== null) {
                  payeeName = r.payee.name || '-';
                } else if (typeof r.payee === 'string' && Array.isArray(employees)) {
                  const emp = employees.find(e => e.id === r.payee);
                  payeeName = emp ? emp.name : '-';
                }
                // Defensive: amount
                const amount = r.amount ?? 0;
                // Defensive: subCategory
                const subCategory = r.subCategory || '-';
                // Defensive: description
                const description = r.description || '-';
                // Defensive: vendor
                const vendor = r.vendor || '-';
                // Defensive: date
                const date = r.submissionDate ? new Date(r.submissionDate).toLocaleDateString('en-IN') : '-';
                // Defensive: getColumnAmounts
                const col = getColumnAmounts(r);
                const rowTotal = Object.values(col).reduce((a, b) => a + b, 0);
                return (
                  <tr key={r.id}>
                    <td className="border border-black px-1 py-1">{date}</td>
                    <td className="border border-black px-1 py-1">{description}</td>
                    <td className="border border-black px-1 py-1">{r.company || 'Amazon'}</td>
                    <td className="border border-black px-1 py-1">{projectName}</td>
                    <td className="border border-black px-1 py-1"></td>
                    <td className="border border-black px-1 py-1"></td>
                    <td className="border border-black px-1 py-1"></td>
                    <td className="border border-black px-1 py-1"></td>
                    <td className="border border-black px-1 py-1">{col.hardware ? col.hardware.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "0.00"}</td>
                    <td className="border border-black px-1 py-1">{col.tools ? col.tools.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "0.00"}</td>
                    <td className="border border-black px-1 py-1">{col.stationery ? col.stationery.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "0.00"}</td>
                    <td className="border border-black px-1 py-1">{col.food ? col.food.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "0.00"}</td>
                    <td className="border border-black px-1 py-1">{col.travel ? col.travel.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "0.00"}</td>
                    <td className="border border-black px-1 py-1">{col.gift ? col.gift.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "0.00"}</td>
                    <td className="border border-black px-1 py-1">{col.others ? col.others.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "0.00"}</td>
                    <td className="border border-black px-1 py-1"></td>
                    <td className="border border-black px-1 py-1"></td>
                    <td className="border border-black px-1 py-1"></td>
                    <td className="border border-black px-1 py-1"></td>
                    <td className="border border-black px-1 py-1"></td>
                    <td className="border border-black px-1 py-1"></td>
                    <td className="border border-black px-1 py-1">{rowTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Deduct/Balance section */}
        <div className="flex">
          <div className="flex-1"></div>
          <div className="flex flex-col items-end p-2 text-base font-bold" style={{ minWidth: 300 }}>
            <div className="flex justify-between w-full">
              <span>Deduct : Cash Adv</span>
              <span>INR {totalAdvance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between w-full">
              <span>Balance : Due to C</span>
              <span className="text-green-700">INR {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between w-full"><span>Received By :</span> <span></span></div>
          </div>
        </div>
        {/* Signatures */}
        <div className="flex mt-4">
          <div className="flex-1 font-bold text-lg pl-4">Claimant's Signature:</div>
          <div className="flex-1 font-bold text-lg pl-4">Approver's Signature:</div>
        </div>
      </Card>
    </div>
  );
}

export default function ReimbursementsPage() {
  const { toast } = useToast();
  const  user  = useAuthStore();
  const currentUser = user.user;
  
  // Add error handling for missing current user
  React.useEffect(() => {
    if (!currentUser) {
      console.error("No current user found in reimbursement page");
      toast({
        title: "Authentication Error",
        description: "Please log in to access reimbursements",
        variant: "destructive"
      });
    }
  }, [currentUser, toast]);

  // Use Zustand stores
  const reimbursements = useReimbursementStore((state) => state.reimbursements);
  console.log("reimbursements", reimbursements);
  const addReimbursement = useReimbursementStore((state) => state.addReimbursement);
  const updateReimbursement = useReimbursementStore((state) => state.updateReimbursement);
  const deleteReimbursement = useReimbursementStore((state) => state.deleteReimbursement);
  const initializeReimbursements = useReimbursementStore((state) => state._initializeReimbursements);
  const loading = useReimbursementStore((state) => state.loading);
  const error = useReimbursementStore((state) => state.error);

  const employees = useEmployeeStore((state) => state.employees);
  const MOCK_EMPLOYEES_FOR_REIMBURSEMENT = employees.map(emp => emp.name);

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedReimbursement, setSelectedReimbursement] = React.useState(null);
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(CURRENT_YEAR));
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addMode, setAddMode] = useState("self"); // 'self' or 'onbehalf'
  const [addForEmployee, setAddForEmployee] = useState(employees[0]?.id);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimFormEmployee, setClaimFormEmployee] = useState(null);
  const [claimFormReims, setClaimFormReims] = useState([]);

  const { departments } = useDepartmentStore();
  const { projects } = useProjectStore();

  // Dialog state for new actions
  const [showCommentsDialog, setShowCommentsDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [commentsReimbursement, setCommentsReimbursement] = useState(null);
  const [historyReimbursement, setHistoryReimbursement] = useState(null);
  const [viewReimbursement, setViewReimbursement] = useState(null);

  // Handlers for new actions
  const handleComments = (reimbursement) => {
    setCommentsReimbursement(reimbursement);
    setShowCommentsDialog(true);
  };
  const handleHistory = (reimbursement) => {
    setHistoryReimbursement(reimbursement);
    setShowHistoryDialog(true);
  };
  const handleView = (reimbursement) => {
    setViewReimbursement(reimbursement);
    setShowViewDialog(true);
  };

  // Initialize reimbursements
  React.useEffect(() => {
    if (currentUser) {
      console.log("Initializing reimbursements for user:", currentUser);
      initializeReimbursements();
    }
  }, [currentUser, initializeReimbursements]);

  // Find the default approver (Super Admin preferred, else HR)
  const defaultApprover = employees.find(emp => emp.role === 'SUPER_ADMIN') || employees.find(emp => emp.role === 'HR');

  const handleAddReimbursementOpen = () => {
    setSelectedReimbursement(null);
    setIsAddDialogOpen(true);
  };

  const handleEditReimbursementOpen = (reimbursement) => {
    setSelectedReimbursement(reimbursement);
    setIsEditDialogOpen(true);
  };

  const handleDeleteReimbursementOpen = (reimbursement) => {
    setSelectedReimbursement(reimbursement);
    setIsDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedReimbursement(null);
  };

  const handleSaveReimbursement = async (reimbursementData) => {
    try {
      if (selectedReimbursement && selectedReimbursement.id) {
        // Editing existing reimbursement
        await updateReimbursement({ ...reimbursementData, id: selectedReimbursement.id });
        toast({ title: "Reimbursement Updated", description: `Details for reimbursement ID ${selectedReimbursement.id} have been updated.` });
      } else {
        // Adding new reimbursement
        await addReimbursement(reimbursementData);
        toast({ title: "Reimbursement Added", description: `New reimbursement has been submitted.` });
      }
      handleDialogClose();
    } catch (error) {
      // Show backend error message if available
      let errorMsg = error?.response?.data?.error || error?.message || "Unknown error";
      toast({
        title: "Error Adding Reimbursement",
        description: errorMsg,
        variant: "destructive"
      });
      // Optionally, log the error for debugging
      console.error("Error adding reimbursement:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedReimbursement) {
      await deleteReimbursement(selectedReimbursement.id);
      toast({ title: "Reimbursement Deleted", description: `Reimbursement ID ${selectedReimbursement.id} has been removed.`, variant: "destructive" });
    }
    handleDialogClose();
  };

  // Defensive filtering
  const filteredReimbursements = (reimbursements || []).filter(r => {
    if (!r || !r.submissionDate) return false;
    const date = new Date(r.submissionDate);
    // Defensive: payee can be string or object
    const payeeId = typeof r.payee === 'string' ? r.payee : r.payee?.id;
    const matchesYear = date.getFullYear() === Number(selectedYear);
    const matchesMonth = (date.getMonth() + 1) === Number(selectedMonth);
    const matchesEmployee = selectedEmployee === "all" || payeeId === selectedEmployee;
    return matchesYear && matchesMonth && matchesEmployee;
  });
  console.log("filteredReimbursements", filteredReimbursements);

  // Group by employee
  const employeeTotals = employees.map(emp => {
    const total = filteredReimbursements
      .filter(r => r.appliedBy && r.appliedBy.id === emp.id)
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    return { ...emp, total };
  });

  const [showReport, setShowReport] = useState(false);

  // Group reimbursements by employee for summary
  const summaryByEmployee = React.useMemo(() => {
    if (selectedEmployee !== 'all') return [];
    const map = new Map();
    filteredReimbursements.forEach(r => {
      const emp = employees.find(e => e.id === r.payee);
      if (!emp) return;
      if (!map.has(emp.id)) {
        map.set(emp.id, {
          team: emp.department || '-',
          name: emp.name || '-',
          invoiceAmount: 0,
          tds: 0,
          netPayable: 0,
          descriptions: [],
          beneficiary: emp.name || '-',
          bank: emp.bankName || '-',
          account: emp.accountNo || '-',
          ifsc: emp.ifsc || '-',
        });
      }
      const entry = map.get(emp.id);
      const amount = r.amount || 0;
      const tds = r.tds || 0;
      entry.invoiceAmount += amount;
      entry.tds += tds;
      entry.netPayable += (amount - tds);
      if (r.description) entry.descriptions.push(r.description);
    });
    return Array.from(map.values());
  }, [filteredReimbursements, employees, selectedEmployee]);

  // Summary Excel Export Handler (for All Employees)
  function handleExportSummaryExcel() {
    // Header rows
    const yellowHeader1 = ['PESU VENTURE LABS.'];
    const yellowHeader2 = ['Bills Reimbursement ' + MONTHS[Number(selectedMonth) - 1] + '- ' + selectedYear];
    // Table headers
    const headerRow = ['Sl No', 'Team', 'Name', 'Invoice Amount', 'TDS', 'Net Payable', 'Description', 'Beneficiary name', 'Bank', 'Account Number', 'IFSC'];
    // Data rows (grouped by employee)
    let slNo = 1;
    let totalInvoice = 0, totalTDS = 0, totalNet = 0;
    const rows = summaryByEmployee.map((row) => {
      totalInvoice += row.invoiceAmount;
      totalTDS += row.tds;
      totalNet += row.netPayable;
      return [
        slNo++,
        row.team,
        row.name,
        row.invoiceAmount,
        row.tds,
        row.netPayable,
        row.descriptions.join(', '),
        row.beneficiary,
        row.bank,
        row.account,
        row.ifsc,
      ];
    });
    // Total row
    const totalRow = ['Total', '', '', totalInvoice, totalTDS, totalNet, '', '', '', '', ''];
    // Build worksheet data
    const wsData = [
      yellowHeader1,
      yellowHeader2,
      [],
      headerRow,
      ...rows,
      totalRow
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    // Merges for headers
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
    ];
    // Styles
    ws['!cols'] = [
      { wch: 8 }, { wch: 10 }, { wch: 22 }, { wch: 16 }, { wch: 10 }, { wch: 16 }, { wch: 28 }, { wch: 22 }, { wch: 16 }, { wch: 20 }, { wch: 16 }
    ];
    ws['A1'].s = { font: { bold: true, sz: 18 }, fill: { fgColor: { rgb: 'FFE066' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    ws['A2'].s = { font: { bold: true, sz: 14 }, fill: { fgColor: { rgb: 'FFE066' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    for (let c = 0; c <= 10; c++) {
      const cell = XLSX.utils.encode_cell({ r: 3, c });
      if (ws[cell]) ws[cell].s = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' }, border: { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } } };
    }
    // Total row style
    for (let c = 0; c <= 10; c++) {
      const cell = XLSX.utils.encode_cell({ r: 4 + rows.length, c });
      if (ws[cell]) ws[cell].s = { font: { bold: true }, fill: { fgColor: { rgb: 'D9EAFE' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    }
    // Export
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Summary');
    XLSX.writeFile(wb, `reimbursement_summary_${selectedMonth}_${selectedYear}.xlsx`);
  }

  if (!employees || !departments || !projects) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="space-y-6">
      {!currentUser ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-red-500">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access reimbursements</p>
        </div>
      ) : (
        <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Manage Reimbursements</CardTitle>
            </div>
            <CardDescription>
              View, add, edit, and manage employee expense reimbursements.
            </CardDescription>
          </div>
              <Button onClick={() => setShowAddDialog(true)} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" />
                Add Reimbursement
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <Label htmlFor="month-select">Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="month-select" className="w-[120px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, idx) => (
                    <SelectItem key={m} value={String(idx + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year-select">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year-select" className="w-[100px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="employee-select">Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger id="employee-select" className="w-[180px]">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Payee</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Main Category</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Advance</TableHead>
                  <TableHead>Approver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReimbursements
                  .slice()
                  .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
                  .map((reimbursement) => {
                    if (!reimbursement || !reimbursement.id) return null;
                    const payee = employees.find(emp => emp && emp.id && emp.id === (typeof reimbursement.payee === 'string' ? reimbursement.payee : reimbursement.payee?.id));
                    const approver = employees.find(emp => emp && emp.id && emp.id === reimbursement.approverId);
                    const department = departments.find(dep => dep && dep.id && dep.id === reimbursement.departmentId);
                    const project = projects.find(proj => proj && proj.id && proj.id === reimbursement.projectId);
                    return (
                      <TableRow key={reimbursement.id}>
                        <TableCell>{reimbursement.id}</TableCell>
                        <TableCell>{payee ? payee.name : "-"}</TableCell>
                        <TableCell>{reimbursement.amount}</TableCell>
                        <TableCell>{department ? department.name : "-"}</TableCell>
                        <TableCell>{project ? project.name : "-"}</TableCell>
                        <TableCell>{reimbursement.mainCategory}</TableCell>
                        <TableCell>{reimbursement.subCategory}</TableCell>
                        <TableCell className="max-w-xs truncate" title={reimbursement.description}>{reimbursement.description}</TableCell>
                        <TableCell>{reimbursement.vendor}</TableCell>
                        <TableCell>{reimbursement.advance}</TableCell>
                        <TableCell>{approver ? approver.name : "-"}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariantMap[reimbursement.status] || "outline"}>
                            {reimbursement.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {reimbursement.submissionDate
                            ? new Date(reimbursement.submissionDate).toLocaleDateString("en-IN")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {reimbursement.fileName ? (
                            <a 
                              href={reimbursement.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              <FileText className="h-4 w-4" />
                              {reimbursement.fileName}
                            </a>
                          ) : "No file"}
                        </TableCell>
                        <TableCell>{
                          Array.isArray(reimbursement.comments)
                            ? (reimbursement.comments.length > 0 ? `${reimbursement.comments.length} comment(s)` : '-')
                            : (reimbursement.comments || '-')
                        }</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreVertical /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleComments(reimbursement)}>Comments</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleHistory(reimbursement)}>History</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditReimbursementOpen(reimbursement)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleView(reimbursement)}>View</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteReimbursementOpen(reimbursement)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
          {filteredReimbursements.length === 0 && (
            <div className="py-10 text-center text-muted-foreground">
              No reimbursements found. Click "Add Reimbursement" to get started.
            </div>
          )}
        </CardContent>
      </Card>

          {showClaimForm && claimFormEmployee && (
            <ClaimFormView
              employee={claimFormEmployee}
              reimbursements={claimFormReims}
              onClose={() => setShowClaimForm(false)}
              departments={departments}
              employees={employees}
              selectedEmployee={selectedEmployee}
              projects={projects}
            />
          )}

      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedReimbursement ? "Edit Reimbursement" : "Add New Reimbursement"}</DialogTitle>
            <DialogDescription>
              {selectedReimbursement ? "Update the details of the reimbursement claim." : "Fill in the details to submit a new reimbursement claim."}
            </DialogDescription>
          </DialogHeader>
              <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
                <ReimbursementForm
                  onSubmit={handleSaveReimbursement}
                  initialData={selectedReimbursement}
                  onCancel={handleDialogClose}
                  employeeList={employees}
                  currentUser={currentUser}
                  currencyOptions={CURRENCY_OPTIONS}
                  statusOptions={REIMBURSEMENT_STATUS_OPTIONS}
                  defaultApproverId={defaultApprover?.id}
                />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this reimbursement claim?</AlertDialogTitle>
            <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the claim with ID:{" "}
              <strong>{selectedReimbursement?.id}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDialogClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogContent className="sm:max-w-lg md:max-w-2xl">
          <DialogHeader>
                <DialogTitle>Add Reimbursement</DialogTitle>
          </DialogHeader>
              <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
                <ReimbursementForm
                  onSubmit={handleSaveReimbursement}
                  initialData={selectedReimbursement}
                  onCancel={handleDialogClose}
                  employeeList={employees}
                  currentUser={currentUser}
                  currencyOptions={CURRENCY_OPTIONS}
                  statusOptions={REIMBURSEMENT_STATUS_OPTIONS}
                  defaultApproverId={defaultApprover?.id}
                />
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={showCommentsDialog} onOpenChange={setShowCommentsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div>Comments for reimbursement ID: {commentsReimbursement?.id}</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {(commentsReimbursement?.comments || []).length === 0 && (
                <div className="text-muted-foreground">No comments yet.</div>
              )}
              {(commentsReimbursement?.comments || []).map((c, idx) => (
                typeof c === 'object' && c !== null ? (
                  <div key={idx} className="border rounded p-2 text-sm">
                    <div className="font-semibold">{c.user || "Unknown"} <span className="text-xs text-muted-foreground">{c.date ? new Date(c.date).toLocaleString() : ''}</span></div>
                    <div>{c.text}</div>
                  </div>
                ) : null
              ))}
            </div>
            <AddCommentSection reimbursement={commentsReimbursement} currentUser={currentUser} />
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>History</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
            <div>History for reimbursement ID: {historyReimbursement?.id}</div>
            {(historyReimbursement?.history || []).length === 0 && (
              <div className="text-muted-foreground">No history yet.</div>
            )}
            {(historyReimbursement?.history || []).map((h, idx) => (
              <div key={idx} className="border-l-4 border-primary pl-2 mb-2">
                <div className="font-semibold">{h.action} <span className="text-xs text-muted-foreground">{new Date(h.date).toLocaleString()}</span></div>
                <div className="text-xs">{h.user || "Unknown"}</div>
                <div className="text-sm">{h.details}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reimbursement Details</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {/* TODO: Show all details for viewReimbursement */}
            <div>Details for reimbursement ID: {viewReimbursement?.id}</div>
            <div className="text-muted-foreground">(Implement view UI here)</div>
          </div>
        </DialogContent>
      </Dialog>

      <Button onClick={() => setShowReport(true)} className="mt-4">
        Generate Report
      </Button>

      {showReport && (
        <Dialog open={showReport} onOpenChange={setShowReport}>
          <DialogContent className="w-screen max-w-none h-screen p-0 flex items-center justify-center bg-black/70">
            <DialogHeader>
              <DialogTitle>Report</DialogTitle>
            </DialogHeader>
            <div className="w-full h-full flex items-center justify-center">
              <Card className="w-full max-w-7xl h-[90vh] bg-white shadow-2xl border-2 border-black overflow-auto p-4">
                <ClaimFormView
                  employee={employees.find(e => e.id === selectedEmployee) || employees[0]}
                  reimbursements={filteredReimbursements}
                  onClose={() => setShowReport(false)}
                  departments={departments}
                  employees={employees}
                  selectedEmployee={selectedEmployee}
                  projects={projects}
                />
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Show summary table in UI when All Employees is selected */}
      {selectedEmployee === 'all' && summaryByEmployee.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex flex-col gap-y-2 md:flex-row md:items-center md:justify-between">
            <CardTitle>Reimbursement Summary (All Employees)</CardTitle>
            <Button onClick={handleExportSummaryExcel} variant="secondary">
              <FileText className="mr-2 h-4 w-4" />
              Export Summary Excel
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Invoice Amount</TableHead>
                    <TableHead>TDS</TableHead>
                    <TableHead>Net Payable</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Beneficiary name</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>IFSC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryByEmployee.map((row, idx) => (
                    <TableRow key={row.name + row.account}>
                      <TableCell>{row.team}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.invoiceAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{row.tds.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{row.netPayable.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{row.descriptions.join(', ')}</TableCell>
                      <TableCell>{row.beneficiary}</TableCell>
                      <TableCell>{row.bank}</TableCell>
                      <TableCell>{row.account}</TableCell>
                      <TableCell>{row.ifsc}</TableCell>
                    </TableRow>
                  ))}
                  {/* Total row */}
                  <TableRow className="bg-blue-100 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell></TableCell>
                    <TableCell>{summaryByEmployee.reduce((a, b) => a + b.invoiceAmount, 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell>{summaryByEmployee.reduce((a, b) => a + b.tds, 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell>{summaryByEmployee.reduce((a, b) => a + b.netPayable, 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  );
}

function AddCommentSection({ reimbursement, currentUser }) {
  const [comment, setComment] = React.useState("");
  const addComment = useReimbursementStore((state) => state.addComment);
  if (!reimbursement || !currentUser) return null;
  return (
    <form
      className="flex gap-2"
      onSubmit={async e => {
        e.preventDefault();
        if (comment.trim()) {
          await addComment(reimbursement.id, comment, currentUser.name);
          setComment("");
        }
      }}
    >
      <input
        className="border rounded px-2 py-1 flex-1"
        placeholder="Add a comment..."
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <button type="submit" className="bg-primary text-white px-3 py-1 rounded">Add</button>
    </form>
  );
}
