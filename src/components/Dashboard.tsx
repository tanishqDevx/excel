import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  User,
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Transaction, DashboardSummary, CustomerLedger } from '../types';
import { calculateDashboardSummary, formatCurrency } from '../utils/calculations';
import { exportToExcel, exportToCSV } from '../utils/export';
import { db } from '../utils/database';

interface DashboardProps {
  onViewCustomer?: (particulars: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onViewCustomer }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [customerLedgers, setCustomerLedgers] = useState<CustomerLedger[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    particulars: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'customers'>('transactions');

  useEffect(() => {
    loadTransactions();
    loadCustomerLedgers();
  }, []);

  useEffect(() => {
    const filtered = db.getTransactions(filters);
    setFilteredTransactions(filtered);
    setSummary(calculateDashboardSummary(filtered));
  }, [transactions, filters]);

  const loadTransactions = () => {
    const allTransactions = db.getTransactions();
    setTransactions(allTransactions);
  };

  const loadCustomerLedgers = () => {
    const ledgers = db.getCustomerLedgers();
    setCustomerLedgers(ledgers);
  };
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', particulars: '' });
  };

  const handleExport = (format: 'excel' | 'csv') => {
    const filename = `transactions_${new Date().toISOString().split('T')[0]}`;
    if (format === 'excel') {
      exportToExcel(filteredTransactions, filename);
    } else {
      exportToCSV(filteredTransactions, filename);
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-red-600'; // Outstanding
    if (balance < 0) return 'text-green-600'; // Advance
    return 'text-gray-600';
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return <AlertTriangle className="w-4 h-4" />;
    if (balance < 0) return <CheckCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };
  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Accounting Dashboard</h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Particulars</label>
              <input
                type="text"
                placeholder="Search particulars..."
                value={filters.particulars}
                onChange={(e) => handleFilterChange('particulars', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-800">Total Sales</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.totalSales)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-red-800">Total Payments</p>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(summary.totalPayment)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-800">Running Balance</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(summary.runningBalance)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-800">Cash in Office</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(summary.cashInOffice)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-800">Outstanding</p>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(summary.totalOutstanding)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-lg border border-teal-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-teal-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-teal-800">Advances</p>
              <p className="text-2xl font-bold text-teal-900">{formatCurrency(summary.totalAdvances)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      {Object.keys(summary.paymentMethodTotals).length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Payment Methods Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(summary.paymentMethodTotals).map(([method, amount]) => (
              <div
                key={method}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span className="font-medium text-gray-700">{method}</span>
                <span className="font-bold text-gray-900">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Recent Transactions ({filteredTransactions.length})
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'customers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Customer Ledgers ({customerLedgers.length})
            </button>
          </nav>
        </div>

        {activeTab === 'transactions' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.slice(0, 50).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {transaction.particulars}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'customer' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.type === 'expense'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {transaction.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.sales > 0 ? formatCurrency(transaction.sales) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.payment > 0 ? formatCurrency(transaction.payment) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Transaction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerLedgers.map((ledger) => (
                  <tr key={ledger.particulars} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{ledger.particulars}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatCurrency(ledger.totalSales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                      {formatCurrency(ledger.totalPayments)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center">
                        {getBalanceIcon(ledger.currentBalance)}
                        <span className={`ml-2 ${getBalanceColor(ledger.currentBalance)}`}>
                          {formatCurrency(Math.abs(ledger.currentBalance))}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {ledger.currentBalance > 0 ? 'Outstanding' : 
                         ledger.currentBalance < 0 ? 'Advance' : 'Settled'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ledger.transactionCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(ledger.lastTransactionDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => onViewCustomer?.(ledger.particulars)}
                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                      >
                        View Ledger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};