
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Deadline, DeadlineType } from '../types';
import { PlusCircle, Edit, Trash2, CheckCircle } from 'lucide-react';
import AddDeadlineModal from '../components/modals/AddDeadlineModal';
import EditDeadlineModal from '../components/modals/EditDeadlineModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

const DeadlinesScreen: React.FC = () => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [deletingDeadline, setDeletingDeadline] = useState<Deadline | null>(null);

  useEffect(() => {
    loadDeadlines();
  }, []);

  const loadDeadlines = () => {
    setDeadlines(dataService.getDeadlines().sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  };

  const getPropertyName = (id: string) => dataService.getProperties().find(p => p.id === id)?.name || 'N/A';
  
  const handleAddDeadline = (deadlineData: Omit<Deadline, 'id' | 'isCompleted'>) => {
    dataService.addDeadline(deadlineData);
    loadDeadlines();
    setAddModalOpen(false);
  };
  
  const handleUpdateDeadline = (updatedDeadline: Deadline) => {
    dataService.updateDeadline(updatedDeadline);
    loadDeadlines();
    setEditingDeadline(null);
  };
  
  const handleDeleteDeadline = () => {
    if (deletingDeadline) {
      dataService.deleteDeadline(deletingDeadline.id);
      loadDeadlines();
      setDeletingDeadline(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    dataService.toggleDeadlineStatus(id);
    loadDeadlines();
  };

  const getDaysDiff = (dueDate: string) => {
      const diff = new Date(dueDate).getTime() - new Date().getTime();
      return Math.ceil(diff / (1000 * 3600 * 24));
  }

  const getDeadlineTypeStyle = (type: DeadlineType) => {
    switch (type) {
      case DeadlineType.RENT: return 'bg-blue-100 text-blue-800';
      case DeadlineType.TAX: return 'bg-red-100 text-red-800';
      case DeadlineType.MAINTENANCE: return 'bg-yellow-100 text-yellow-800';
      case DeadlineType.CONTRACT: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-dark">Gestione Scadenze</h1>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
          >
            <PlusCircle size={18} className="mr-2" />
            Nuova Scadenza
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-600">Stato</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Scadenza</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Titolo</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Immobile</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map(d => {
                const daysLeft = getDaysDiff(d.dueDate);
                const isOverdue = !d.isCompleted && daysLeft < 0;
                const urgencyColor = isOverdue ? 'text-red-500' : daysLeft < 7 ? 'text-yellow-600' : 'text-gray-600';

                return (
                  <tr key={d.id} className={`border-b hover:bg-gray-50 ${d.isCompleted ? 'bg-green-50' : ''}`}>
                    <td className="p-3 text-center">
                      <button onClick={() => handleToggleStatus(d.id)} className={`p-2 rounded-full ${d.isCompleted ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}>
                          <CheckCircle size={20} />
                      </button>
                    </td>
                    <td className={`p-3 font-medium ${urgencyColor}`}>
                        {new Date(d.dueDate).toLocaleDateString('it-IT')}
                        {!d.isCompleted && <span className="text-xs block">{isOverdue ? `Scaduto da ${Math.abs(daysLeft)} gg` : `Mancano ${daysLeft} gg`}</span>}
                    </td>
                    <td className="p-3 text-dark font-medium">{d.title}</td>
                    <td className="p-3 text-gray-700">{getPropertyName(d.propertyId)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDeadlineTypeStyle(d.type)}`}>
                        {d.type}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center items-center gap-4">
                          <button onClick={() => setEditingDeadline(d)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                          <button onClick={() => setDeletingDeadline(d)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <AddDeadlineModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddDeadline}
      />
      {editingDeadline && (
        <EditDeadlineModal
          isOpen={!!editingDeadline}
          onClose={() => setEditingDeadline(null)}
          onSave={handleUpdateDeadline}
          deadline={editingDeadline}
        />
      )}
      {deletingDeadline && (
        <ConfirmDeleteModal
          isOpen={!!deletingDeadline}
          onClose={() => setDeletingDeadline(null)}
          onConfirm={handleDeleteDeadline}
          message={`Sei sicuro di voler eliminare la scadenza "${deletingDeadline.title}"?`}
        />
      )}
    </>
  );
};

export default DeadlinesScreen;
