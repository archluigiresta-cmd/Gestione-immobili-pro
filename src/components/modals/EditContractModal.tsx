
import React, { useState, useEffect } from 'react';
import { Contract, Property, Tenant, CustomField, CustomFieldType } from '../../types';
import { X, PlusCircle, Trash2 } from 'lucide-react';
import * as dataService from '../../services/dataService';

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: Contract) => void;
  contract: Contract;
  projectId: string;
}

const EditContractModal: React.FC<EditContractModalProps> = ({ isOpen, onClose, onSave, contract, projectId }) => {
  const [formData, setFormData] = useState<Contract>(contract);
  const [error, setError] = useState('');

  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    setFormData(contract);
  }, [contract]);

  useEffect(() => {
    if (isOpen) {
      setProperties(dataService.getProperties(projectId));
      setTenants(dataService.getTenants(projectId));
    }
  }, [isOpen, projectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rentAmount' ? Number(value) : value,
    }));
  };
  
  const handleAddCustomField = () => {
    const newField = { id: `cf-${Date.now()}`, label: '', type: CustomFieldType.TEXT, value: '' };
    setFormData(prev => ({ ...prev, customFields: [...prev.customFields, newField] }));
  };
  
  const handleCustomFieldChange = (index: number, field: keyof CustomField, value: any) => {
    const newCustomFields = [...formData.customFields];
    const targetField = { ...newCustomFields[index] };

    if (field === 'type') {
      targetField.value = value === CustomFieldType.BOOLEAN ? false : '';
    }
    (targetField as any)[field] = value;
    newCustomFields[index] = targetField;
    setFormData(prev => ({...prev, customFields: newCustomFields}));
  };
  
  const handleRemoveCustomField = (id: string) => {
    setFormData(prev => ({ ...prev, customFields: prev.customFields.filter(cf => cf.id !== id) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.tenantId || !formData.startDate || !formData.endDate || formData.rentAmount <= 0) {
      setError('Tutti i campi principali sono obbligatori e il canone deve essere maggiore di zero.');
      return;
    }
    const cleanedCustomFields = formData.customFields.filter(cf => cf.label.trim() !== '');
    onSave({...formData, customFields: cleanedCustomFields});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Modifica Contratto</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Immobile</label>
            <select name="propertyId" value={formData.propertyId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Inquilino</label>
            <select name="tenantId" value={formData.tenantId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Inizio</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Fine</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Canone Mensile (€)</label>
            <input type="number" name="rentAmount" value={formData.rentAmount} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>

           <div className="pt-2">
            <h3 className="text-md font-semibold text-dark border-b pb-2 mb-3">Campi Personalizzati</h3>
            <div className="space-y-3">
              {formData.customFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Nome Campo"
                    value={field.label}
                    onChange={(e) => handleCustomFieldChange(index, 'label', e.target.value)}
                    className="col-span-4 input"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => handleCustomFieldChange(index, 'type', e.target.value)}
                    className="col-span-3 input"
                  >
                    <option value={CustomFieldType.TEXT}>Testo</option>
                    <option value={CustomFieldType.BOOLEAN}>Sì/No</option>
                  </select>
                  <div className="col-span-4">
                    {field.type === CustomFieldType.TEXT ? (
                      <input
                        type="text"
                        placeholder="Valore"
                        value={field.value as string}
                        onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                        className="w-full input"
                      />
                    ) : (
                      <select
                        value={String(field.value)}
                        onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value === 'true')}
                        className="w-full input"
                      >
                        <option value="true">Sì</option>
                        <option value="false">No</option>
                      </select>
                    )}
                  </div>
                  <button type="button" onClick={() => handleRemoveCustomField(field.id)} className="col-span-1 text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleAddCustomField} className="mt-3 flex items-center text-sm text-primary font-semibold hover:underline">
              <PlusCircle size={16} className="mr-2" /> Aggiungi Campo
            </button>
          </div>

          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Salva Modifiche</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContractModal;
