
import { Customer, Transaction, AppState } from '../types';

const STORAGE_KEY = 'sobar_khata_db';

export const dbService = {
  saveData: (data: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  loadData: (): AppState => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        customers: [],
        transactions: [],
        totalReceivable: 0,
        totalPayable: 0
      };
    }
    return JSON.parse(raw);
  },

  calculateBalances: (customers: Customer[], transactions: Transaction[]): AppState => {
    let totalReceivable = 0;
    let totalPayable = 0;

    const updatedCustomers = customers.map(customer => {
      const customerTransactions = transactions.filter(t => t.customerId === customer.id);
      const balance = customerTransactions.reduce((acc, t) => {
        return t.type === 'CREDIT' ? acc + t.amount : acc - t.amount;
      }, 0);

      if (balance > 0) totalReceivable += balance;
      else totalPayable += Math.abs(balance);

      return { ...customer, balance, lastUpdated: Date.now() };
    });

    return {
      customers: updatedCustomers,
      transactions,
      totalReceivable,
      totalPayable
    };
  }
};
