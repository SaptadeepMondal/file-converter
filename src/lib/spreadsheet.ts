import * as XLSX from 'xlsx';

export async function convertSpreadsheet(
  file: File,
  targetFormat: 'csv' | 'xlsx'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Write the workbook to the desired format
        const wbout = XLSX.write(workbook, {
          bookType: targetFormat,
          type: 'array',
        });
        
        const blob = new Blob([wbout], {
          type: targetFormat === 'csv' 
            ? 'text/csv' 
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        resolve(blob);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read spreadsheet'));
    reader.readAsArrayBuffer(file);
  });
}
