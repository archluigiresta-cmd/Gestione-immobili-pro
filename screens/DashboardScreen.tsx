
import React, { useState, useEffect } from 'react';
import { DollarSign, Building, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Deadline, Property, Expense } from '../types';
import { Screen } from '../App';

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

interface DashboardScreenProps {
  onNavigate: (screen: Screen) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    // In a real app, you'd fetch this data. Here we use the service.
    setProperties(dataService.getProperties());
    // Fix: Use dataService to fetch deadlines.
    setDeadlines(dataService.getDeadlines()); 
    setExpenses(dataService.getExpenses());
  }, []);

  const totalRent = properties.reduce((acc, p) => acc + (p.isRented && p.rentAmount ? p.rentAmount : 0), 0);
  const occupancyRate = properties.length > 0 ? (properties.filter(p => p.isRented).length / properties.length) * 100 : 0;
  const upcomingDeadlines = deadlines.filter(d => !d.isCompleted && new Date(d.dueDate) >= new Date()).length;
  
  const recentExpensesData = expenses.slice(-5).map(e => ({
    name: e.description.substring(0, 15) + '...',
    importo: e.amount,
  }));
  
  const upcomingDeadlinesList = deadlines
    .filter(d => !d.isCompleted)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);
    
  const getDaysDiff = (dueDate: string) => {
      const diff = new Date(dueDate).getTime() - new Date().getTime();
      return Math.ceil(diff / (1000 * 3600 * 24));
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Entrate Mensili Stimate" value={`€ ${totalRent.toLocaleString('it-IT')}`} icon={<DollarSign className="text-white"/>} color="bg-green-500" />
        <StatCard title="Immobili Occupati" value={`${occupancyRate.toFixed(0)}%`} icon={<Building className="text-white"/>} color="bg-blue-500" onClick={() => onNavigate('properties')} />
        <StatCard title="Scadenze Prossime" value={upcomingDeadlines} icon={<AlertTriangle className="text-white"/>} color="bg-yellow-500" onClick={() => onNavigate('deadlines')} />
        <StatCard title="Task Completati" value={deadlines.filter(d => d.isCompleted).length} icon={<CheckCircle className="text-white"/>} color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-4">
            <h2 className="text-lg font-bold text-dark mb-4">Spese Recenti</h2>
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recentExpensesData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `€${value.toLocaleString('it-IT')}`}/>
                <Legend />
                <Bar dataKey="importo" fill="#1E40AF" />
            </BarChart>
            </ResponsiveContainer>
        </Card>
        
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
                  {isOverdue ? `Scaduto da ${Math.abs(daysLeft)} gg` : `${daysLeft} gg`}
                </div>
              </li>
            )})}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default DashboardScreen;
