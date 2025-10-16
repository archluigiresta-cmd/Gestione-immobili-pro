
import React, { useState, useEffect } from 'react';
import { DollarSign, Building, AlertTriangle, CheckCircle, Clock, Settings, Wrench } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Deadline, Property, Expense, Maintenance, MaintenanceStatus, ExpenseCategory } from '../types';
// FIX: Corrected import path to point to App.tsx inside the src directory.
import { Screen } from '../src/App';
import CustomizeDashboardModal from '../components/modals/CustomizeDashboardModal';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => (
  <div onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
    <Card className="p-4 h-full">
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
  </div>
);

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
            {upcomingDeadlinesList.map((deadline: Deadline) => {
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
            )})}
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
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recentExpensesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `€${value.toLocaleString('it-IT')}`}/>
                <Bar dataKey="importo" fill="#1E40AF" />
            </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

const MaintenanceRequestsWidget: React.FC<WidgetProps> = ({ projectId }) => {
    const maintenances = dataService.getMaintenances(projectId);
    const openRequests = maintenances.filter(m => m.status !== MaintenanceStatus.COMPLETED).slice(0, 5);
    return (
        <Card className="p-4">
            <h2 className="text-lg font-bold text-dark mb-4">Manutenzioni Aperte</h2>
            <ul>
                {openRequests.map(m => (
                    <li key={m.id} className="flex items-start justify-between py-2 border-b last:border-b-0">
                        <div>
                            <p className="font-semibold text-dark">{m.description}</p>
                            <p className="text-sm text-gray-500">{dataService.getProperty(projectId, m.propertyId)?.name}</p>
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
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => `€${value.toLocaleString('it-IT')}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};

export const availableDashboardWidgets = [
    { id: 'upcomingDeadlines', name: 'Prossime Scadenze', component: UpcomingDeadlinesWidget },
    { id: 'recentExpenses', name: 'Spese Recenti (Grafico)', component: RecentExpensesWidget },
    { id: 'maintenanceRequests', name: 'Richieste di Manutenzione', component: MaintenanceRequestsWidget },
    { id: 'expensesSummary', name: 'Riepilogo Spese (Torta)', component: ExpensesSummaryWidget },
];

interface DashboardScreenProps {
  onNavigate: (screen: Screen) => void;
  projectId: string;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate, projectId }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isCustomizeModalOpen, setCustomizeModalOpen] = useState(false);
  
  const [activeWidgets, setActiveWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboardWidgets');
    return saved ? JSON.parse(saved) : ['upcomingDeadlines', 'recentExpenses'];
  });

  useEffect(() => {
    setProperties(dataService.getProperties(projectId));
    setDeadlines(dataService.getDeadlines(projectId)); 
  }, [projectId]);

  const totalRent = properties.reduce((acc, p) => acc + (p.isRented && p.rentAmount ? p.rentAmount : 0), 0);
  const occupancyRate = properties.length > 0 ? (properties.filter(p => p.isRented).length / properties.length) * 100 : 0;
  const upcomingDeadlinesCount = deadlines.filter(d => !d.isCompleted && new Date(d.dueDate) >= new Date()).length;
  
  const handleSaveWidgets = (selectedWidgets: string[]) => {
    setActiveWidgets(selectedWidgets);
    localStorage.setItem('dashboardWidgets', JSON.stringify(selectedWidgets));
    setCustomizeModalOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
        <button
          onClick={() => setCustomizeModalOpen(true)}
          className="flex items-center px-3 py-2 bg-white text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-sm border"
        >
          <Settings size={16} className="mr-2" />
          Personalizza
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Entrate Mensili Stimate" value={`€ ${totalRent.toLocaleString('it-IT')}`} icon={<DollarSign className="text-white"/>} color="bg-green-500" onClick={() => onNavigate('payments')} />
        <StatCard title="Immobili Occupati" value={`${occupancyRate.toFixed(0)}%`} icon={<Building className="text-white"/>} color="bg-blue-500" onClick={() => onNavigate('properties')} />
        <StatCard title="Scadenze Prossime" value={upcomingDeadlinesCount} icon={<AlertTriangle className="text-white"/>} color="bg-yellow-500" onClick={() => onNavigate('deadlines')} />
        <StatCard title="Task Completati" value={deadlines.filter(d => d.isCompleted).length} icon={<CheckCircle className="text-white"/>} color="bg-indigo-500" onClick={() => onNavigate('deadlines')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeWidgets.map(widgetId => {
            const widget = availableDashboardWidgets.find(w => w.id === widgetId);
            if (!widget) return null;
            const WidgetComponent = widget.component;
            return <WidgetComponent key={widgetId} projectId={projectId} />;
        })}
      </div>
      
      <CustomizeDashboardModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setCustomizeModalOpen(false)}
        onSave={handleSaveWidgets}
        currentWidgets={activeWidgets}
      />
    </div>
  );
};

export default DashboardScreen;