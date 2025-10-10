
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import { MOCK_EXPENSES, MOCK_PROPERTIES } from '../constants';
import { Expense, ExpenseCategory } from '../types';
import { PlusCircle } from 'lucide-react';

const COLORS = {
  [ExpenseCategory.CONDOMINIUM]: '#0088FE',
  [ExpenseCategory.UTILITIES]: '#00C49F',
  [ExpenseCategory.TAXES]: '#FFBB28',
  [ExpenseCategory.MAINTENANCE]: '#FF8042',
  [ExpenseCategory.OTHER]: '#AF19FF',
};

const ExpensesScreen: React.FC = () => {
    const getPropertyName = (id: string) => MOCK_PROPERTIES.find(p => p.id === id)?.name || 'N/A';

    const expensesByCategory = MOCK_EXPENSES.reduce((acc, expense) => {
        const category = expense.category;
        if(!acc[category]) {
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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-dark">Elenco Spese</h1>
                <button
                    onClick={() => alert("Funzionalità 'Aggiungi Spesa' da implementare.")}
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
                                    <th className="p-3 text-sm font-semibold text-gray-600">Immobile</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">Descrizione</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">Categoria</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">Data</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600 text-right">Importo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_EXPENSES.map((expense: Expense) => (
                                    <tr key={expense.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 text-dark font-medium">{getPropertyName(expense.propertyId)}</td>
                                        <td className="p-3 text-gray-700">{expense.description}</td>
                                        <td className="p-3 text-gray-700">{expense.category}</td>
                                        <td className="p-3 text-gray-700">{new Date(expense.date).toLocaleDateString('it-IT')}</td>
                                        <td className="p-3 text-gray-900 font-bold text-right">€{expense.amount.toLocaleString('it-IT')}</td>
                                    </tr>
                                ))}
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
    );
};

export default ExpensesScreen;
