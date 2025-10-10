
import React from 'react';
import Card from '../components/ui/Card';
import { MOCK_DEADLINES, MOCK_PROPERTIES } from '../constants';
import { Deadline, DeadlineType } from '../types';
import { Calendar, Check, AlertCircle, PlusCircle } from 'lucide-react';

const DeadlinesScreen: React.FC = () => {
  const getPropertyName = (id: string) => MOCK_PROPERTIES.find(p => p.id === id)?.name || 'N/A';
  
  const getDeadlineTypeStyle = (type: DeadlineType) => {
    switch(type) {
      case DeadlineType.RENT: return 'bg-blue-100 text-blue-800';
      case DeadlineType.TAX: return 'bg-red-100 text-red-800';
      case DeadlineType.MAINTENANCE: return 'bg-yellow-100 text-yellow-800';
      case DeadlineType.CONTRACT: return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedDeadlines = [...MOCK_DEADLINES].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Scadenze</h1>
        <button
          onClick={() => alert("Funzionalità 'Aggiungi Scadenza' da implementare.")}
          className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
        >
          <PlusCircle size={18} className="mr-2" />
          Aggiungi Scadenza
        </button>
      </div>
      <div className="space-y-4">
        {sortedDeadlines.map((deadline: Deadline) => {
          const isOverdue = !deadline.isCompleted && new Date(deadline.dueDate) < new Date();
          return (
            <div key={deadline.id} className={`flex items-center justify-between p-4 rounded-lg ${deadline.isCompleted ? 'bg-gray-50 opacity-60' : 'bg-white shadow-sm'}`}>
              <div className="flex items-center">
                <div className={`mr-4 p-2 rounded-full ${deadline.isCompleted ? 'bg-gray-200' : isOverdue ? 'bg-red-100' : 'bg-green-100'}`}>
                    {deadline.isCompleted ? <Check className="text-gray-500" /> : isOverdue ? <AlertCircle className="text-red-500" /> : <Calendar className="text-green-500" />}
                </div>
                <div>
                  <p className={`font-bold ${deadline.isCompleted ? 'text-gray-500 line-through' : 'text-dark'}`}>{deadline.title}</p>
                  <p className="text-sm text-gray-500">{getPropertyName(deadline.propertyId)} - {new Date(deadline.dueDate).toLocaleDateString('it-IT')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDeadlineTypeStyle(deadline.type)}`}>
                  {deadline.type}
                </span>
                <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${deadline.isCompleted ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                  {deadline.isCompleted && <Check size={16} className="text-white"/>}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  );
};

export default DeadlinesScreen;
