import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Button,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { currencyService } from '../services/currencyService';
import { Invoice } from '../services/invoiceService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download as DownloadIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
}

interface InvoicePreviewProps {
  invoice: {
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
    customerAddress: string;
    invoiceDate: Date;
    dueDate: Date;
    currency: string;
    notes: string;
    items: InvoiceItem[];
    subtotal: number;
    taxTotal: number;
    taxAmount: number;
    taxRate: number;
    grandTotal: number;
    status: string;
  };
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const previewRef = useRef<HTMLDivElement>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [targetCurrency, setTargetCurrency] = useState<string>('EUR');
  const [conversionDate, setConversionDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCurrencies] = useState(currencyService.getAvailableCurrencies());

  useEffect(() => {
    if (targetCurrency && targetCurrency !== invoice.currency) {
      convertAmount();
    } else {
      setConvertedAmount(null);
    }
  }, [targetCurrency, conversionDate, invoice.grandTotal, invoice.currency]);

  const convertAmount = async () => {
    try {
      setLoading(true);
      setError(null);
      const amount = await currencyService.convertAmount(
        invoice.grandTotal,
        invoice.currency,
        targetCurrency,
        conversionDate?.toISOString().split('T')[0]
      );
      setConvertedAmount(amount);
    } catch (err) {
      setError('Failed to convert currency');
      console.error('Currency conversion error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleDownloadInvoice = () => {
    if (!previewRef.current) return;

    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerAddress: invoice.customerAddress,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      items: invoice.items,
      subtotal: invoice.subtotal,
      taxTotal: invoice.taxAmount,
      grandTotal: invoice.grandTotal,
      notes: invoice.notes,
    };

    const blob = new Blob([JSON.stringify(invoiceData, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, `invoice-${invoiceData.invoiceNumber}.json`);
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<PdfIcon />}
          onClick={handleDownloadPDF}
        >
          Export to PDF
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadInvoice}
        >
          Download Invoice
        </Button>
      </Stack>

      <Paper
        ref={previewRef}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          maxWidth: '100%',
          overflow: 'hidden',
          '@media print': {
            boxShadow: 'none',
            p: 0,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            mb: 4,
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" color="primary" gutterBottom>
              INVOICE
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {invoice.invoiceNumber}
            </Typography>
          </Box>
          <Box
            sx={{
              textAlign: { xs: 'left', sm: 'right' },
            }}
          >
            <Typography variant="body1" gutterBottom>
              <strong>Date:</strong> {formatDate(invoice.invoiceDate)}
            </Typography>
            <Typography variant="body1">
              <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
            </Typography>
          </Box>
        </Box>

        {/* Customer Info */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            mb: 4,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Bill To:
            </Typography>
            <Typography variant="body1" gutterBottom>
              {invoice.customerName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {invoice.customerEmail}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {invoice.customerAddress}
            </Typography>
          </Box>
        </Box>

        {/* Items Table */}
        <TableContainer
          sx={{
            mb: 4,
            '@media print': {
              breakInside: 'avoid',
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Tax Rate</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item: InvoiceItem) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell align="right">{item.taxRate}%</TableCell>
                  <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 1,
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: { xs: '100%', sm: '300px' },
            }}
          >
            <Typography>Subtotal:</Typography>
            <Typography>{formatCurrency(invoice.subtotal)}</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: { xs: '100%', sm: '300px' },
            }}
          >
            <Typography>Tax:</Typography>
            <Typography>{formatCurrency(invoice.taxAmount)}</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: { xs: '100%', sm: '300px' },
              borderTop: 1,
              borderColor: 'divider',
              pt: 1,
              mt: 1,
            }}
          >
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6">{formatCurrency(invoice.grandTotal)}</Typography>
          </Box>
        </Box>

        {/* Notes */}
        {invoice.notes && (
          <Box
            sx={{
              borderTop: 1,
              borderColor: 'divider',
              pt: 2,
              '@media print': {
                breakInside: 'avoid',
              },
            }}
          >
            <Typography variant="h6" gutterBottom>
              Notes:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {invoice.notes}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 4, textAlign: 'right' }}>
          <Typography variant="subtitle1">
            Subtotal: {currencyService.formatCurrency(invoice.subtotal, invoice.currency)}
          </Typography>
          <Typography variant="subtitle1">
            Tax ({invoice.taxRate}%): {currencyService.formatCurrency(invoice.taxAmount, invoice.currency)}
          </Typography>
          <Typography variant="h6">
            Total: {currencyService.formatCurrency(invoice.grandTotal, invoice.currency)}
          </Typography>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'right' }}>
          <Typography variant="h6" gutterBottom>
            Convert To
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              select
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value)}
              size="small"
              sx={{ minWidth: 120 }}
            >
              {availableCurrencies.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>
            <DatePicker
              label="Conversion Date"
              value={conversionDate}
              onChange={(newValue) => setConversionDate(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>
          {loading ? (
            <CircularProgress size={20} sx={{ mt: 1 }} />
          ) : convertedAmount !== null ? (
            <Typography variant="h6" sx={{ mt: 1 }}>
              {currencyService.formatCurrency(convertedAmount, targetCurrency)}
            </Typography>
          ) : null}
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default InvoicePreview; 