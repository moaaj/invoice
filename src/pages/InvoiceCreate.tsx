import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  useTheme,
  useMediaQuery,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Delete as DeleteIcon, Add as AddIcon, Print as PrintIcon } from '@mui/icons-material';
import { invoiceService } from '../services/invoiceService';
import InvoicePreview from '../components/InvoicePreview';
import { customerService } from '../services/customerService';

const currencies = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'BDT', label: 'Bangladeshi Taka (BDT)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
];

const validationSchema = Yup.object().shape({
  customerName: Yup.string().required('Customer name is required'),
  customerEmail: Yup.string().email('Invalid email').required('Customer email is required'),
  customerAddress: Yup.string().required('Customer address is required'),
  invoiceDate: Yup.date().required('Invoice date is required'),
  dueDate: Yup.date().required('Due date is required'),
  currency: Yup.string().required('Currency is required'),
  items: Yup.array().of(
    Yup.object().shape({
      description: Yup.string().required('Description is required'),
      quantity: Yup.number()
        .min(1, 'Quantity must be at least 1')
        .required('Quantity is required'),
      unitPrice: Yup.number()
        .min(0, 'Unit price must be at least 0')
        .required('Unit price is required'),
      taxRate: Yup.number()
        .min(0, 'Tax rate must be at least 0')
        .max(100, 'Tax rate cannot exceed 100'),
    })
  ).min(1, 'At least one item is required'),
});

const initialValues = {
  invoiceNumber: invoiceService.generateInvoiceNumber(),
  customerName: '',
  customerEmail: '',
  customerAddress: '',
  invoiceDate: new Date(),
  dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
  items: [
    {
      id: '1',
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      taxRate: 0
    }
  ],
  subtotal: 0,
  taxRate: 0,
  taxAmount: 0,
  grandTotal: 0,
  notes: '',
  status: 'draft',
  currency: 'USD'
};

