

import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Contract, ProjectMemberRole, User, Property, Tenant } from '../types';
import { Download, PlusCircle, Edit, Trash2 } from 'lucide-react';
import AddContractModal from '../components/modals/AddContractModal';
import EditContractModal from '../components/modals/EditContractModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import AccordionItem from '../components/ui/AccordionItem';

interface ContractsScreenProps {
  projectId: string;
  user: User;
  userRole: ProjectMemberRole;
}

type EnrichedContract = Contract & {
    propertyName: string;
    tenantName: string;
};


const ContractsScreen: React.FC<ContractsScreenProps> = ({ projectId, user, userRole }) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);

  const isViewer = userRole === ProjectMemberRole.VIEWER;

  useEffect(() => {
    loadContracts();
  }, [projectId]);

  const loadContracts = () => {
    setContracts(dataService.getContracts(projectId));
    setProperties(dataService.getProperties(projectId));
    setTenants(dataService.getTenants(projectId));
  };
  
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

  const groupedContracts = useMemo(() => {
      const propertyMap = new Map(properties.map(p => [p.id, p.name]));
      const tenantMap = new Map(tenants.map(t => [t.id, t.name]));

      const enriched = contracts.map(contract => ({
          ...contract,
          propertyName: propertyMap.get(contract.propertyId) || 'N/A',
          tenantName: tenantMap.get(contract.tenantId) || 'N/A',
      }));

      return enriched.reduce((acc, contract) => {
          const key = contract.propertyId;
          if (!acc[key]) {
              acc[key] = [];
          }
          acc[key].push(contract);
          return acc;
      }, {} as Record<string, EnrichedContract[]>);
  }, [contracts, properties, tenants]);


  return (
    <>
    <div className="space-y-6">
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
        {properties.filter(p => groupedContracts[p.id]).map(property => {
          const propertyContracts = groupedContracts[property.id];
          const title = (
              <div className="flex items-center gap-3">
                  <span>{property.name}</span>
                  <span className="text-sm bg-gray-200 text-gray-700 font-bold px-2.5 py-1 rounded-full">{propertyContracts.length}</span>
              </div>
          );
          return (
            <AccordionItem key={property.id} title={title}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-sm font-semibold text-gray-600">Inquilino</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Inizio</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Fine</th>
                      <th className="p-3 text-sm font-semibold text-gray-600">Canone</th>
                      <th className="p-3 text-sm font-semibold text-gray-600 text-center">Documento</th>
                      <th className="p-3 text-sm font-semibold text-gray-600 text-center">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertyContracts.map(row => (
                      <tr key={row.id} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="p-3 font-medium text-dark">{row.tenantName}</td>
                        <td className="p-3 text-gray-700">{new Date(row.startDate).toLocaleDateString('it-IT')}</td>
                        <td className="p-3 text-gray-700">{new Date(row.endDate).toLocaleDateString('it-IT')}</td>
                        <td className="p-3 font-semibold text-gray-800">€{row.rentAmount.toLocaleString('it-IT')}</td>
                        <td className="p-3 text-center">
                            <a href={row.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-primary hover:text-primary-hover">
                                <Download size={20} />
                            </a>
                        </td>
                        <td className="p-3 text-center">
                            <div className="flex justify-center items-center gap-4">
                                <button onClick={() => setEditingContract(row)} className="text-blue-600 hover:text-blue-800 disabled:text-gray-400" disabled={isViewer}><Edit size={18} /></button>
                                <button onClick={() => setDeletingContract(row)} className="text-red-600 hover:text-red-800 disabled:text-gray-400" disabled={isViewer}><Trash2 size={18} /></button>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionItem>
          )
        })}
        {Object.keys(groupedContracts).length === 0 && (
            <Card className="p-8 text-center text-gray-500">
                Nessun contratto trovato.
            </Card>
        )}
      </div>

    </div>

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
        message={`Sei sicuro di voler eliminare il contratto per l'immobile "${properties.find(p=>p.id === deletingContract.propertyId)?.name}"?`}
      />
    )}
    </>
  );
};

export default ContractsScreen;
