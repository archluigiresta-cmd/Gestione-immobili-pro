import React, { useState, useMemo } from 'react';
import { ArrowUpDown } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface InteractiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

type SortDirection = 'asc' | 'desc';

const InteractiveTable = <T extends {}>({ columns, data }: InteractiveTableProps<T>) => {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (accessor: keyof T) => {
    if (sortColumn === accessor) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(accessor);
      setSortDirection('asc');
    }
  };
  
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Fallback for dates or other types
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={String(col.accessor)} className={`p-3 text-sm font-semibold text-gray-600 ${col.className || ''}`}>
                <button onClick={() => handleSort(col.accessor)} className="flex items-center gap-2 hover:text-primary">
                  {col.header}
                  <ArrowUpDown size={14} />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b hover:bg-gray-50">
              {columns.map(col => (
                <td key={String(col.accessor)} className={`p-3 text-gray-700 ${col.className || ''}`}>
                  {col.render ? col.render(row) : String(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {sortedData.length === 0 && (
        <div className="text-center p-8 text-gray-500">
            Nessun dato trovato per i filtri selezionati.
        </div>
      )}
    </div>
  );
};

export default InteractiveTable;
