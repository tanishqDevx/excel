import * as XLSX from 'xlsx';
import { ExcelRow, UploadedData, Transaction } from '../types';

export const parseExcelFile = (file: File): Promise<UploadedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length < 2) {
          throw new Error('Excel file must have at least 2 rows (header + data)');
        }

        const headers = jsonData[0] as string[];
        const rows: ExcelRow[] = jsonData.slice(1).map(row => {
          const obj: ExcelRow = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });

        // Identify payment method columns (exclude fixed columns)
        const fixedColumns = ['Particulars', 'SALES', 'PAYMENT'];
        const paymentMethods = headers.filter(col => !fixedColumns.includes(col));

        resolve({
          columns: headers,
          rows: rows.filter(row => 
            Object.values(row).some(val => val !== '' && val !== undefined)
          ),
          paymentMethods
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

export const convertToTransactions = (data: UploadedData, date: string): Transaction[] => {
  return data.rows.map((row, index) => {
    const particulars = String(row.Particulars || '').trim();
    const sales = parseFloat(String(row.SALES || '0')) || 0;
    const payment = parseFloat(String(row.PAYMENT || '0')) || 0;
    
    // Calculate payment methods
    const paymentMethods: Record<string, number> = {};
    data.paymentMethods.forEach(method => {
      const value = parseFloat(String(row[method] || '0')) || 0;
      if (value > 0) {
        paymentMethods[method] = value;
      }
    });

    // Determine transaction type
    let type: Transaction['type'] = 'expense';
    if (particulars.toLowerCase().includes('cash in office')) {
      type = 'cash_in_office';
    } else if (sales > 0 || Object.keys(paymentMethods).length > 0) {
      type = 'customer';
    }

    return {
      id: `${date}-${index}-${Date.now()}`,
      date,
      particulars,
      sales,
      payment,
      paymentMethods,
      type
    };
  });
};