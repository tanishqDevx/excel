import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { CustomerLedger as CustomerLedgerType, Transaction } from '../types';
import { formatCurrency } from '../utils/calculations';
import { db } from '../utils/database';

interface CustomerLedgerProps {
  particulars: string;
  onBack: () => void;
}

export const CustomerLedger: React.FC<CustomerLedgerProps> = ({ particulars, onBack }) => {
  const [ledger, setLedger] = useState<CustomerLedgerType | null>(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const customerLedger = db.getCustomerLedger(particulars);
    setLedger(customerLedger);
  }, [particulars]);

  if (!ledger) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Customer ledger not found</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const filteredTransactions = ledger.transactions.filter(transaction => {
    if (dateFilter.startDate && transaction.date < dateFilter.startDate) return false;
    if (dateFilter.endDate && transaction.date > dateFilter.endDate) return false;
    return true;
  });

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-red-600'; // Outstanding (customer owes us)
    if (balance < 0) return 'text-green-600'; // Advance (we owe customer)
    return 'text-gray-600';
  };

  const getBalanceLabel = (balance: number) => {
    if (balance > 0) return 'Outstanding';
    if (balance < 0) return 'Advance';
    return 'Settled';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <User className="w-6 h-6 mr-2" />
              {ledger.particulars}
            </h2>
            <p className="text-gray-600">Customer Ledger</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-800">Total Sales</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(ledger.totalSales)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-800">Total Payments</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(ledger.totalPayments)}</p>
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-br p-6 rounded-lg border ${
          ledger.currentBalance > 0 
            ? 'from-red-50 to-red-100 border-red-200' 
            : ledger.currentBalance < 0
            ? 'from-green-50 to-green-100 border-green-200'
            : 'from-gray-50 to-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center">
            <CreditCard className={`h-8 w-8 ${
              ledger.currentBalance > 0 
                ? 'text-red-600' 
                : ledger.currentBalance < 0
                ? 'text-green-600'
                : 'text-gray-600'
            }`} />
            <div className="ml-4">
              <p className={`text-sm font-medium ${
                ledger.currentBalance > 0 
                  ? 'text-red-800' 
                  : ledger.currentBalance < 0
                  ? 'text-green-800'
                  : 'text-gray-800'
              }`}>
                Current Balance ({getBalanceLabel(ledger.currentBalance)})
              </p>
              <p className={`text-2xl font-bold ${getBalanceColor(ledger.currentBalance)}`}>
                {formatCurrency(Math.abs(ledger.currentBalance))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-800">Transactions</p>
              <p className="text-2xl font-bold text-purple-900">{ledger.transactionCount}</p>
              <p className="text-xs text-purple-600">
                Last: {new Date(ledger.lastTransactionDate).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Transactions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {(dateFilter.startDate || dateFilter.endDate) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setDateFilter({ startDate: '', endDate: '' })}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Transaction History ({filteredTransactions.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit (Sales)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit (Payments)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Methods</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Running Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.creditAmount && transaction.creditAmount > 0 ? (
                      <span className="text-green-600 font-medium">
                        +{formatCurrency(transaction.creditAmount)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.debitAmount && transaction.debitAmount > 0 ? (
                      <span className="text-red-600 font-medium">
                        -{formatCurrency(transaction.debitAmount)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {Object.keys(transaction.paymentMethods).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(transaction.paymentMethods).map(([method, amount]) => (
                          <div key={method} className="flex justify-between">
                            <span className="text-gray-600">{method}:</span>
                            <span className="font-medium">{formatCurrency(amount)}</span>
                          </div>
                        ))}
                        {transaction.payment > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cash:</span>
                            <span className="font-medium">{formatCurrency(transaction.payment)}</span>
                          </div>
                        )}
                      </div>
                    ) : transaction.payment > 0 ? (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cash:</span>
                        <span className="font-medium">{formatCurrency(transaction.payment)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={getBalanceColor(transaction.balance || 0)}>
                      {formatCurrency(Math.abs(transaction.balance || 0))}
                    </span>
                    <div className="text-xs text-gray-500">
                      {getBalanceLabel(transaction.balance || 0)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};