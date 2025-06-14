import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { useSnackbar } from 'notistack';
import { bulkCreateInvoices } from '../services/invoiceService';

const BulkInvoiceUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
        setError('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      setError(null);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('The CSV file is empty');
          return;
        }
        const previewData = results.data.slice(0, 5); // Show first 5 rows
        setPreview(previewData);
      },
      error: (error) => {
        setError('Error parsing CSV file: ' + error.message);
      },
    });
  };

  const validateInvoiceData = (data) => {
    const requiredFields = ['customerName', 'invoiceNumber', 'issueDate', 'dueDate', 'items'];
    const errors = [];

    data.forEach((row, index) => {
      requiredFields.forEach((field) => {
        if (!row[field]) {
          errors.push(`Row ${index + 1}: Missing required field "${field}"`);
        }
      });

      // Validate items format
      if (row.items) {
        try {
          const items = JSON.parse(row.items);
          if (!Array.isArray(items)) {
            errors.push(`Row ${index + 1}: Items must be a valid JSON array`);
          } else {
            // Validate each item in the array
            items.forEach((item, itemIndex) => {
              if (!item.description || !item.quantity || !item.unitPrice) {
                errors.push(`Row ${index + 1}, Item ${itemIndex + 1}: Missing required fields (description, quantity, unitPrice)`);
              }
            });
          }
        } catch (e) {
          errors.push(`Row ${index + 1}: Invalid items JSON format`);
        }
      }

      // Validate dates
      if (row.issueDate && !isValidDate(row.issueDate)) {
        errors.push(`Row ${index + 1}: Invalid issue date format (use YYYY-MM-DD)`);
      }
      if (row.dueDate && !isValidDate(row.dueDate)) {
        errors.push(`Row ${index + 1}: Invalid due date format (use YYYY-MM-DD)`);
      }
    });

    return errors;
  };

  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const errors = validateInvoiceData(results.data);
        if (errors.length > 0) {
          setError(errors.join('\n'));
          setLoading(false);
          return;
        }

        try {
          const processedData = results.data.map(row => ({
            ...row,
            items: JSON.parse(row.items),
            status: 'draft'
          }));

          const result = await bulkCreateInvoices(processedData);
          
          if (result.errors.length > 0) {
            const errorMessages = result.errors.map(err => 
              `Row ${err.index + 1}: ${err.error}`
            ).join('\n');
            setError(errorMessages);
          }

          enqueueSnackbar(
            `Upload complete. ${result.success.length} invoices created successfully. ${result.errors.length} failed.`,
            { variant: result.errors.length > 0 ? 'warning' : 'success' }
          );

          if (result.success.length > 0) {
            navigate('/invoices');
          }
        } catch (err) {
          setError('Error processing invoices: ' + err.message);
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setError('Error parsing CSV file: ' + error.message);
        setLoading(false);
      },
    });
  };

  const downloadTemplate = () => {
    const template = [
      {
        customerName: 'John Doe',
        invoiceNumber: 'INV-001',
        issueDate: '2024-03-15',
        dueDate: '2024-04-15',
        items: JSON.stringify([
          {
            description: 'Web Development',
            quantity: 1,
            unitPrice: 1500.00,
            taxRate: 0.1
          }
        ])
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'invoice_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bulk Invoice Upload
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload CSV File
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload a CSV file containing invoice data. The file should include the following columns:
            customerName, invoiceNumber, issueDate, dueDate, items (as JSON array).
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
              sx={{ mr: 2 }}
            >
              Download Template
            </Button>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              disabled={loading}
            >
              Select CSV File
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileChange}
              />
            </Button>
            {file && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={loading}
                sx={{ ml: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Upload Invoices'}
              </Button>
            )}
          </Box>

          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {file.name}
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {preview.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Preview (First 5 rows)
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(preview[0]).map((header) => (
                        <TableCell key={header}>{header}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, i) => (
                          <TableCell key={i}>
                            {typeof value === 'object' ? JSON.stringify(value) : value}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BulkInvoiceUpload; 