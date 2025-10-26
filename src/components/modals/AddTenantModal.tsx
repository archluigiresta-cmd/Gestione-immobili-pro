import React, { useState } from 'react';
import { Tenant, CustomField, CustomFieldType } from '@/types';
import { X, PlusCircle, Trash2 } from 'lucide-react';
import * as dataService from '@/services/dataService';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenant: Omit<Tenant, 'id' | 'history'>) => void;
  projectId: string;
}

const AddTenantModal: React.FC<AddTenantModalProps> = ({ isOpen, onClose, onSave, projectId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contractId, setContractId] = useState('');
  const [customFields, setCustomFields] = useState<Omit<CustomField, 'id'>[]>([]);
  const [error, setError] = useState('');
  
  const handleAddCustomField = () => {
    setCustomFields([...customFields, { label: '', type: CustomFieldType.TEXT, value: '' }]);
  };

  const handleCustomFieldChange = (index: number, field: keyof Omit<CustomField, 'id'>, value: any) => {
    const newCustomFields = [...customFields];
    if (field === 'type') {
        newCustomFields[index].value = value === CustomFieldType.BOOLEAN ? false : '';
    }
    (newCustomFields[index] as any)[field] = value;
    setCustomFields(newCustomFields);
  };
  
  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setError('Nome, Email e Telefono sono obbligatori.');
      return;
    }
    const finalCustomFields = customFields
      .filter(cf => cf.label.trim() !== '')
      .map(cf => ({...cf, id: `cf-${Date.now()}-${Math.random()}`}));

    onSave({ name, email, phone, contractId, projectId, customFields: finalCustomFields });
    // Reset form
    setName('');
    setEmail('');
    setPhone('');
    setContractId('');
    setCustomFields([]);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Aggiungi Nuovo Inquilino</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Telefono</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Contratto (Opzionale)</label>
             <select value={contractId} onChange={e => setContractId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
              <option value="">Nessun contratto</option>
              {dataService.getContracts(projectId).map(c => <option key={c.id} value={c.id}>Contratto per {dataService.getProperties(projectId).find(p=>p.id === c.propertyId)?.name}</option>)}
            </select>
          </div>
          
           <div className="pt-2">
            <h3 className="text-md font-semibold text-dark border-b pb-2 mb-3">Campi Personalizzati</h3>
            <div className="space-y-3">
              {customFields.map((field, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
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
                  <button type="button" onClick={() => handleRemoveCustomField(index)} className="col-span-1 text-red-500 hover:text-red-700">
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
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Aggiungi Inquilino</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTenantModal;