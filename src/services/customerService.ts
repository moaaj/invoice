import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  company?: string;
  taxId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomerDB extends DBSchema {
  customers: {
    key: string;
    value: Customer;
    indexes: {
      'by-name': string;
      'by-email': string;
    };
  };
}

class CustomerService {
  private db: IDBPDatabase<CustomerDB> | null = null;

  async init() {
    this.db = await openDB<CustomerDB>('invoicing-system', 1, {
      upgrade(db) {
        const store = db.createObjectStore('customers', { keyPath: 'id' });
        store.createIndex('by-name', 'name');
        store.createIndex('by-email', 'email');
      },
    });
  }

  async getCustomers(): Promise<Customer[]> {
    if (!this.db) await this.init();
    return this.db!.getAll('customers');
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    if (!this.db) await this.init();
    return this.db!.get('customers', id);
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    if (!this.db) await this.init();
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.db!.add('customers', newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined> {
    if (!this.db) await this.init();
    const existingCustomer = await this.db!.get('customers', id);
    if (!existingCustomer) return undefined;

    const updatedCustomer: Customer = {
      ...existingCustomer,
      ...customer,
      updatedAt: new Date(),
    };
    await this.db!.put('customers', updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('customers', id);
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    if (!this.db) await this.init();
    const customers = await this.db!.getAll('customers');
    const searchTerm = query.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm) ||
      customer.company?.toLowerCase().includes(searchTerm)
    );
  }
}

export const customerService = new CustomerService(); 