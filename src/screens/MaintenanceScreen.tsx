
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Maintenance, MaintenanceStatus, User, Property } from '../types';
import { PlusCircle, Edit, Trash2, Wrench, Clock, CheckCircle } from 'lucide-react';
import AddMaintenanceModal from '../components/modals/AddMaintenanceModal';
import EditMaintenanceModal from '../components/modals/EditMaintenanceModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import AccordionItem from '../components/ui/AccordionItem';

interface MaintenanceScreenProps {
  projectId: string;
  user: User;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ projectId, user }) => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [deletingMaintenance, setDeletingMaintenance] = useState<Maintenance | null>(null);

  useEffect(() => {
    loadMaintenances();
  }, [projectId]);

  const loadMaintenances = () => {
    setMaintenances(dataService.getMaintenances(projectId));
    setProperties(dataService.getProperties(projectId));
  };
  
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

 const groupedMaintenances = useMemo(() => {
    return maintenances.reduce((acc, maint) => {
        const key = maint.propertyId;
        if(!acc[key]) acc[key] = [];
        acc[key].push(maint);
        return acc;
    }, {} as Record<string, Maintenance[]>);
 }, [maintenances]);
  
  return (
    <>
      <div className="space-y-6">
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

        <div className="space-y-4">
            {properties.filter(p => groupedMaintenances[p.id]?.length > 0).map(property => {
                const propertyMaint = groupedMaintenances[property.id];
                 const title = (
                  <div className="flex items-center gap-3">
                      <span>{property.name}</span>
                      <span className="text-sm bg-gray-200 text-gray-700 font-bold px-2.5 py-1 rounded-full">{propertyMaint.length}</span>
                  </div>
                );
                return (
                    <AccordionItem key={property.id} title={title}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Descrizione</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Data Richiesta</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Stato</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600 text-right">Costo</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600 text-center">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {propertyMaint.map(row => {
                                        const statusInfo = getStatusInfo(row.status);
                                        return (
                                            <tr key={row.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                                <td className="p-3 font-medium text-dark">{row.description}</td>
                                                <td className="p-3 text-gray-700">{new Date(row.requestDate).toLocaleDateString('it-IT')}</td>
                                                <td className="p-3">
                                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.badge}`}>
                                                        {statusInfo.icon && <span className="mr-1.5">{statusInfo.icon}</span>}
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right font-semibold text-gray-800">{row.cost ? `€${row.cost.toLocaleString('it-IT')}` : '---'}</td>
                                                <td className="p-3 text-center">
                                                    <div className="flex justify-center items-center gap-4">
                                                        <button onClick={() => setEditingMaintenance(row)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                                        <button onClick={() => setDeletingMaintenance(row)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </AccordionItem>
                )
            })}
             {Object.keys(groupedMaintenances).length === 0 && (
                <Card className="p-8 text-center text-gray-500">
                    Nessuna richiesta di manutenzione trovata.
                </Card>
            )}
        </div>
      </div>
      
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
