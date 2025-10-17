import React, { useState, useEffect } from 'react';
import { Maintenance, MaintenanceStatus, Property } from '../../types';
import { X } from 'lucide-react';
import * as dataService from '../../services/dataService';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (maintenance: Omit<Maintenance, 'id' | 'history'>) => void;
  projectId: string;
}

const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({ isOpen, onClose, onSave, projectId }) => {
  const [formData, setFormData] = useState({
    propertyId: '',
    description: '',
    status: MaintenanceStatus.REQUESTED,
    requestDate: new Date().toISOString().split('T')[0],
    cost: null as number | null,
    completionDate: undefined as string | undefined,
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProperties(dataService.getProperties(projectId));
    }
  }, [isOpen, projectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? (value ? Number(value) : null) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.description) {
      setError('Immobile e Descrizione sono obbligatori.');
      return;
    }
    onSave({ ...formData, projectId });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Nuova Richiesta di Manutenzione</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Immobile</label>
            <select name="propertyId" value={formData.propertyId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm">
              <option value="">Seleziona immobile</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descrizione Intervento</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Richiesta</label>
              <input type="date" name="requestDate" value={formData.requestDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Stato</label>
              <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm">
                {Object.values(MaintenanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
           <div>
              <label className="block text-sm font-medium text-gray-700">Costo (€) (Opzionale)</label>
              <input type="number" name="cost" value={formData.cost ?? ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Salva Richiesta</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaintenanceModal;
