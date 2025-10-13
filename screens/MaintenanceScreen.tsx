import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Maintenance, MaintenanceStatus, User, Property } from '../types';
import { PlusCircle, Edit, Trash2, Wrench, Clock, CheckCircle, ChevronDown } from 'lucide-react';
import AddMaintenanceModal from '../components/modals/AddMaintenanceModal';
import EditMaintenanceModal from '../components/modals/EditMaintenanceModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import InteractiveTable, { Column } from '../components/ui/InteractiveTable';

interface MaintenanceScreenProps {
  projectId: string;
  user: User;
}

const getPropertyColors = (index: number) => {
    const colors = [
        'border-yellow-500', 'border-red-500', 'border-teal-500', 'border-blue-500',
        'border-green-500', 'border-indigo-500', 'border-purple-500', 'border-pink-500'
    ];
    return colors[index % colors.length];
};

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ projectId, user }) => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [deletingMaintenance, setDeletingMaintenance] = useState<Maintenance | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

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

  const toggleSection = (propertyId: string) => {
    setOpenSections(prev => {
        const newSet = new Set(prev);
        if (newSet.has(propertyId)) {
            newSet.delete(propertyId);
        } else {
            newSet.add(propertyId);
        }
        return newSet;
    });
  };

  const groupedMaintenances = useMemo(() => {
    return maintenances.reduce<Record<string, Maintenance[]>>((acc, item) => {
        (acc[item.propertyId] = acc[item.propertyId] || []).push(item);
        return acc;
    }, {});
  }, [maintenances]);

  const columns: Column<Maintenance>[] = [
      { header: 'Descrizione', accessor: 'description', className: 'font-medium text-dark' },
      { header: 'Data Richiesta', accessor: 'requestDate', render: (row) => new Date(row.requestDate).toLocaleDateString('it-IT') },
      { header: 'Stato', accessor: 'status', render: (row) => {
          const statusInfo = getStatusInfo(row.status);
          return (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.badge}`}>
                  {statusInfo.icon && <span className="mr-1.5">{statusInfo.icon}</span>}
                  {row.status}
              </span>
          );
      }},
      { header: 'Costo', accessor: 'cost', render: (row) => row.cost ? `€${row.cost.toLocaleString('it-IT')}` : '---', className: 'text-right font-semibold' },
      { header: 'Azioni', accessor: 'id', render: (row) => (
          <div className="flex justify-center items-center gap-4">
              <button onClick={() => setEditingMaintenance(row)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
              <button onClick={() => setDeletingMaintenance(row)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
          </div>
      ), className: 'text-center' },
  ];
  
  const propertyMap = useMemo(() => new Map(properties.map(p => [p.id, p.name])), [properties]);

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
        <div className="space-y-4">
            {Object.entries(groupedMaintenances).map(([propertyId, items], index) => {
              const propertyName = propertyMap.get(propertyId) || 'Immobile non trovato';
              const isOpen = openSections.has(propertyId);
              return (
                  <div key={propertyId} className={`rounded-lg overflow-hidden border-l-4 ${getPropertyColors(index)} bg-white shadow-sm`}>
                      <button onClick={() => toggleSection(propertyId)} className={`w-full flex justify-between items-center p-4 text-left font-bold text-lg ${isOpen ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          <span>{propertyName} <span className="text-sm font-medium text-gray-500">({items.length} richieste)</span></span>
                          <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                          <div className="p-2 bg-white">
                              <InteractiveTable columns={columns} data={items} />
                          </div>
                      )}
                  </div>
              );
            })}
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