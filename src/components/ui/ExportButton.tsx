import React from 'react';
import { Download } from 'lucide-react';
import { exportToCsv } from '@/utils/csv';

interface ExportButtonProps<T> {
  data: T[];
  filename: string;
}

const ExportButton = <T extends {}>({ data, filename }: ExportButtonProps<T>) => {
  const handleExport = () => {
    if(data.length > 0){
        exportToCsv(data, filename);
    } else {
        alert("Nessun dato da esportare.");
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
    >
      <Download size={18} className="mr-2" />
      Esporta CSV
    </button>
  );
};

export default ExportButton;
