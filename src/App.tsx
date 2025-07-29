import React, { useState } from 'react';
import { FileSpreadsheet, BarChart3, CheckCircle } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { EditableTable } from './components/EditableTable';
import { Dashboard } from './components/Dashboard';
import { CustomerLedger } from './components/CustomerLedger';
import { UploadedData } from './types';
import { convertToTransactions } from './utils/excelParser';
import { db } from './utils/database';

type AppState = 'upload' | 'preview' | 'dashboard' | 'customer-ledger';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('upload');
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const handleDataParsed = (data: UploadedData) => {
    setUploadedData(data);
    setCurrentState('preview');
  };

  const handleDataChange = (updatedData: UploadedData) => {
    setUploadedData(updatedData);
  };

  const handleConfirmData = () => {
    if (!uploadedData) return;

    const transactions = convertToTransactions(uploadedData, selectedDate);
    db.addTransactions(transactions);
    
    setCurrentState('dashboard');
    setUploadedData(null);
  };

  const handleStartOver = () => {
    setCurrentState('upload');
    setUploadedData(null);
    setSelectedCustomer('');
  };

  const handleViewCustomer = (particulars: string) => {
    setSelectedCustomer(particulars);
    setCurrentState('customer-ledger');
  };

  const handleBackToDashboard = () => {
    setCurrentState('dashboard');
    setSelectedCustomer('');
  };
  const renderCurrentState = () => {
    switch (currentState) {
      case 'upload':
        return (
          <div className="text-center">
            <FileUpload onDataParsed={handleDataParsed} />
            
            {db.getTransactions().length > 0 && (
              <div className="mt-8">
                <p className="text-gray-600 mb-4">Or view your existing data:</p>
                <button
                  onClick={() => setCurrentState('dashboard')}
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Dashboard
                </button>
              </div>
            )}
          </div>
        );
      
      case 'preview':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Review Your Data</h2>
                <p className="text-gray-600">Make any necessary edits before saving to database</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="transaction-date" className="text-sm font-medium text-gray-700">
                    Transaction Date:
                  </label>
                  <input
                    id="transaction-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleStartOver}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Start Over
                  </button>
                  <button
                    onClick={handleConfirmData}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Save to Database
                  </button>
                </div>
              </div>
            </div>
            
            {uploadedData && (
              <EditableTable 
                data={uploadedData} 
                onDataChange={handleDataChange}
              />
            )}
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div></div>
              <button
                onClick={handleStartOver}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Upload New File
              </button>
            </div>
            <Dashboard onViewCustomer={handleViewCustomer} />
          </div>
        );
      
      case 'customer-ledger':
        return (
          <CustomerLedger 
            particulars={selectedCustomer}
            onBack={handleBackToDashboard}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileSpreadsheet className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Accounting Manager</h1>
            </div>
            
            <nav className="flex space-x-4">
              <button
                onClick={() => setCurrentState('upload')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentState === 'upload'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Upload
              </button>
              {uploadedData && (
                <button
                  onClick={() => setCurrentState('preview')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentState === 'preview'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Preview
                </button>
              )}
              <button
                onClick={() => setCurrentState('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentState === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentState()}
      </main>
    </div>
  );
}

export default App;