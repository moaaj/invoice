import { jsPDF } from 'jspdf';
import { Invoice } from './db';
import { format } from 'date-fns';

export const generateInvoicePDF = (invoice: Invoice): jsPDF => {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  // Add company logo/header
  doc.setFontSize(20);
  doc.text('INVOICE', margin, y);
  y += 20;

  // Invoice details
  doc.setFontSize(12);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, margin, y);
  y += 10;
  doc.text(`Date: ${format(invoice.date, 'PPP')}`, margin, y);
  y += 10;
  doc.text(`Due Date: ${format(invoice.dueDate, 'PPP')}`, margin, y);
  y += 20;

  // Client details
  doc.text('Bill To:', margin, y);
  y += 10;
  doc.text(invoice.clientName, margin, y);
  y += 10;
  doc.text(invoice.clientAddress, margin, y);
  y += 10;
  doc.text(invoice.clientEmail, margin, y);
  y += 20;

  // Items table
  const tableTop = y;
  doc.text('Description', margin, tableTop);
  doc.text('Qty', margin + 80, tableTop);
  doc.text('Price', margin + 110, tableTop);
  doc.text('Amount', margin + 150, tableTop);
  y += 10;

  // Table line
  doc.line(margin, y, 190, y);
  y += 10;

  // Items
  invoice.items.forEach(item => {
    doc.text(item.description, margin, y);
    doc.text(item.quantity.toString(), margin + 80, y);
    doc.text(`$${item.unitPrice.toFixed(2)}`, margin + 110, y);
    doc.text(`$${item.amount.toFixed(2)}`, margin + 150, y);
    y += 10;
  });

  // Totals
  y += 10;
  doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, margin + 110, y);
  y += 10;
  doc.text(`Tax: $${invoice.tax.toFixed(2)}`, margin + 110, y);
  y += 10;
  doc.setFontSize(14);
  doc.text(`Total: $${invoice.total.toFixed(2)}`, margin + 110, y);

  // Notes
  if (invoice.notes) {
    y += 20;
    doc.setFontSize(12);
    doc.text('Notes:', margin, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(invoice.notes, margin, y);
  }

  return doc;
}; 