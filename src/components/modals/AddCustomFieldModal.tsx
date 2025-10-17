import React, { useState } from 'react';
import { CustomField, CustomFieldType } from '../../types';
import { X } from 'lucide-react';

interface AddCustomFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: Omit<CustomField, 'id'>) => void;
}

const AddCustomFieldModal: React.FC<AddCustomFieldModalProps> = ({ isOpen, onClose, onSave }) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<CustomFieldType>(CustomFieldType.TEXT);
  const [value, setValue] = useState<string | boolean>('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('Il nome del campo non può essere vuoto.');
      return;
    }
    onSave({ label, type, value });
    handleClose();
  };

  const handleTypeChange = (newType: CustomFieldType) => {
    setType(newType);
    // Reset value when type changes
    setValue(newType === CustomFieldType.BOOLEAN ? false : '');
  };
  
  const handleClose = () => {
    setLabel('');
    setType(CustomFieldType.TEXT);
    setValue('');
    setError('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Aggiungi Campo Personalizzato</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Campo</label>
            <input 
              type="text" 
              value={label} 
              onChange={e => setLabel(e.target.value)}
              placeholder="Es. Codice Contatore Gas"
              className="mt-1 block w-full input" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo Campo</label>
            <select
                value={type}
                onChange={e => handleTypeChange(e.target.value as CustomFieldType)}
                className="mt-1 block w-full input"
            >
                <option value={CustomFieldType.TEXT}>Testo</option>
                <option value={CustomFieldType.BOOLEAN}>Si/No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Valore</label>
            {type === CustomFieldType.TEXT ? (
                <input
                    type="text"
                    value={value as string}
                    onChange={e => setValue(e.target.value)}
                    className="mt-1 block w-full input"
                />
            ) : (
                <select
                    value={String(value)}
                    onChange={e => setValue(e.target.value === 'true')}
                    className="mt-1 block w-full input"
                >
                    <option value="true">Sì</option>
                    <option value="false">No</option>
                </select>
            )}
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Salva Campo</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomFieldModal;
