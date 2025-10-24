import React, { useState, useEffect } from 'react';
import { Deadline, DeadlineType, Property } from '@/types';
import { X } from 'lucide-react';
import * as dataService from '@/services/dataService';

interface AddDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deadline: Omit<Deadline, 'id' | 'isCompleted' | 'history'>) => void;
  projectId: string;
}

const AddDeadlineModal: React.FC<AddDeadlineModalProps> = ({ isOpen, onClose, onSave, projectId }) => {
  const getInitialState = () => ({
    propertyId: '',
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    type: DeadlineType.RENT,
    typeOther: '',
  });
  
  const [formData, setFormData] = useState(getInitialState());
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProperties(dataService.getProperties(projectId));
    }
  }, [isOpen, projectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'type') {
        setFormData(prev => ({
            ...prev,
            type: value as DeadlineType,
            ...(value !== DeadlineType.OTHER && { typeOther: '' }),
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.title || !formData.dueDate) {
      setError('Tutti i campi sono obbligatori.');
      return;
    }
    if (formData.type === DeadlineType.OTHER && !formData.typeOther?.trim()) {
        setError('Specificare il tipo è obbligatorio quando si seleziona "Altro".');
        return;
    }

    const { typeOther, ...restOfData } = formData;
    const dataToSave = {
        ...restOfData,
        ...(formData.type === DeadlineType.OTHER && { typeOther }),
    };

    onSave({ ...dataToSave, projectId });
    onClose();
  };
  
  const handleClose = () => {
      setFormData(getInitialState());
      setError('');
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Aggiungi Nuova Scadenza</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titolo</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Immobile</label>
            <select name="propertyId" value={formData.propertyId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
              <option value="">Seleziona immobile</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Scadenza</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                {Object.values(DeadlineType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
           {formData.type === DeadlineType.OTHER && (
               <div>
                <label className="block text-sm font-medium text-gray-700">Specifica Tipo</label>
                <input
                  type="text"
                  name="typeOther"
                  value={formData.typeOther || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full input"
                  placeholder="Es. Fattura fornitore"
                />
              </div>
          )}
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Aggiungi Scadenza</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeadlineModal;
