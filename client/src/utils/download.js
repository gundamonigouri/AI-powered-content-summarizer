import { jsPDF } from 'jspdf';

export const downloadAsTxt = (content, filename = 'summary.txt') => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadAsPdf = (content, title = 'Summary', filename = 'summary.pdf') => {
  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
  doc.setFontSize(16);
  doc.text(title, margin, 20);
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(content, pageWidth);
  let y = 35;
  lines.forEach((line) => {
    if (y > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += 7;
  });
  doc.save(filename);
};

export const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};
