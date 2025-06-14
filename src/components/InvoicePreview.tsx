import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  useTheme,
} from '@mui/material';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface InvoicePreviewProps {
  invoice: {
    invoiceNumber: string;
    customerName: string;
    issueDate: string;
    dueDate: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    total: number;
  };
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const theme = useTheme();

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 40);
    doc.text(`Customer: ${invoice.customerName}`, 20, 50);
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 20, 60);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 70);
    
    // Add items table
    const tableData = invoice.items.map(item => [
      item.description,
      item.quantity.toString(),
      `$${item.unitPrice.toFixed(2)}`,
      `$${(item.quantity * item.unitPrice).toFixed(2)}`
    ]);
    
    (doc as any).autoTable({
      startY: 80,
      head: [['Description', 'Quantity', 'Unit Price', 'Total']],
      body: tableData,
    });
    
    // Add total
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.text(`Total: $${invoice.total.toFixed(2)}`, 20, finalY + 20);
    
    // Save the PDF
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Invoice Preview
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Invoice Details</Typography>
          <Typography>Invoice Number: {invoice.invoiceNumber}</Typography>
          <Typography>Customer: {invoice.customerName}</Typography>
          <Typography>Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}</Typography>
          <Typography>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Typography variant="h6">
            Total: ${invoice.total.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default InvoicePreview; 