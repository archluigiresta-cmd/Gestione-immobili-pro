import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Expense, ExpenseCategory, User, UtilityType, TaxType, Property } from '../types';
import { PlusCircle, Edit, Trash2, ExternalLink, Download, ChevronDown } from 'lucide-react';
import AddExpenseModal from '../components/modals/AddExpenseModal';
import EditExpenseModal from '../components/modals/EditExpenseModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import InteractiveTable, { Column } from '../components/ui/InteractiveTable';


const COLORS = {
  [ExpenseCategory.CONDOMINIUM]: '#0088FE',
  [ExpenseCategory.UTILITIES]: '#00C49F',
  [ExpenseCategory.TAXES]: '#FFBB28',
  [ExpenseCategory.MAINTENANCE]: '#FF8042',
  [ExpenseCategory.OTHER]: '#AF19FF',
};

const getPropertyColors = (index: number) => {
    const colors = [
        'border-red-500', 'border-teal-500', 'border-blue-500', 'border-green-500',
        'border-indigo-500', 'border-purple-500', 'border-pink-500', 'border-yellow-500'
    ];
    return colors[index % colors.length];
};

interface ExpensesScreenProps {
  projectId: string;
  user: User;
}

const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ projectId, user }) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
    const [openSections, setOpenSections] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadExpenses();
    }, [projectId]);

    const loadExpenses = () => {
        setExpenses(dataService.getExpenses(projectId));
        setProperties(dataService.getProperties(projectId));
    };

    const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'history'>) => {
        dataService.addExpense({ ...expenseData, projectId }, user.id);
        loadExpenses();
        setAddModalOpen(false);
    };

    const handleUpdateExpense = (updatedExpense: Expense) => {
        dataService.updateExpense(updatedExpense, user.id);
        loadExpenses();
        setEditingExpense(null);
    };

    const handleDeleteExpense = () => {
        if (deletingExpense) {
            dataService.deleteExpense(deletingExpense.id);
            loadExpenses();
            setDeletingExpense(null);
        }
    };

    const expensesByCategory = expenses.reduce((acc, expense) => {
        const category = expense.category;
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += expense.amount;
        return acc;
    }, {} as Record<ExpenseCategory, number>);

    const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
        name,
        value,
    }));

    const toggleSection = (propertyId: string) => {
      setOpenSections(prev => {
          const newSet = new Set(prev);
          if (newSet.has(propertyId)) {
              newSet.delete(propertyId);
          } else {
              newSet.add(propertyId);
          }
          return newSet;
      });
    };

    const groupedExpenses = useMemo(() => {
      return expenses.reduce<Record<string, Expense[]>>((acc, item) => {
          (acc[item.propertyId] = acc[item.propertyId] || []).push(item);
          return acc;
      }, {});
    }, [expenses]);

    const columns: Column<Expense>[] = [
      { header: 'Descrizione', accessor: 'description', render: (row) => {
          const isUtility = row.category === ExpenseCategory.UTILITIES;
          const isTax = row.category === ExpenseCategory.TAXES;
          return (
              <div>
                  <span className="font-medium text-dark">{row.description}</span>
                  {isUtility && row.utilityProvider && <span className="block text-xs text-blue-700 font-semibold">Gestore: {row.utilityProvider}</span>}
                  {isTax && row.taxReferenceYear && <span className="block text-xs text-yellow-700 font-semibold">Anno: {row.taxReferenceYear}</span>}
              </div>
          );
      }},
      { header: 'Categoria', accessor: 'category', render: (row) => {
          const displayCategory = (row.category === ExpenseCategory.OTHER && row.categoryOther) ? row.categoryOther : row.category;
          const isUtility = row.category === ExpenseCategory.UTILITIES;
          const utilityDisplayType = (row.utilityType === UtilityType.OTHER && row.utilityTypeOther) ? row.utilityTypeOther : row.utilityType;
          const isTax = row.category === ExpenseCategory.TAXES;
          const taxDisplayType = (row.taxType === TaxType.OTHER && row.taxTypeOther) ? row.taxTypeOther : row.taxType;
          return (
              <div>
                  <span className="font-semibold">{displayCategory}</span>
                  {isUtility && utilityDisplayType && <span className="block text-xs">{utilityDisplayType}</span>}
                  {isTax && taxDisplayType && <span className="block text-xs">{taxDisplayType}</span>}
              </div>
          );
      }},
      { header: 'Data', accessor: 'date', render: (row) => new Date(row.date).toLocaleDateString('it-IT') },
      { header: 'Importo', accessor: 'amount', render: (row) => `€${row.amount.toLocaleString('it-IT')}`, className: 'text-right font-bold text-gray-900' },
      { header: 'Allegati', accessor: 'id', render: (row) => (
          <div className="flex justify-center items-center gap-4">
              {row.providerUrl && <a href={row.providerUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary" title="Link al gestore"><ExternalLink size={18} /></a>}
              {row.invoiceData && <a href={row.invoiceData} download={row.invoiceName} className="text-gray-500 hover:text-primary" title={`Scarica ${row.invoiceName}`}><Download size={18} /></a>}
              {row.invoiceUrl && <a href={row.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary" title="Visualizza fattura (link esterno)"><ExternalLink size={18} /></a>}
          </div>
      ), className: 'text-center' },
      { header: 'Azioni', accessor: 'id', render: (row) => (
           <div className="flex justify-center items-center gap-4">
              <button onClick={() => setEditingExpense(row)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
              <button onClick={() => setDeletingExpense(row)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
          </div>
      ), className: 'text-center' },
    ];
  
    const propertyMap = useMemo(() => new Map(properties.map(p => [p.id, p.name])), [properties]);

    return (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-dark">Elenco Spese</h1>
                <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                >
                    <PlusCircle size={18} className="mr-2" />
                    Aggiungi Spesa
                </button>
            </div>
            <div className="space-y-4">
              {Object.entries(groupedExpenses).map(([propertyId, items], index) => {
                  const propertyName = propertyMap.get(propertyId) || 'Immobile non trovato';
                  const isOpen = openSections.has(propertyId);
                  return (
                      <div key={propertyId} className={`rounded-lg overflow-hidden border-l-4 ${getPropertyColors(index)} bg-white shadow-sm`}>
                          <button onClick={() => toggleSection(propertyId)} className={`w-full flex justify-between items-center p-4 text-left font-bold text-lg ${isOpen ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                              <span>{propertyName} <span className="text-sm font-medium text-gray-500">({items.length} spese)</span></span>
                              <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isOpen && (
                              <div className="p-2 bg-white">
                                  <InteractiveTable columns={columns} data={items} />
                              </div>
                          )}
                      </div>
                  );
              })}
            </div>
        </div>
        <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Riepilogo per Categoria</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name as ExpenseCategory]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `€${value.toLocaleString('it-IT')}`}/>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
      </div>

      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddExpense}
        projectId={projectId}
      />
      {editingExpense && (
        <EditExpenseModal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          onSave={handleUpdateExpense}
          expense={editingExpense}
          projectId={projectId}
        />
      )}
      {deletingExpense && (
        <ConfirmDeleteModal
          isOpen={!!deletingExpense}
          onClose={() => setDeletingExpense(null)}
          onConfirm={handleDeleteExpense}
          message={`Sei sicuro di voler eliminare la spesa "${deletingExpense.description}"?`}
        />
      )}
      </>
    );
};

export default ExpensesScreen;