const InvoiceCreate = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formValues, setFormValues] = useState(initialValues);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        await invoiceService.init();
        const customerData = await customerService.getCustomers();
        setCustomers(customerData);
      } catch (err) {
        setError('Failed to initialize data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    initializeData();
  }, []);

  const handleCustomerSelect = (customer, setFieldValue) => {
    setSelectedCustomer(customer);
    if (customer) {
      setFieldValue('customerName', customer.name);
      setFieldValue('customerEmail', customer.email);
      setFieldValue('customerAddress', customer.address);
    } else {
      setFieldValue('customerName', '');
      setFieldValue('customerEmail', '');
      setFieldValue('customerAddress', '');
    }
  };

  const DatePickerField = ({ field, form, label }) => (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={field.value}
        onChange={(newValue) => {
          form.setFieldValue(field.name, newValue);
        }}
        slotProps={{
          textField: {
            fullWidth: true,
            error: Boolean(form.touched[field.name] && form.errors[field.name]),
            helperText: form.touched[field.name] && form.errors[field.name]
          }
        }}
      />
    </LocalizationProvider>
  );

  const CustomerAutocomplete = ({ value, onChange, options }) => (
    <Autocomplete
      options={options}
      getOptionLabel={option => option.name || ''}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      renderInput={params => (
        <TextField {...params} label="Select Customer" placeholder="Search customers..." fullWidth />
      )}
    />
  );

  const calculateItemTotals = (item) => {
    const subtotal = item.quantity * item.unitPrice;
    const taxAmount = subtotal * (item.taxRate / 100);
    const total = subtotal + taxAmount;
    return { ...item, subtotal, taxAmount, total };
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * (item.taxRate / 100));
    }, 0);
    const grandTotal = subtotal + taxTotal;
    return { subtotal, taxTotal, grandTotal };
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setIsLoading(true);
      setError(null);
      if (!values.customerName || !values.customerEmail || !values.customerAddress) {
        setError('Please fill in all required customer information');
        setSubmitting(false);
        return;
      }
      if (values.items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
        setError('Please fill in all required item information (description, quantity, and unit price)');
        setSubmitting(false);
        return;
      }
      const totals = calculateTotals(values.items);
      const invoiceData = {
        invoiceNumber: values.invoiceNumber,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerAddress: values.customerAddress,
        invoiceDate: new Date(values.invoiceDate),
        dueDate: new Date(values.dueDate),
        currency: values.currency,
        notes: values.notes,
        items: values.items.map(item => ({
          id: item.id,
          name: item.description,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          taxRate: Number(item.taxRate),
          subtotal: Number(item.subtotal),
          taxAmount: Number(item.taxAmount),
          total: Number(item.total)
        })),
        subtotal: Number(totals.subtotal),
        taxTotal: Number(totals.taxTotal),
        grandTotal: Number(totals.grandTotal),
        status: 'draft'
      };
      await invoiceService.createInvoice(invoiceData);
      navigate('/invoices');
    } catch (err) {
      setError('Failed to create invoice. Please try again.');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printContent = previewRef.current;
    if (!printContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for printing');
      return;
    }
    const content = printContent.innerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .totals { text-align: right; margin-top: 20px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const renderForm = (formikProps) => {
    useEffect(() => {
      setFormValues(formikProps.values);
    }, [formikProps.values]);
    const { values, touched, errors, setFieldValue, setFieldTouched } = formikProps;
    return (
      <Form>
        <Grid container spacing={3}>
          {/* Customer Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Customer Information</Typography>
          </Grid>
          <Grid item xs={12}>
            <CustomerAutocomplete
              value={selectedCustomer}
              onChange={customer => handleCustomerSelect(customer, setFieldValue)}
              options={customers}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Field
              as={TextField}
              fullWidth
              label="Customer Name"
              name="customerName"
              error={Boolean(touched.customerName && errors.customerName)}
              helperText={touched.customerName && errors.customerName}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Field
              as={TextField}
              fullWidth
              label="Customer Email"
              name="customerEmail"
              type="email"
              error={Boolean(touched.customerEmail && errors.customerEmail)}
              helperText={touched.customerEmail && errors.customerEmail}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Field
              as={TextField}
              fullWidth
              label="Customer Address"
              name="customerAddress"
              multiline
              rows={2}
              error={Boolean(touched.customerAddress && errors.customerAddress)}
              helperText={touched.customerAddress && errors.customerAddress}
            />
          </Grid>

          {/* Invoice Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Invoice Details</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Field
              as={TextField}
              fullWidth
              label="Invoice Number"
              name="invoiceNumber"
              disabled
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Field
              name="invoiceDate"
              component={DatePickerField}
              label="Invoice Date"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Field
              name="dueDate"
              component={DatePickerField}
              label="Due Date"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Field as={Select} name="currency" label="Currency">
                {currencies.map((currency) => (
                  <MenuItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </MenuItem>
                ))}
              </Field>
            </FormControl>
          </Grid>

          {/* Invoice Items */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Items</Typography>
              <FieldArray name="items">
                {({ push }) => (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => push({
                      id: crypto.randomUUID(),
                      name: '',
                      description: '',
                      quantity: 1,
                      unitPrice: 0,
                      taxRate: 0,
                      subtotal: 0,
                      taxAmount: 0,
                      total: 0,
                    })}
                    variant="contained"
                    color="primary"
                  >
                    Add Item
                  </Button>
                )}
              </FieldArray>
            </Box>
            <FieldArray name="items">
              {({ remove }) => (
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
                      {values.items.map((item, index) => {
                        const calculatedItem = calculateItemTotals(item);
                        const itemErrors = errors.items?.[index] || {};
                        const itemTouched = touched.items?.[index] || {};
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Field
                                as={TextField}
                                fullWidth
                                required
                                label="Description"
                                name={`items.${index}.description`}
                                error={Boolean(itemTouched.description && itemErrors.description)}
                                helperText={itemTouched.description && itemErrors.description}
                              />
                            </TableCell>
                            <TableCell>
                              <Field
                                as={TextField}
                                label="Quantity"
                                type="number"
                                name={`items.${index}.quantity`}
                                fullWidth
                                error={Boolean(itemTouched.quantity && itemErrors.quantity)}
                                helperText={itemTouched.quantity && itemErrors.quantity}
                                InputProps={{
                                  inputProps: { min: 1 },
                                  sx: { '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { display: 'none' } }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Field
                                as={TextField}
                                label="Unit Price"
                                type="number"
                                name={`items.${index}.unitPrice`}
                                fullWidth
                                error={Boolean(itemTouched.unitPrice && itemErrors.unitPrice)}
                                helperText={itemTouched.unitPrice && itemErrors.unitPrice}
                                InputProps={{
                                  inputProps: { min: 0, step: 0.01 },
                                  sx: { '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { display: 'none' } }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Field
                                as={TextField}
                                label="Tax Rate (%)"
                                type="number"
                                name={`items.${index}.taxRate`}
                                fullWidth
                                error={Boolean(itemTouched.taxRate && itemErrors.taxRate)}
                                helperText={itemTouched.taxRate && itemErrors.taxRate}
                                InputProps={{
                                  inputProps: { min: 0, max: 100, step: 0.01 },
                                  sx: { '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { display: 'none' } }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              ${calculatedItem.total.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <IconButton onClick={() => remove(index)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </FieldArray>
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <Field
              as={TextField}
              fullWidth
              multiline
              rows={4}
              label="Notes"
              name="notes"
            />
          </Grid>

          {/* Totals */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {(() => {
                const totals = calculateTotals(values.items);
                return (
                  <>
                    <Typography variant="h6">Subtotal: ${totals.subtotal.toFixed(2)}</Typography>
                    <Typography variant="h6">Tax: ${totals.taxTotal.toFixed(2)}</Typography>
                    <Typography variant="h6">Total: ${totals.grandTotal.toFixed(2)}</Typography>
                  </>
                );
              })()}
            </Box>
          </Grid>

          {/* Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/invoices')}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Invoice'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Form>
    );
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Form Section */}
          <Grid item xs={12} md={isTablet ? 12 : 6}>
            <Paper sx={{ p: 3, mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Create New Invoice</Typography>
                <Button startIcon={<PrintIcon />} onClick={handlePrint} variant="outlined">Print Invoice</Button>
              </Box>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {renderForm}
              </Formik>
            </Paper>
          </Grid>
          {/* Preview Section */}
          <Grid item xs={12} md={isTablet ? 12 : 6}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h5" gutterBottom>Preview</Typography>
                <Divider sx={{ mb: 3 }} />
                <div ref={previewRef}>
                  <InvoicePreview
                    invoice={{
                      invoiceNumber: formValues.invoiceNumber,
                      customerName: formValues.customerName,
                      customerEmail: formValues.customerEmail,
                      customerAddress: formValues.customerAddress,
                      invoiceDate: formValues.invoiceDate,
                      dueDate: formValues.dueDate,
                      currency: formValues.currency,
                      notes: formValues.notes,
                      items: formValues.items.map(item => ({
                        id: item.id,
                        name: item.description,
                        description: item.description,
                        quantity: Number(item.quantity),
                        unitPrice: Number(item.unitPrice),
                        taxRate: Number(item.taxRate),
                        subtotal: Number(item.subtotal),
                        taxAmount: Number(item.taxAmount),
                        total: Number(item.total)
                      })),
                      subtotal: Number(formValues.subtotal),
                      taxTotal: Number(formValues.taxAmount),
                      taxAmount: Number(formValues.taxAmount),
                      taxRate: Number(formValues.taxRate),
                      grandTotal: Number(formValues.grandTotal),
                      status: formValues.status
                    }}
                  />
                </div>
              </Paper>
            </Box>
          </Grid>
        </Grid>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default InvoiceCreate; 