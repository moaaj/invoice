import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
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
  grandTotal: number;
  status: 'draft' | 'sent' | 'paid' | 'unpaid' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

interface InvoiceDB extends DBSchema {
  invoices: {
    key: string;
    value: Invoice;
    indexes: {
      'by-invoiceNumber': string;
      'by-date': Date;
      'by-status': string;
    };
  };
}

class InvoiceService {
  private db: IDBPDatabase<InvoiceDB> | null = null;

  async init() {
    if (!this.db) {
      this.db = await openDB<InvoiceDB>('invoice-db', 1, {
        upgrade(db: IDBPDatabase<InvoiceDB>) {
          const store = db.createObjectStore('invoices', { keyPath: 'id' });
          store.createIndex('by-invoiceNumber', 'invoiceNumber');
          store.createIndex('by-date', 'invoiceDate');
          store.createIndex('by-status', 'status');
        },
      });
    }
  }

  async getInvoices(): Promise<Invoice[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAll('invoices');
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    return this.db.get('invoices', id);
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    console.log('Initializing database...');
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    console.log('Creating new invoice...');
    const newInvoice: Invoice = {
      ...invoice,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Adding invoice to database:', newInvoice);
    await this.db.add('invoices', newInvoice);
    console.log('Invoice added successfully');
    return newInvoice;
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const existingInvoice = await this.db.get('invoices', id);
    if (!existingInvoice) throw new Error('Invoice not found');

    const updatedInvoice: Invoice = {
      ...existingInvoice,
      ...invoice,
      updatedAt: new Date(),
    };

    await this.db.put('invoices', updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete('invoices', id);
  }

  generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  }

  async getInvoicesByStatus(status: Invoice['status']): Promise<Invoice[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAllFromIndex('invoices', 'by-status', status);
  }

  async getInvoicesByDateRange(startDate: Date, endDate: Date): Promise<Invoice[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    const allInvoices = await this.db.getAll('invoices');
    return allInvoices.filter(
      invoice => 
        invoice.invoiceDate >= startDate && 
        invoice.invoiceDate <= endDate
    );
  }
}

export const invoiceService = new InvoiceService(); 