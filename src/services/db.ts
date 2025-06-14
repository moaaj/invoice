import Dexie, { Table } from 'dexie';

export interface Invoice {
  id?: number;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
}

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Client {
  id?: number;
  name: string;
  email: string;
  address: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

class InvoiceDatabase extends Dexie {
  invoices!: Table<Invoice>;
  clients!: Table<Client>;

  constructor() {
    super('InvoiceDB');
    this.version(1).stores({
      invoices: '++id, invoiceNumber, date, clientName, status',
      clients: '++id, name, email, createdAt'
    });
  }
}

export const db = new InvoiceDatabase(); 