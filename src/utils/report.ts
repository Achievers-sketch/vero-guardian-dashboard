import { jsPDF } from 'jspdf';

export interface AuditData {
  hash: string;
  title: string;
  author: string;
  url: string;
  isMatch: boolean;
  generatedAt: Date;
}

const sanitizeString = (str: string | null | undefined): string => {
  if (!str) return '';
  return str
    .replace(/[^\x20-\x7E\n\r\t]/g, '')
    .trim();
};

export const generateAuditPDF = (auditData: AuditData): void => {
  const doc = new jsPDF();
  
  const sanitizedTitle = sanitizeString(auditData.title);
  const sanitizedAuthor = sanitizeString(auditData.author);
  const sanitizedUrl = sanitizeString(auditData.url);
  const sanitizedHash = sanitizeString(auditData.hash);
  const dateStr = auditData.generatedAt.toLocaleString();

  doc.setFontSize(20);
  doc.text('Vero Guardian - Audit Report', 20, 25);

  doc.setFontSize(12);
  doc.text(`Generated on: ${dateStr}`, 20, 35);

  doc.setFontSize(14);
  doc.text('Audit Details', 20, 50);

  doc.setFontSize(12);
  doc.text(`Title: ${sanitizedTitle}`, 20, 60);
  doc.text(`Author: ${sanitizedAuthor}`, 20, 70);
  doc.text(`URL: ${sanitizedUrl}`, 20, 80);
  doc.text(`PR Hash: ${sanitizedHash}`, 20, 90);
  
  doc.setFontSize(14);
  doc.text('Verification Status', 20, 105);
  doc.setFontSize(12);
  const status = auditData.isMatch ? 'MATCH - Verified' : 'MISMATCH - Unverified';
  doc.text(status, 20, 115);

  doc.save(`audit-report-${sanitizedHash.slice(0, 8)}.pdf`);
};
