import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Contract } from '../types';
import { Download, PlusCircle, Edit, Trash2 } from 'lucide-react';
import AddContractModal from '../components/modals/AddContractModal';
import EditContractModal from '../components/modals/EditContractModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';


const ContractsScreen: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = () => {
    setContracts(dataService.getContracts());
  };
  
  const getPropertyName = (id: string) => dataService.getProperties().find(p => p.id === id)?.name || 'N/A';
  const getTenantName = (id: string) => dataService.getTenants().find(t => t.id === id)?.name || 'N/A';

  const handleAddContract = (contractData: Omit<Contract, 'id' | 'documentUrl'>) => {
    dataService.addContract(contractData);
    loadContracts();
    setAddModalOpen(false);
  };

  const handleUpdateContract = (updatedContract: Contract) => {
    dataService.updateContract(updatedContract);
    loadContracts();
    setEditingContract(null);
  };
  
  const handleDeleteContract = () => {
    if (deletingContract) {
      dataService.deleteContract(deletingContract.id);
      loadContracts();
      setDeletingContract(null);
    }
  };

  return (
    <>
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Gestione Contratti</h1>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
        >
          <PlusCircle size={18} className="mr-2" />
          Nuovo Contratto
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-sm font-semibold text-gray-600">Immobile</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Inquilino</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Inizio</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Fine</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Canone</th>
              <th className="p-3 text-sm font-semibold text-gray-600 text-center">Documento</th>
              <th className="p-3 text-sm font-semibold text-gray-600 text-center">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract: Contract) => (
              <tr key={contract.id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-dark font-medium">{getPropertyName(contract.propertyId)}</td>
                <td className="p-3 text-gray-700">{getTenantName(contract.tenantId)}</td>
                <td className="p-3 text-gray-700">{new Date(contract.startDate).toLocaleDateString('it-IT')}</td>
                <td className="p-3 text-gray-700">{new Date(contract.endDate).toLocaleDateString('it-IT')}</td>
                <td className="p-3 text-gray-700 font-semibold">€{contract.rentAmount.toLocaleString('it-IT')}</td>
                <td className="p-3 text-center">
                  <a href={contract.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-primary hover:text-primary-hover">
                    <Download size={20} />
                  </a>
                </td>
                <td className="p-3 text-center">
                    <div className="flex justify-center items-center gap-4">
                        <button onClick={() => setEditingContract(contract)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                        <button onClick={() => setDeletingContract(contract)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>

    <AddContractModal 
      isOpen={isAddModalOpen}
      onClose={() => setAddModalOpen(false)}
      onSave={handleAddContract}
    />
    {editingContract && (
      <EditContractModal
        isOpen={!!editingContract}
        onClose={() => setEditingContract(null)}
        onSave={handleUpdateContract}
        contract={editingContract}
      />
    )}
    {deletingContract && (
      <ConfirmDeleteModal
        isOpen={!!deletingContract}
        onClose={() => setDeletingContract(null)}
        onConfirm={handleDeleteContract}
        message={`Sei sicuro di voler eliminare il contratto per l'immobile "${getPropertyName(deletingContract.propertyId)}"?`}
      />
    )}
    </>
  );
};

export default ContractsScreen;
