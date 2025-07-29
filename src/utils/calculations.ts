import { Transaction, DashboardSummary } from '../types';
import { db } from './database';

export const calculateDashboardSummary = (transactions: Transaction[]): DashboardSummary => {
  const summary: DashboardSummary = {
    totalSales: 0,
    totalPayment: 0,
    paymentMethodTotals: {},
    cashInOffice: 0,
    runningBalance: 0,
    transactionCount: transactions.length,
    totalOutstanding: 0,
    totalAdvances: 0
  };

  transactions.forEach(transaction => {
    summary.totalSales += transaction.sales;
    summary.totalPayment += transaction.payment;

    // Calculate payment method totals
    Object.entries(transaction.paymentMethods).forEach(([method, amount]) => {
      summary.paymentMethodTotals[method] = (summary.paymentMethodTotals[method] || 0) + amount;
    });

    // Handle cash in office calculation
    if (transaction.type === 'cash_in_office') {
      const totalPaymentMethods = Object.values(transaction.paymentMethods).reduce((sum, amount) => sum + amount, 0);
      summary.cashInOffice += (totalPaymentMethods - transaction.payment);
    }
  });

  // Calculate running balance (Sales - Payments)
  summary.runningBalance = summary.totalSales - summary.totalPayment;

  // Calculate outstanding amounts from customer ledgers
  const customerLedgers = db.getCustomerLedgers();
  customerLedgers.forEach(ledger => {
    if (ledger.currentBalance > 0) {
      summary.totalOutstanding += ledger.currentBalance;
    } else if (ledger.currentBalance < 0) {
      summary.totalAdvances += Math.abs(ledger.currentBalance);
    }
  });

  return summary;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};