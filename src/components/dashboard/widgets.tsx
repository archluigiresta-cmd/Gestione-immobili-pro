import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import * as dataService from '../../services/dataService';
import { Deadline, Expense, Property } from '../../types';

interface WidgetProps {
  projectId: string;
}

const UpcomingDeadlinesWidget: React.FC<WidgetProps> = ({ projectId }) => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);


  useEffect(() => {
    const allDeadlines = dataService.getDeadlines(projectId);
    setProperties(dataService.getProperties(projectId));
    const upcoming = allDeadlines
      .filter(d => !d.isCompleted && new Date(d.dueDate) >= new Date())
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
    setDeadlines(upcoming);
  }, [projectId]);
  
  const getPropertyName = (propertyId: string) => {
    return properties.find(p => p.id === propertyId)?.name || 'N/A';
  }

  return (
    <Card className="h-full">
      <div className="p-4">
        <h2 className="text-lg font-bold text-dark mb-4">Prossime Scadenze</h2>
        <div className="space-y-3">
          {deadlines.length > 0 ? deadlines.map(d => (
            <div key={d.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div>
                <p className="font-semibold text-dark">{d.title}</p>
                <p className="text-sm text-gray-500">{getPropertyName(d.propertyId)}</p>
              </div>
              <div className="text-right">
                 <p className="font-semibold text-yellow-600">{new Date(d.dueDate).toLocaleDateString('it-IT')}</p>
              </div>
            </div>
          )) : <p className="text-sm text-gray-500 text-center py-8">Nessuna scadenza imminente.</p>}
        </div>
      </div>
    </Card>
  );
};

const RecentExpensesWidget: React.FC<WidgetProps> = ({ projectId }) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);

    useEffect(() => {
        const allExpenses = dataService.getExpenses(projectId);
        const recent = allExpenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
        setExpenses(recent);
    }, [projectId]);

    return (
        <Card className="h-full">
            <div className="p-4">
                <h2 className="text-lg font-bold text-dark mb-4">Spese Recenti</h2>
                <div className="space-y-3">
                    {expenses.length > 0 ? expenses.map(e => (
                         <div key={e.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div>
                                <p className="font-semibold text-dark">{e.description}</p>
                                <p className="text-sm text-gray-500">{e.category}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-red-600">€{e.amount.toLocaleString('it-IT')}</p>
                                <p className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString('it-IT')}</p>
                            </div>
                        </div>
                    )) : <p className="text-sm text-gray-500 text-center py-8">Nessuna spesa recente.</p>}
                </div>
            </div>
        </Card>
    );
}

export const availableDashboardWidgets = [
  { id: 'upcomingDeadlines', name: 'Prossime Scadenze', component: UpcomingDeadlinesWidget },
  { id: 'recentExpenses', name: 'Spese Recenti', component: RecentExpensesWidget },
];
