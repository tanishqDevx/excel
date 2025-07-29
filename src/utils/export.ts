import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Transaction } from '../types';

export const exportToExcel = (transactions: Transaction[], filename: string = 'transactions') => {
  const data = transactions.map(t => ({
    Date: t.date,
    Particulars: t.particulars,
    Sales: t.sales,
    Payment: t.payment,
    Type: t.type,
    ...t.paymentMethods
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
};

export const exportToCSV = (transactions: Transaction[], filename: string = 'transactions') => {
  const data = transactions.map(t => ({
    Date: t.date,
    Particulars: t.particulars,
    Sales: t.sales,
    Payment: t.payment,
    Type: t.type,
    ...t.paymentMethods
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};