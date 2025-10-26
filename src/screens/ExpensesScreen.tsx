import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Card from '@/components/ui/Card';
import * as dataService from '@/services/dataService';
import { Expense, ExpenseCategory, User, UtilityType, TaxType, Property } from '@/types';
import { PlusCircle, Edit, Trash2, ExternalLink, Download, DollarSign } from 'lucide-react';
import AddExpenseModal from '@/components/modals/AddExpenseModal';
import EditExpenseModal from '@/components/modals/EditExpenseModal';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import AccordionItem from '@/components/ui/AccordionItem';


const COLORS = {
  [ExpenseCategory.CONDOMINIUM]: '#0088FE',
  [ExpenseCategory.UTILITIES]: '#00C49F',
  [ExpenseCategory.TAXES]: '#FFBB28',
  [ExpenseCategory.MAINTENANCE]: '#FF8042',
  [ExpenseCategory.OTHER]: '#AF19FF',
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
    
    const propertyMap = useMemo(() => new Map(properties.map(p => [p.id, p.name])), [properties]);

    const groupedExpenses = useMemo(() => {
        return expenses.reduce((acc, expense) => {
            const key = expense.propertyId;
            if(!acc[key]) acc[key] = [];
            acc[key].push(expense);
            return acc;
        }, {} as Record<string, Expense[]>);
    }, [expenses]);
    
    const grandTotal = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
    
    const expensesByCategory = useMemo(() => {
      const byCategory = expenses.reduce((acc, expense) => {
          const category = expense.category;
          if (!acc[category]) acc[category] = 0;
          acc[category] += expense.amount;
          return acc;
      }, {} as Record<ExpenseCategory, number>);
      return Object.entries(byCategory).map(([name, value]) => ({ name, value, }));
    }, [expenses]);

    const expensesByProperty = useMemo(() => {
        const byProperty = expenses.reduce((acc, expense) => {
            const propertyName = propertyMap.get(expense.propertyId) || 'Non Assegnato';
            if(!acc[propertyName]) acc[propertyName] = 0;
            acc[propertyName] += expense.amount;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(byProperty).map(([name, value]) => ({ name, Spese: value }));
    }, [expenses, propertyMap]);
  
    return (
      <>
      <div className="space-y-6">
          <Card className="p-6">
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
                {properties.filter(p => groupedExpenses[p.id]).map(property => {
                    const propertyExpenses = groupedExpenses[property.id];
                    const subtotal = propertyExpenses.reduce((sum, e) => sum + e.amount, 0);
                    const title = (
                        <div className="flex items-center gap-3">
                            <span>{property.name}</span>
                            <span className="text-sm bg-gray-200 text-gray-700 font-bold px-2.5 py-1 rounded-full">{propertyExpenses.length}</span>
                        </div>
                    );
                    return (
                        <AccordionItem key={property.id} title={title}>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                     <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-3 text-sm font-semibold text-gray-600">Descrizione</th>
                                            <th className="p-3 text-sm font-semibold text-gray-600">Categoria</th>
                                            <th className="p-3 text-sm font-semibold text-gray-600">Data</th>
                                            <th className="p-3 text-sm font-semibold text-gray-600 text-right">Importo</th>
                                            <th className="p-3 text-sm font-semibold text-gray-600 text-center">Allegati</th>
                                            <th className="p-3 text-sm font-semibold text-gray-600 text-center">Azioni</th>
                                        </tr>
                                     </thead>
                                     <tbody>
                                        {propertyExpenses.map(row => (
                                            <tr key={row.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                                <td className="p-3 font-medium text-dark">{row.description}</td>
                                                <td className="p-3 text-gray-700">{row.category}</td>
                                                <td className="p-3 text-gray-700">{new Date(row.date).toLocaleDateString('it-IT')}</td>
                                                <td className="p-3 text-right font-bold text-gray-800">€{row.amount.toLocaleString('it-IT')}</td>
                                                <td className="p-3 text-center">
                                                    <div className="flex justify-center items-center gap-4">
                                                        {row.providerUrl && <a href={row.providerUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary" title="Link al gestore"><ExternalLink size={18} /></a>}
                                                        {row.invoiceData && <a href={row.invoiceData} download={row.invoiceName} className="text-gray-500 hover:text-primary" title={`Scarica ${row.invoiceName}`}><Download size={18} /></a>}
                                                        {row.invoiceUrl && <a href={row.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary" title="Visualizza fattura (link esterno)"><ExternalLink size={18} /></a>}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <div className="flex justify-center items-center gap-4">
                                                        <button onClick={() => setEditingExpense(row)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                                        <button onClick={() => setDeletingExpense(row)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                     </tbody>
                                     <tfoot>
                                        <tr className="bg-red-50">
                                            <td colSpan={3} className="p-3 text-right font-bold text-red-800">Subtotale</td>
                                            <td colSpan={3} className="p-3 text-left font-bold text-lg text-red-800">€{subtotal.toLocaleString('it-IT', {minimumFractionDigits: 2})}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                             </div>
                        </AccordionItem>
                    )
                })}
             </div>
             <div className="mt-4 p-4 bg-red-900 text-white rounded-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <DollarSign size={24} />
                        <h3 className="text-xl font-bold">Totale Complessivo Spese</h3>
                    </div>
                    <p className="text-3xl font-bold">€{grandTotal.toLocaleString('it-IT', {minimumFractionDigits: 2})}</p>
                </div>
            </div>
          </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
                <h2 className="text-xl font-bold text-dark mb-4">Riepilogo per Categoria</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={expensesByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                            {expensesByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name as ExpenseCategory]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `€${value.toLocaleString('it-IT')}`}/>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
             <Card className="p-6">
                <h2 className="text-xl font-bold text-dark mb-4">Riepilogo per Immobile</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={expensesByProperty} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `€${value.toLocaleString('it-IT')}`}/>
                        <Bar dataKey="Spese" fill="#FF8042" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
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
