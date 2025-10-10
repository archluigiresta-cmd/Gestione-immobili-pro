
import React, { useState, useEffect } from 'react';
import { Property, Tenant, Contract } from '../types';
import * as dataService from '../services/dataService';
import Card from '../components/ui/Card';
import { ArrowLeft } from 'lucide-react';

interface PropertyDetailScreenProps {
  propertyId: string;
  onBack: () => void;
}

const PropertyDetailScreen: React.FC<PropertyDetailScreenProps> = ({ propertyId, onBack }) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  
  useEffect(() => {
    const prop = dataService.getProperty(propertyId);
    if (prop) {
      setProperty(prop);
      if (prop.isRented) {
        const linkedContract = dataService.getContracts().find(c => c.propertyId === prop.id);
        setContract(linkedContract || null);
        if (linkedContract) {
          const linkedTenant = dataService.getTenants().find(t => t.id === linkedContract.tenantId);
          setTenant(linkedTenant || null);
        }
      }
    }
  }, [propertyId]);

  if (!property) {
    return (
        <div>
            <button onClick={onBack} className="flex items-center text-primary mb-4 hover:underline">
                <ArrowLeft size={18} className="mr-2" /> Torna agli immobili
            </button>
            <p>Immobile non trovato.</p>
        </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center text-primary mb-4 hover:underline">
        <ArrowLeft size={18} className="mr-2" /> Torna agli immobili
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <img src={property.imageUrl} alt={property.name} className="w-full h-80 object-cover rounded-t-xl" />
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-dark">{property.name}</h1>
                    <p className="text-gray-600 mt-1">{property.address}</p>
                    <div className="mt-4 border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                        <div><strong className="text-gray-600 block">Tipo:</strong> {property.type}</div>
                        <div><strong className="text-gray-600 block">Superficie:</strong> {property.surface} mq</div>
                        <div><strong className="text-gray-600 block">Locali:</strong> {property.rooms}</div>
                    </div>
                </div>
            </Card>
        </div>
        <div>
            <Card className="p-6">
                <h2 className="text-xl font-bold text-dark mb-4">Stato Locazione</h2>
                {property.isRented && contract && tenant ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Inquilino</p>
                            <p className="font-semibold text-dark">{tenant.name}</p>
                            <p className="text-sm text-gray-700">{tenant.email} | {tenant.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Contratto</p>
                            <p className="font-semibold text-dark">Dal {new Date(contract.startDate).toLocaleDateString('it-IT')} al {new Date(contract.endDate).toLocaleDateString('it-IT')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Canone Mensile</p>
                            <p className="font-bold text-lg text-primary">€{contract.rentAmount.toLocaleString('it-IT')}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="font-semibold text-green-800">Immobile attualmente libero</p>
                    </div>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailScreen;
