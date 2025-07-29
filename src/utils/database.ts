import { Transaction, CustomerLedger } from '../types';

// Simple in-memory storage simulation (replace with actual SQLite in production)
class DatabaseManager {
  private transactions: Transaction[] = [];
  private particularsHistory: Set<string> = new Set();
  private customerLedgers: Map<string, CustomerLedger> = new Map();

  // Load initial data from localStorage
  constructor() {
    this.loadFromStorage();
    this.updateCustomerLedgers();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('accounting_transactions');
    if (stored) {
      this.transactions = JSON.parse(stored);
      this.transactions.forEach(t => this.particularsHistory.add(t.particulars));
    }
  }

  private saveToStorage() {
    localStorage.setItem('accounting_transactions', JSON.stringify(this.transactions));
    this.updateCustomerLedgers();
  }

  private updateCustomerLedgers() {
    this.customerLedgers.clear();
    
    // Group transactions by particulars
    const groupedTransactions = new Map<string, Transaction[]>();
    
    this.transactions
      .filter(t => t.type === 'customer')
      .forEach(transaction => {
        const key = transaction.particulars.toLowerCase().trim();
        if (!groupedTransactions.has(key)) {
          groupedTransactions.set(key, []);
        }
        groupedTransactions.get(key)!.push(transaction);
      });

    // Create ledgers for each customer
    groupedTransactions.forEach((transactions, key) => {
      const sortedTransactions = transactions.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      let runningBalance = 0;
      const processedTransactions = sortedTransactions.map(t => {
        const creditAmount = t.sales;
        const debitAmount = t.payment + Object.values(t.paymentMethods).reduce((sum, amount) => sum + amount, 0);
        runningBalance += creditAmount - debitAmount;
        
        return {
          ...t,
          creditAmount,
          debitAmount,
          balance: runningBalance
        };
      });

      const totalSales = transactions.reduce((sum, t) => sum + t.sales, 0);
      const totalPayments = transactions.reduce((sum, t) => 
        sum + t.payment + Object.values(t.paymentMethods).reduce((pSum, amount) => pSum + amount, 0), 0
      );

      const ledger: CustomerLedger = {
        particulars: transactions[0].particulars, // Use original case
        totalSales,
        totalPayments,
        currentBalance: totalSales - totalPayments,
        transactionCount: transactions.length,
        lastTransactionDate: sortedTransactions[sortedTransactions.length - 1].date,
        transactions: processedTransactions
      };

      this.customerLedgers.set(key, ledger);
    });
  }
  addTransactions(transactions: Transaction[]) {
    this.transactions.push(...transactions);
    transactions.forEach(t => this.particularsHistory.add(t.particulars));
    this.saveToStorage();
  }

  updateTransaction(id: string, updates: Partial<Transaction>) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.transactions[index] = { ...this.transactions[index], ...updates };
      if (updates.particulars) {
        this.particularsHistory.add(updates.particulars);
      }
      this.saveToStorage();
    }
  }

  getTransactions(filters?: { startDate?: string; endDate?: string; particulars?: string }) {
    let filtered = [...this.transactions];

    if (filters?.startDate) {
      filtered = filtered.filter(t => t.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      filtered = filtered.filter(t => t.date <= filters.endDate!);
    }
    if (filters?.particulars) {
      filtered = filtered.filter(t => 
        t.particulars.toLowerCase().includes(filters.particulars!.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getCustomerLedgers(): CustomerLedger[] {
    return Array.from(this.customerLedgers.values())
      .sort((a, b) => Math.abs(b.currentBalance) - Math.abs(a.currentBalance));
  }

  getCustomerLedger(particulars: string): CustomerLedger | null {
    return this.customerLedgers.get(particulars.toLowerCase().trim()) || null;
  }

  getCustomersWithOutstanding(): CustomerLedger[] {
    return this.getCustomerLedgers().filter(ledger => ledger.currentBalance !== 0);
  }
  getParticularsHistory(): string[] {
    return Array.from(this.particularsHistory).sort();
  }

  clearAllData() {
    this.transactions = [];
    this.particularsHistory.clear();
    this.customerLedgers.clear();
    localStorage.removeItem('accounting_transactions');
  }
}

export const db = new DatabaseManager();