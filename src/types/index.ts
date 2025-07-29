export interface Transaction {
  id: string;
  date: string;
  particulars: string;
  sales: number;
  payment: number;
  paymentMethods: Record<string, number>;
  type: 'customer' | 'expense' | 'cash_in_office';
  creditAmount?: number;
  debitAmount?: number;
  balance?: number;
}

export interface DashboardSummary {
  totalSales: number;
  totalPayment: number;
  paymentMethodTotals: Record<string, number>;
  cashInOffice: number;
  runningBalance: number;
  transactionCount: number;
  totalOutstanding: number;
  totalAdvances: number;
}

export interface CustomerLedger {
  particulars: string;
  totalSales: number;
  totalPayments: number;
  currentBalance: number;
  transactionCount: number;
  lastTransactionDate: string;
  transactions: Transaction[];
}

export interface ExcelRow {
  [key: string]: string | number | undefined;
}

export interface UploadedData {
  columns: string[];
  rows: ExcelRow[];
  paymentMethods: string[];
}