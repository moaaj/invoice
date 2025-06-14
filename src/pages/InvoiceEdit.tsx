import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  date: Date;
  dueDate: Date;
  items: InvoiceItem[];
  notes: string;
  status: 'draft' | 'sent' | 'paid';
}

const InvoiceEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch invoice data from API
    // For now, using mock data
    setInvoice({
      id: id || '1',
      invoiceNumber: 'INV-001',
      clientId: '1',
      clientName: 'John Doe',
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: '1',
          description: 'Item 1',
          quantity: 2,
          unitPrice: 100,
          taxRate: 10,
        },
      ],
      notes: '',
      status: 'draft',
    });
    setLoading(false);
  }, [id]);

  const handleDateChange = (field: 'date' | 'dueDate') => (date: Date | null) => {
    if (date && invoice) {
      setInvoice({ ...invoice, [field]: date });
    }
  };

  const handleItemChange = (
    itemId: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    if (invoice) {
      const updatedItems = invoice.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      );
      setInvoice({ ...invoice, items: updatedItems });
    }
  };

  const addItem = () => {
    if (invoice) {
      const newItem: InvoiceItem = {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
      };
      setInvoice({
        ...invoice,
        items: [...invoice.items, newItem],
      });
    }
  };

  const removeItem = (itemId: string) => {
    if (invoice) {
      setInvoice({
        ...invoice,
        items: invoice.items.filter((item) => item.id !== itemId),
      });
    }
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const tax = subtotal * (item.taxRate / 100);
    return subtotal + tax;
  };

  const calculateTotal = () => {
    if (!invoice) return 0;
    return invoice.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save invoice changes to API
    navigate('/invoices');
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!invoice) {
    return <Typography>Invoice not found</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Edit Invoice
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Invoice Number"
                value={invoice.invoiceNumber}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client"
                value={invoice.clientName}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Invoice Date"
                  value={invoice.date}
                  onChange={handleDateChange('date')}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={invoice.dueDate}
                  onChange={handleDateChange('dueDate')}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Items
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Tax Rate (%)</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <TextField
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(item.id, 'description', e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'quantity',
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'unitPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.taxRate}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'taxRate',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      ${calculateItemTotal(item).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => removeItem(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            startIcon={<AddIcon />}
            onClick={addItem}
            sx={{ mt: 2 }}
          >
            Add Item
          </Button>

          <Box sx={{ mt: 4, textAlign: 'right' }}>
            <Typography variant="h6">
              Total: ${calculateTotal().toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/invoices')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save Changes
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default InvoiceEdit; 