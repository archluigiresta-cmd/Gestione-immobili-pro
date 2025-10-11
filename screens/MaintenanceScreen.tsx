import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Maintenance, MaintenanceStatus, User } from '../types';
import { PlusCircle, Edit, Trash2, Wrench, Clock, CheckCircle } from 'lucide-react';
import AddMaintenanceModal from '../components/modals/AddMaintenanceModal';
import EditMaintenanceModal from '../components/modals/EditMaintenanceModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

interface MaintenanceScreenProps {
  projectId: string;
  user: User;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ projectId, user }) => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [deletingMaintenance, setDeletingMaintenance] = useState<Maintenance | null>(null);

  useEffect(() => {
    loadMaintenances();
  }, [projectId]);

  const loadMaintenances = () => {
    setMaintenances(dataService.getMaintenances(projectId));
  };

  const getPropertyName = (id: string) => dataService.getProperties(projectId).find(p => p.id === id)?.name || 'N/A';
  
  const handleAddMaintenance = (data: Omit<Maintenance, 'id' | 'history'>) => {
    dataService.addMaintenance({ ...data, projectId }, user.id);
    loadMaintenances();
    setAddModalOpen(false);
  };
  
  const handleUpdateMaintenance = (updatedMaintenance: Maintenance) => {
    dataService.updateMaintenance(updatedMaintenance, user.id);
    loadMaintenances();
    setEditingMaintenance(null);
  };
  
  const handleDeleteMaintenance = () => {
    if (deletingMaintenance) {
      dataService.deleteMaintenance(deletingMaintenance.id);
      loadMaintenances();
      setDeletingMaintenance(null);
    }
  };

  const getStatusInfo = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.REQUESTED:
        return { badge: 'bg-yellow-100 text-yellow-800', icon: <Wrench size={16} className="text-yellow-600" /> };
      case MaintenanceStatus.IN_PROGRESS:
        return { badge: 'bg-blue-100 text-blue-800', icon: <Clock size={16} className="text-blue-600" /> };
      case MaintenanceStatus.COMPLETED:
        return { badge: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} className="text-green-600" /> };
      default:
        return { badge: 'bg-gray-100 text-gray-800', icon: null };
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-dark">Registro Manutenzioni</h1>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
          >
            <PlusCircle size={18} className="mr-2" />
            Nuova Richiesta
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-600">Descrizione</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Immobile</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Data Richiesta</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Stato</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-right">Costo</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.map(m => {
                const statusInfo = getStatusInfo(m.status);
                return (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-dark font-medium">{m.description}</td>
                    <td className="p-3 text-gray-700">{getPropertyName(m.propertyId)}</td>
                    <td className="p-3 text-gray-700">{new Date(m.requestDate).toLocaleDateString('it-IT')}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.badge}`}>
                        {statusInfo.icon && <span className="mr-1.5">{statusInfo.icon}</span>}
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-semibold text-dark">
                        {m.cost ? `€${m.cost.toLocaleString('it-IT')}` : '---'}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center items-center gap-4">
                        <button onClick={() => setEditingMaintenance(m)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                        <button onClick={() => setDeletingMaintenance(m)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      
      <AddMaintenanceModal 
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddMaintenance}
        projectId={projectId}
      />
      {editingMaintenance && (
        <EditMaintenanceModal
          isOpen={!!editingMaintenance}
          onClose={() => setEditingMaintenance(null)}
          onSave={handleUpdateMaintenance}
          maintenance={editingMaintenance}
          projectId={projectId}
        />
      )}
      {deletingMaintenance && (
        <ConfirmDeleteModal
          isOpen={!!deletingMaintenance}
          onClose={() => setDeletingMaintenance(null)}
          onConfirm={handleDeleteMaintenance}
          message={`Sei sicuro di voler eliminare la richiesta di manutenzione "${deletingMaintenance.description}"?`}
        />
      )}
    </>
  );
};

export default MaintenanceScreen;