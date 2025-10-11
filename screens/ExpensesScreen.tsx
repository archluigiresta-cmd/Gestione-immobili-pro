import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Expense, ExpenseCategory, User, UtilityType } from '../types';
import { PlusCircle, Edit, Trash2, ExternalLink, FileText } from 'lucide-react';
import AddExpenseModal from '../components/modals/AddExpenseModal';
import EditExpenseModal from '../components/modals/EditExpenseModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

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
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

    useEffect(() => {
        loadExpenses();
    }, [projectId]);

    const loadExpenses = () => {
        setExpenses(dataService.getExpenses(projectId));
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
    
    const getPropertyName = (id: string) => dataService.getProperties(projectId).find(p => p.id === id)?.name || 'N/A';

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
            <Card>
                <div className="overflow-x-auto p-2">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-sm font-semibold text-gray-600">Descrizione</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">Categoria</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">Data</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600 text-right">Importo</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600 text-center">Link</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600 text-center">Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense: Expense) => {
                                    const displayCategory = (expense.category === ExpenseCategory.OTHER && expense.categoryOther) ? expense.categoryOther : expense.category;
                                    const isUtility = expense.category === ExpenseCategory.UTILITIES;
                                    const utilityDisplayType = (expense.utilityType === UtilityType.OTHER && expense.utilityTypeOther) ? expense.utilityTypeOther : expense.utilityType;

                                    return (
                                        <tr key={expense.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 text-dark font-medium">
                                                {expense.description}
                                                <span className="block text-xs text-gray-500">{getPropertyName(expense.propertyId)}</span>
                                                {isUtility && expense.utilityProvider && (
                                                    <span className="block text-xs text-blue-700 font-semibold">Gestore: {expense.utilityProvider}</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-gray-700">
                                                {isUtility && utilityDisplayType ? (
                                                    <>
                                                        <span className="font-semibold">{displayCategory}</span>
                                                        <span className="block text-xs">{utilityDisplayType}</span>
                                                    </>
                                                ) : (
                                                    displayCategory
                                                )}
                                            </td>
                                            <td className="p-3 text-gray-700">{new Date(expense.date).toLocaleDateString('it-IT')}</td>
                                            <td className="p-3 text-gray-900 font-bold text-right">€{expense.amount.toLocaleString('it-IT')}</td>
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center items-center gap-4">
                                                    {expense.providerUrl && (
                                                        <a href={expense.providerUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary" title="Link al gestore">
                                                            <ExternalLink size={18} />
                                                        </a>
                                                    )}
                                                    {expense.invoiceUrl && (
                                                        <a href={expense.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary" title="Visualizza fattura">
                                                            <FileText size={18} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                            <div className="flex justify-center items-center gap-4">
                                                <button onClick={() => setEditingExpense(expense)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                                <button onClick={() => setDeletingExpense(expense)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                            </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                </div>
            </Card>
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