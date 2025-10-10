
import React from 'react';
import Card from '../components/ui/Card';
import { MOCK_MAINTENANCE, MOCK_PROPERTIES } from '../constants';
import { Maintenance, MaintenanceStatus } from '../types';
import { PlusCircle } from 'lucide-react';

const MaintenanceScreen: React.FC = () => {
    const getPropertyName = (id: string) => MOCK_PROPERTIES.find(p => p.id === id)?.name || 'N/A';
  
    const getStatusBadge = (status: MaintenanceStatus) => {
        switch(status) {
            case MaintenanceStatus.REQUESTED: return 'bg-yellow-100 text-yellow-800';
            case MaintenanceStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
            case MaintenanceStatus.COMPLETED: return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-dark">Registro Manutenzioni</h1>
            <button
              onClick={() => alert("Funzionalità 'Nuova Richiesta' da implementare.")}
              className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
            >
              <PlusCircle size={18} className="mr-2" />
              Nuova Richiesta
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-600">Immobile</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Descrizione</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Data Richiesta</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Stato</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Costo</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_MAINTENANCE.map((item: Maintenance) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-dark font-medium">{getPropertyName(item.propertyId)}</td>
                  <td className="p-3 text-gray-700">{item.description}</td>
                  <td className="p-3 text-gray-700">{new Date(item.requestDate).toLocaleDateString('it-IT')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(item.status)}`}>
                        {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700 font-semibold">
                    {item.cost ? `€${item.cost.toLocaleString('it-IT')}` : 'N/D'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
};

export default MaintenanceScreen;
