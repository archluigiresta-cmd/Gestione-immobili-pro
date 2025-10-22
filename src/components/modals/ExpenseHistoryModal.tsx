import React, { useState, useMemo } from 'react';
import { Expense, Property, ExpenseCategory } from '../../types';
import { X, Download, ExternalLink } from 'lucide-react';
import InteractiveTable, { Column } from '../ui/InteractiveTable';

interface ExpenseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  properties: Property[];
}

const ExpenseHistoryModal: React.FC<ExpenseHistoryModalProps> = ({ isOpen, onClose, expenses, properties }) => {
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const propertyMap = useMemo(() => new Map(properties.map(p => [p.id, p.name])), [properties]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const propertyMatch = filterProperty === 'all' || expense.propertyId === filterProperty;
      const categoryMatch = filterCategory === 'all' || expense.category === filterCategory;
      return propertyMatch && categoryMatch;
    });
  }, [expenses, filterProperty, filterCategory]);

  const columns: Column<Expense>[] = [
    { header: 'Data', accessor: 'date', render: (row) => new Date(row.date).toLocaleDateString('it-IT') },
    { header: 'Immobile', accessor: 'propertyId', render: (row) => propertyMap.get(row.propertyId) || 'N/A' },
    { header: 'Descrizione', accessor: 'description' },
    { header: 'Categoria', accessor: 'category' },
    { header: 'Importo', accessor: 'amount', className: 'text-right', render: (row) => `€${row.amount.toLocaleString('it-IT')}` },
    {
      header: 'Allegato',
      accessor: 'id',
      className: 'text-center',
      render: (row) => (
        <div className="flex justify-center items-center">
            {row.invoiceData && <a href={row.invoiceData} download={row.invoiceName} className="text-primary hover:text-primary-hover" title={`Scarica ${row.invoiceName}`}><Download size={18} /></a>}
            {row.invoiceUrl && <a href={row.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover" title="Visualizza allegato (link esterno)"><ExternalLink size={18} /></a>}
        </div>
      )
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Storico Bollette e Allegati</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Filtra per Immobile</label>
                <select value={filterProperty} onChange={e => setFilterProperty(e.target.value)} className="mt-1 block w-full input">
                    <option value="all">Tutti gli immobili</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Filtra per Categoria</label>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="mt-1 block w-full input">
                    <option value="all">Tutte le categorie</option>
                    {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto">
            <InteractiveTable columns={columns} data={filteredExpenses} />
        </div>
        
        <div className="flex justify-end pt-4 mt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Chiudi</button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseHistoryModal;
