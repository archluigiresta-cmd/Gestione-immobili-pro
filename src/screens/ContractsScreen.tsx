import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Contract, ProjectMemberRole, User, Property } from '../types';
import { Download, PlusCircle, Edit, Trash2, ChevronDown } from 'lucide-react';
import AddContractModal from '../components/modals/AddContractModal';
import EditContractModal from '../components/modals/EditContractModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import InteractiveTable, { Column } from '../components/ui/InteractiveTable';

interface ContractsScreenProps {
  projectId: string;
  user: User;
  userRole: ProjectMemberRole;
}

const getPropertyColors = (index: number) => {
    const colors = [
        'border-blue-500', 'border-green-500', 'border-indigo-500', 'border-purple-500',
        'border-pink-500', 'border-yellow-500', 'border-red-500', 'border-teal-500'
    ];
    return colors[index % colors.length];
};

const ContractsScreen: React.FC<ContractsScreenProps> = ({ projectId, user, userRole }) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const isViewer = userRole === ProjectMemberRole.VIEWER;

  useEffect(() => {
    loadContracts();
  }, [projectId]);

  const loadContracts = () => {
    setContracts(dataService.getContracts(projectId));
    setProperties(dataService.getProperties(projectId));
  };
  
  const getTenantName = (id: string) => dataService.getTenants(projectId).find(t => t.id === id)?.name || 'N/A';

  const handleAddContract = (contractData: Omit<Contract, 'id' | 'documentUrl' | 'projectId' | 'history'>) => {
    dataService.addContract({ ...contractData, projectId }, user.id);
    loadContracts();
    setAddModalOpen(false);
  };

  const handleUpdateContract = (updatedContract: Contract) => {
    dataService.updateContract(updatedContract, user.id);
    loadContracts();
    setEditingContract(null);
  };
  
  const handleDeleteContract = () => {
    if (deletingContract) {
      dataService.deleteContract(deletingContract.id, user.id);
      loadContracts();
      setDeletingContract(null);
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

  const groupedContracts = useMemo(() => {
    return contracts.reduce((acc, contract) => {
        (acc[contract.propertyId] = acc[contract.propertyId] || []).push(contract);
        return acc;
    }, {} as Record<string, Contract[]>);
  }, [contracts]);
  
  const columns: Column<Contract>[] = [
      { header: 'Inquilino', accessor: 'tenantId', render: (row) => getTenantName(row.tenantId) },
      { header: 'Inizio', accessor: 'startDate', render: (row) => new Date(row.startDate).toLocaleDateString('it-IT') },
      { header: 'Fine', accessor: 'endDate', render: (row) => new Date(row.endDate).toLocaleDateString('it-IT') },
      { header: 'Canone', accessor: 'rentAmount', render: (row) => `€${row.rentAmount.toLocaleString('it-IT')}`, className: 'font-semibold' },
      { header: 'Documento', accessor: 'documentUrl', render: (row) => (
          <a href={row.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-primary hover:text-primary-hover">
              <Download size={20} />
          </a>
      ), className: 'text-center' },
      { header: 'Azioni', accessor: 'id', render: (row) => (
          <div className="flex justify-center items-center gap-4">
              <button onClick={() => setEditingContract(row)} className="text-blue-600 hover:text-blue-800 disabled:text-gray-400" disabled={isViewer}><Edit size={18} /></button>
              <button onClick={() => setDeletingContract(row)} className="text-red-600 hover:text-red-800 disabled:text-gray-400" disabled={isViewer}><Trash2 size={18} /></button>
          </div>
      ), className: 'text-center' },
  ];

  const propertyMap = useMemo(() => new Map(properties.map(p => [p.id, p.name])), [properties]);

  return (
    <>
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Gestione Contratti</h1>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isViewer}
        >
          <PlusCircle size={18} className="mr-2" />
          Nuovo Contratto
        </button>
      </div>
      <div className="space-y-4">
        {Object.entries(groupedContracts).map(([propertyId, contractsForProperty], index) => {
            const propertyName = propertyMap.get(propertyId) || 'Immobile non trovato';
            const isOpen = openSections.has(propertyId);
            return (
                <div key={propertyId} className={`rounded-lg overflow-hidden border ${getPropertyColors(index)}`}>
                    <button onClick={() => toggleSection(propertyId)} className={`w-full flex justify-between items-center p-4 text-left font-bold text-lg ${isOpen ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <span>{propertyName} <span className="text-sm font-medium text-gray-500">({contractsForProperty.length} contratti)</span></span>
                        <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                        <div className="p-2 bg-white">
                            <InteractiveTable columns={columns} data={contractsForProperty} />
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </Card>

    <AddContractModal 
      isOpen={isAddModalOpen}
      onClose={() => setAddModalOpen(false)}
      onSave={handleAddContract}
      projectId={projectId}
    />
    {editingContract && (
      <EditContractModal
        isOpen={!!editingContract}
        onClose={() => setEditingContract(null)}
        onSave={handleUpdateContract}
        contract={editingContract}
        projectId={projectId}
      />
    )}
    {deletingContract && (
      <ConfirmDeleteModal
        isOpen={!!deletingContract}
        onClose={() => setDeletingContract(null)}
        onConfirm={handleDeleteContract}
        message={`Sei sicuro di voler eliminare il contratto per l'immobile "${propertyMap.get(deletingContract.propertyId)}"?`}
      />
    )}
    </>
  );
};

export default ContractsScreen;
