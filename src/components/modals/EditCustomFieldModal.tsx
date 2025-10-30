import React, { useState, useEffect } from 'react';
import { CustomField, CustomFieldType } from '../../types';
import { X } from 'lucide-react';

interface EditCustomFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: CustomField) => void;
  field: CustomField;
}

const EditCustomFieldModal: React.FC<EditCustomFieldModalProps> = ({ isOpen, onClose, onSave, field }) => {
  const [label, setLabel] = useState('');
  const [value, setValue] = useState<string | boolean>('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (field) {
        setLabel(field.label);
        setValue(field.value);
    }
  }, [field]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('Il nome del campo non può essere vuoto.');
      return;
    }
    onSave({ ...field, label, value });
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Modifica Campo</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
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
              className="mt-1 block w-full input" 
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Tipo Campo</label>
            <input 
              type="text" 
              value={field.type}
              disabled
              className="mt-1 block w-full input bg-gray-100" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Valore</label>
            {field.type === CustomFieldType.TEXT ? (
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
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Salva Modifiche</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomFieldModal;
