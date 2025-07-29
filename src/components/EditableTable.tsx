import React, { useState, useEffect } from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { ExcelRow, UploadedData } from '../types';
import { AutocompleteInput } from './AutocompleteInput';
import { db } from '../utils/database';

interface EditableTableProps {
  data: UploadedData;
  onDataChange: (updatedData: UploadedData) => void;
}

export const EditableTable: React.FC<EditableTableProps> = ({ data, onDataChange }) => {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [particularsHistory, setParticularsHistory] = useState<string[]>([]);

  useEffect(() => {
    setParticularsHistory(db.getParticularsHistory());
  }, []);

  const handleCellClick = (rowIndex: number, columnName: string) => {
    setEditingCell({ row: rowIndex, col: columnName });
    setEditValue(String(data.rows[rowIndex][columnName] || ''));
  };

  const handleSave = () => {
    if (!editingCell) return;

    const updatedRows = [...data.rows];
    const { row, col } = editingCell;
    
    // Convert to number for numeric columns
    if (['SALES', 'PAYMENT', ...data.paymentMethods].includes(col)) {
      updatedRows[row][col] = parseFloat(editValue) || 0;
    } else {
      updatedRows[row][col] = editValue;
    }

    onDataChange({
      ...data,
      rows: updatedRows
    });

    setEditingCell(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formatCellValue = (value: any, columnName: string) => {
    if (['SALES', 'PAYMENT', ...data.paymentMethods].includes(columnName)) {
      const num = parseFloat(String(value || '0'));
      return num === 0 ? '' : num.toLocaleString('en-IN');
    }
    return String(value || '');
  };

  const getCellType = (row: ExcelRow, index: number) => {
    const particulars = String(row.Particulars || '').toLowerCase().trim();
    const sales = parseFloat(String(row.SALES || '0')) || 0;
    const payment = parseFloat(String(row.PAYMENT || '0')) || 0;
    const hasPaymentMethods = data.paymentMethods.some(method => 
      parseFloat(String(row[method] || '0')) > 0
    );

    if (particulars.includes('cash in office')) {
      return { type: 'cash_in_office', color: 'bg-purple-50 border-purple-200' };
    } else if (sales > 0 || hasPaymentMethods) {
      return { type: 'customer', color: 'bg-green-50 border-green-200' };
    } else if (payment > 0) {
      return { type: 'expense', color: 'bg-red-50 border-red-200' };
    }
    return { type: 'unknown', color: 'bg-gray-50 border-gray-200' };
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4 p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview & Edit Data</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded mr-2"></div>
            <span>Customer Transactions</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded mr-2"></div>
            <span>Expenses</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-50 border border-purple-200 rounded mr-2"></div>
            <span>Cash in Office</span>
          </div>
        </div>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {data.columns.map((column) => (
              <th
                key={column}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.rows.map((row, rowIndex) => {
            const cellType = getCellType(row, rowIndex);
            return (
              <tr key={rowIndex} className={`${cellType.color} hover:bg-opacity-75 transition-colors`}>
                {data.columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column}`}
                    className="px-6 py-4 text-sm border-r border-gray-200 last:border-r-0 cursor-pointer hover:bg-blue-50 transition-colors relative group"
                    onClick={() => handleCellClick(rowIndex, column)}
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === column ? (
                      <div className="flex items-center space-x-2">
                        {column === 'Particulars' ? (
                          <AutocompleteInput
                            value={editValue}
                            onChange={setEditValue}
                            suggestions={particularsHistory}
                            className="px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter particulars..."
                          />
                        ) : (
                          <input
                            type={['SALES', 'PAYMENT', ...data.paymentMethods].includes(column) ? 'number' : 'text'}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave();
                          }}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel();
                          }}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className={`${!formatCellValue(row[column], column) ? 'text-gray-400' : 'text-gray-900'}`}>
                          {formatCellValue(row[column], column) || '-'}
                        </span>
                        <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};