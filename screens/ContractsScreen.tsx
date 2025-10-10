
import React from 'react';
import Card from '../components/ui/Card';
import { MOCK_CONTRACTS, MOCK_PROPERTIES, MOCK_TENANTS } from '../constants';
import { Contract } from '../types';
import { Download, PlusCircle } from 'lucide-react';

const ContractsScreen: React.FC = () => {
  const getPropertyName = (id: string) => MOCK_PROPERTIES.find(p => p.id === id)?.name || 'N/A';
  const getTenantName = (id: string) => MOCK_TENANTS.find(t => t.id === id)?.name || 'N/A';

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Gestione Contratti</h1>
        <button
          onClick={() => alert("Funzionalità 'Nuovo Contratto' da implementare.")}
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
              <th className="p-3 text-sm font-semibold text-gray-600">Inizio Contratto</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Fine Contratto</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Canone</th>
              <th className="p-3 text-sm font-semibold text-gray-600 text-center">Documento</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CONTRACTS.map((contract: Contract) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ContractsScreen;
