import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Card from '@/components/ui/Card';
import * as dataService from '@/services/dataService';
import { Payment, Expense, Maintenance, Property, ExpenseCategory } from '@/types';
import { DollarSign, TrendingUp, TrendingDown, ChevronsRight } from 'lucide-react';

interface FinancialAnalysisScreenProps {
  projectId: string;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <Card className="p-4">
        <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-dark">{value}</p>
            </div>
        </div>
    </Card>
);

const FinancialAnalysisScreen: React.FC<FinancialAnalysisScreenProps> = ({ projectId }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);

    const [filterProperty, setFilterProperty] = useState<string>('all');
    const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
    
    useEffect(() => {
        setPayments(dataService.getPayments(projectId));
        setExpenses(dataService.getExpenses(projectId));
        setMaintenances(dataService.getMaintenances(projectId));
        setProperties(dataService.getProperties(projectId));
    }, [projectId]);
    
    const yearsWithData = useMemo(() => {
        const allDates = [
            ...payments.map(p => new Date(p.dueDate).getFullYear()),
            ...expenses.map(e => new Date(e.date).getFullYear()),
            ...maintenances.map(m => new Date(m.requestDate).getFullYear())
        ];
        const uniqueYears = [...new Set(allDates)];
        return uniqueYears.length > 0 ? uniqueYears.sort((a,b) => b-a) : [new Date().getFullYear()];
    }, [payments, expenses, maintenances]);

    const filteredData = useMemo(() => {
        const allExpenses = [
            ...expenses, 
            ...maintenances.filter(m => m.cost).map(m => ({...m, category: ExpenseCategory.MAINTENANCE, amount: m.cost!, date: m.completionDate || m.requestDate }))
        ];

        const filteredPayments = payments.filter(p => 
            new Date(p.dueDate).getFullYear() === filterYear &&
            (filterProperty === 'all' || p.propertyId === filterProperty)
        );
        const filteredExpenses = allExpenses.filter(e => 
            new Date(e.date).getFullYear() === filterYear &&
            (filterProperty === 'all' || e.propertyId === filterProperty)
        );
        return { payments: filteredPayments, expenses: filteredExpenses };

    }, [payments, expenses, maintenances, filterProperty, filterYear]);

    const monthlySummary = useMemo(() => {
        const summary = Array.from({ length: 12 }, (_, i) => ({ 
            month: new Date(0, i).toLocaleString('it-IT', { month: 'short' }),
            Entrate: 0,
            Spese: 0
        }));

        filteredData.payments.forEach(p => {
            const monthIndex = new Date(p.dueDate).getMonth();
            summary[monthIndex].Entrate += p.amount;
        });

        filteredData.expenses.forEach(e => {
            const monthIndex = new Date(e.date).getMonth();
            summary[monthIndex].Spese += e.amount;
        });
        
        return summary;
    }, [filteredData]);
    
    const totalIncome = filteredData.payments.reduce((acc, p) => acc + p.amount, 0);
    const totalExpenses = filteredData.expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    const expensesByCategory = useMemo(() => {
        const byCategory = filteredData.expenses.reduce((acc, expense) => {
            if (!acc[expense.category]) acc[expense.category] = 0;
            acc[expense.category] += expense.amount;
            return acc;
        }, {} as Record<ExpenseCategory, number>);

        return Object.entries(byCategory).map(([name, value]) => ({ name, value }));
    }, [filteredData.expenses]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-dark">Analisi Finanziaria</h1>
            
            <Card className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Anno</label>
                        <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))} className="mt-1 block w-full input">
                            {yearsWithData.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Immobile</label>
                        <select value={filterProperty} onChange={e => setFilterProperty(e.target.value)} className="mt-1 block w-full input">
                            <option value="all">Tutti gli immobili</option>
                            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Entrate Totali" value={`€ ${totalIncome.toLocaleString('it-IT')}`} icon={<TrendingUp className="text-white" />} color="bg-green-500" />
                <StatCard title="Spese Totali" value={`€ ${totalExpenses.toLocaleString('it-IT')}`} icon={<TrendingDown className="text-white" />} color="bg-red-500" />
                <StatCard title="Utile Netto" value={`€ ${netProfit.toLocaleString('it-IT')}`} icon={<ChevronsRight className="text-white" />} color={netProfit >= 0 ? "bg-blue-500" : "bg-yellow-500"} />
            </div>

            <Card className="p-6">
                <h2 className="text-lg font-bold text-dark mb-4">Andamento Mensile Entrate vs Spese ({filterYear})</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlySummary} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `€${value.toLocaleString('it-IT')}`}/>
                        <Legend />
                        <Line type="monotone" dataKey="Entrate" stroke="#10B981" strokeWidth={2} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="Spese" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card className="p-6">
                    <h2 className="text-lg font-bold text-dark mb-4">Ripartizione Spese per Categoria</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={expensesByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                {expensesByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => `€${value.toLocaleString('it-IT')}`}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                 <Card className="p-6">
                    <h2 className="text-lg font-bold text-dark mb-4">Dettaglio Mensile</h2>
                     <div className="overflow-y-auto max-h-[300px]">
                        <table className="w-full text-left">
                           <thead><tr className="bg-gray-50 sticky top-0">
                               <th className="p-2 text-sm font-semibold text-gray-600">Mese</th>
                               <th className="p-2 text-sm font-semibold text-gray-600 text-right">Entrate</th>
                               <th className="p-2 text-sm font-semibold text-gray-600 text-right">Spese</th>
                               <th className="p-2 text-sm font-semibold text-gray-600 text-right">Utile</th>
                           </tr></thead>
                           <tbody>{monthlySummary.map(m => {
                               const profit = m.Entrate - m.Spese;
                               return (
                                <tr key={m.month} className="border-b">
                                    <td className="p-2 font-medium">{m.month}</td>
                                    <td className="p-2 text-right text-green-600">€{m.Entrate.toLocaleString('it-IT')}</td>
                                    <td className="p-2 text-right text-red-600">€{m.Spese.toLocaleString('it-IT')}</td>
                                    <td className={`p-2 text-right font-bold ${profit >= 0 ? 'text-blue-700' : 'text-yellow-600'}`}>€{profit.toLocaleString('it-IT')}</td>
                                </tr>
                           )})}</tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default FinancialAnalysisScreen;