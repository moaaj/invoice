// Mock data for development
const mockInvoices = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    customerName: 'John Doe',
    issueDate: '2024-03-15',
    dueDate: '2024-04-15',
    total: 1500.00,
    status: 'pending',
    items: [
      {
        description: 'Web Development',
        quantity: 1,
        unitPrice: 1500.00,
        taxRate: 0.1,
      }
    ]
  },
  {
    id: '2',
    invoiceNumber: 'INV-002',
    customerName: 'Jane Smith',
    issueDate: '2024-03-14',
    dueDate: '2024-04-14',
    total: 2500.00,
    status: 'paid',
    items: [
      {
        description: 'UI Design',
        quantity: 1,
        unitPrice: 2500.00,
        taxRate: 0.1,
      }
    ]
  }
];

// Get all invoices
export const getInvoices = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockInvoices);
    }, 500);
  });
};

// Get a single invoice by ID
export const getInvoice = async (id) => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const invoice = mockInvoices.find(inv => inv.id === id);
      if (invoice) {
        resolve(invoice);
      } else {
        reject(new Error('Invoice not found'));
      }
    }, 500);
  });
};

// Create a new invoice
export const createInvoice = async (invoiceData) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newInvoice = {
        id: String(mockInvoices.length + 1),
        ...invoiceData,
        status: 'draft',
        total: calculateTotal(invoiceData.items),
      };
      mockInvoices.push(newInvoice);
      resolve(newInvoice);
    }, 500);
  });
};

// Bulk create invoices
export const bulkCreateInvoices = async (invoicesData) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = {
        success: [],
        errors: []
      };

      invoicesData.forEach((invoiceData, index) => {
        try {
          const newInvoice = {
            id: String(mockInvoices.length + 1),
            ...invoiceData,
            status: 'draft',
            total: calculateTotal(invoiceData.items),
          };
          mockInvoices.push(newInvoice);
          results.success.push(newInvoice);
        } catch (error) {
          results.errors.push({
            index,
            error: error.message
          });
        }
      });

      resolve(results);
    }, 500);
  });
};

// Helper function to calculate total
const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const taxAmount = itemTotal * (item.taxRate || 0);
    return total + itemTotal + taxAmount;
  }, 0);
};

// Update an existing invoice
export const updateInvoice = async (id, invoiceData) => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockInvoices.findIndex(inv => inv.id === id);
      if (index !== -1) {
        mockInvoices[index] = { 
          ...mockInvoices[index], 
          ...invoiceData,
          total: calculateTotal(invoiceData.items || mockInvoices[index].items)
        };
        resolve(mockInvoices[index]);
      } else {
        reject(new Error('Invoice not found'));
      }
    }, 500);
  });
};

// Delete an invoice
export const deleteInvoice = async (id) => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockInvoices.findIndex(inv => inv.id === id);
      if (index !== -1) {
        mockInvoices.splice(index, 1);
        resolve(true);
      } else {
        reject(new Error('Invoice not found'));
      }
    }, 500);
  });
};

// Get invoice statistics
export const getInvoiceStats = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const stats = {
        total: mockInvoices.length,
        paid: mockInvoices.filter(inv => inv.status === 'paid').length,
        pending: mockInvoices.filter(inv => inv.status === 'pending').length,
        overdue: mockInvoices.filter(inv => inv.status === 'overdue').length,
        totalAmount: mockInvoices.reduce((sum, inv) => sum + inv.total, 0),
      };
      resolve(stats);
    }, 500);
  });
}; 