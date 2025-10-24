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


const safeRender = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
        return '';
    }
    if (React.isValidElement(value)) {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((item, index) => <React.Fragment key={index}>{safeRender(item)}</React.Fragment>);
    }
    if (typeof value === 'string' || typeof value === 'number') {
        return value;
    }
    if (typeof value === 'boolean') {
        return value ? 'Sì' : 'No';
    }
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? '' : value.toLocaleDateString('it-IT');
    }
    if (typeof value === 'object') {
        console.warn('InteractiveTable safeRender prevented an invalid object from rendering.', value);
        return '';
    }
    return String(value);
};


const InteractiveTable = <T extends { id?: string | number }>({ columns, data }: InteractiveTableProps<T>) => {
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
      const direction = sortDirection === 'asc' ? 1 : -1;

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      const aType = typeof aValue;
      const bType = typeof bValue;

      if (aType === 'number' && bType === 'number') {
        return ((aValue as number) - (bValue as number)) * direction;
      }
      if (aType === 'boolean' && bType === 'boolean') {
        return (Number(aValue) - Number(bValue)) * direction;
      }

      const strA = String(aValue);
      const strB = String(bValue);

      const isDateString = (s: string) => /^\d{4}-\d{2}-\d{2}/.test(s);
      if (isDateString(strA) && isDateString(strB)) {
        const dateA = new Date(strA);
        const dateB = new Date(strB);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return (dateA.getTime() - dateB.getTime()) * direction;
        }
      }
      
      return strA.localeCompare(strB, 'it', { numeric: true, sensitivity: 'base' }) * direction;
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
            <tr key={row.id ?? `row-${rowIndex}`} className="border-b hover:bg-gray-50">
              {columns.map(col => {
                const cellContent = col.render ? col.render(row) : row[col.accessor];
                return (
                    <td key={String(col.accessor)} className={`p-3 text-gray-700 ${col.className || ''}`}>
                        {safeRender(cellContent)}
                    </td>
                );
              })}
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
