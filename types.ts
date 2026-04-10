
export type TransactionType = 'CREDIT' | 'PAYMENT';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number; // Positive means they owe us (Baki), Negative means we owe them (Advance)
  lastUpdated: number;
}

export interface Transaction {
  id: string;
  customerId: string;
  amount: number;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note?: string;
  createdAt: number;
}

export interface AppState {
  customers: Customer[];
  transactions: Transaction[];
  totalReceivable: number;
  totalPayable: number;
}

export interface ReportSummary {
  dateRange: string;
  totalCredit: number;
  totalPayment: number;
  netCashFlow: number;
  transactions: Transaction[];
}
