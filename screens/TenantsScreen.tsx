
import React from 'react';
import Card from '../components/ui/Card';
import { MOCK_TENANTS, MOCK_CONTRACTS, MOCK_PROPERTIES } from '../constants';
import { Tenant } from '../types';
import { Mail, Phone, Home, PlusCircle } from 'lucide-react';

const TenantsScreen: React.FC = () => {
    
    const getPropertyByContract = (contractId: string) => {
        const contract = MOCK_CONTRACTS.find(c => c.id === contractId);
        if(!contract) return 'Nessun immobile associato';
        return MOCK_PROPERTIES.find(p => p.id === contract.propertyId)?.name || 'N/A';
    }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Elenco Inquilini</h1>
        <button
          onClick={() => alert("Funzionalità 'Aggiungi Inquilino' da implementare.")}
          className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
        >
          <PlusCircle size={18} className="mr-2" />
          Aggiungi Inquilino
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TENANTS.map((tenant: Tenant) => (
          <div key={tenant.id} className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-primary">{tenant.name}</h3>
            <p className="text-sm text-gray-600 flex items-center mt-2"><Home size={14} className="mr-2" /> {getPropertyByContract(tenant.contractId)}</p>
            <div className="mt-4 space-y-2">
                <a href={`mailto:${tenant.email}`} className="flex items-center text-gray-700 hover:text-primary">
                    <Mail size={14} className="mr-2" />
                    <span>{tenant.email}</span>
                </a>
                <a href={`tel:${tenant.phone}`} className="flex items-center text-gray-700 hover:text-primary">
                    <Phone size={14} className="mr-2" />
                    <span>{tenant.phone}</span>
                </a>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TenantsScreen;
