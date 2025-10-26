import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import * as dataService from '@/services/dataService';
import { Deadline, Maintenance, MaintenanceStatus, ExpenseCategory, Property } from '@/types';

interface WidgetProps {
  projectId: string;
}

// Widget Components
const UpcomingDeadlinesWidget: React.FC<WidgetProps> = ({ projectId }) => {
    const deadlines = dataService.getDeadlines(projectId);
    const upcomingDeadlinesList = deadlines
    .filter(d => !d.isCompleted)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);
    
  const getDaysDiff = (dueDate: string) => {
      const diff = new Date(dueDate).getTime() - new Date().getTime();
      return Math.ceil(diff / (1000 * 3600 * 24));
  }

    return (
        <Card className="p-4">
          <h2 className="text-lg font-bold text-dark mb-4">Prossime Scadenze</h2>
          <ul>
            {upcomingDeadlinesList.length > 0 ? upcomingDeadlinesList.map((deadline: Deadline) => {
              const daysLeft = getDaysDiff(deadline.dueDate);
              const isOverdue = daysLeft < 0;
              const urgencyColor = isOverdue ? 'text-red-500' : daysLeft < 7 ? 'text-yellow-600' : 'text-green-600';
              return (
              <li key={deadline.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="font-semibold text-dark">{deadline.title}</p>
                  <p className="text-sm text-gray-500">{new Date(deadline.dueDate).toLocaleDateString('it-IT')}</p>
                </div>
                <div className={`flex items-center font-bold text-sm ${urgencyColor}`}>
                   <Clock size={14} className="mr-1" />
                  {isOverdue ? `Scaduto` : `${daysLeft} gg`}
                </div>
              </li>
            )}) : <p className="text-sm text-gray-500 text-center py-4">Nessuna scadenza imminente.</p>}
          </ul>
        </Card>
    );
};

const RecentExpensesWidget: React.FC<WidgetProps> = ({ projectId }) => {
    const expenses = dataService.getExpenses(projectId);
    const recentExpensesData = expenses.slice(-6).map(e => ({
        name: e.description.substring(0, 15) + (e.description.length > 15 ? '...' : ''),
        importo: e.amount,
    }));

    return (
        <Card className="p-4">
            <h2 className="text-lg font-bold text-dark mb-4">Spese Recenti</h2>
            {recentExpensesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recentExpensesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `€${value.toLocaleString('it-IT')}`}/>
                    <Bar dataKey="importo" fill="#1E40AF" />
                </BarChart>
                </ResponsiveContainer>
            ) : <p className="text-sm text-gray-500 text-center py-4">Nessuna spesa recente.</p>}
        </Card>
    );
};

const MaintenanceRequestsWidget: React.FC<WidgetProps> = ({ projectId }) => {
    const maintenances = dataService.getMaintenances(projectId);
    const openRequests = maintenances.filter(m => m.status !== MaintenanceStatus.COMPLETED).slice(0, 5);
    
    const getPropertyName = (propertyId: string): string => {
        const properties = dataService.getProperties(projectId);
        const property = properties.find(p => p.id === propertyId);
        return property?.name || 'N/D';
    }

    return (
        <Card className="p-4">
            <h2 className="text-lg font-bold text-dark mb-4">Manutenzioni Aperte</h2>
            <ul>
                {openRequests.map(m => (
                    <li key={m.id} className="flex items-start justify-between py-2 border-b last:border-b-0">
                        <div>
                            <p className="font-semibold text-dark">{m.description}</p>
                            <p className="text-sm text-gray-500">{getPropertyName(m.propertyId)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${m.status === MaintenanceStatus.REQUESTED ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                            {m.status}
                        </span>
                    </li>
                ))}
            </ul>
            {openRequests.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Nessuna richiesta aperta.</p>}
        </Card>
    );
}

const ExpensesSummaryWidget: React.FC<WidgetProps> = ({ projectId }) => {
    const expenses = dataService.getExpenses(projectId);
    const expensesByCategory = expenses.reduce((acc, expense) => {
        if (!acc[expense.category]) acc[expense.category] = 0;
        acc[expense.category] += expense.amount;
        return acc;
    }, {} as Record<ExpenseCategory, number>);

    const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    return (
        <Card className="p-4">
            <h2 className="text-lg font-bold text-dark mb-4">Spese per Categoria</h2>
             {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => `€${value.toLocaleString('it-IT')}`}/>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            ) : <p className="text-sm text-gray-500 text-center py-4">Nessuna spesa da categorizzare.</p>}
        </Card>
    );
};

export const availableDashboardWidgets = [
    { id: 'upcomingDeadlines', name: 'Prossime Scadenze', component: UpcomingDeadlinesWidget },
    { id: 'recentExpenses', name: 'Spese Recenti (Grafico)', component: RecentExpensesWidget },
    { id: 'maintenanceRequests', name: 'Richieste di Manutenzione', component: MaintenanceRequestsWidget },
    { id: 'expensesSummary', name: 'Riepilogo Spese (Torta)', component: ExpensesSummaryWidget },
];
