
import React, { useState } from 'react';
import { Property, PropertyType } from '@/types';
import { X, UploadCloud } from 'lucide-react';
import * as dataService from '@/services/dataService';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Omit<Property, 'id' | 'projectId' | 'customFields' | 'history' | 'creationDate'>) => void;
  projectId: string;
}

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ isOpen, onClose, onSave, projectId }) => {
  const getNextCode = () => `IMM-${String(dataService.getProperties(projectId).length + 1).padStart(3, '0')}`;

  const getInitialFormData = () => ({
    code: getNextCode(),
    name: '',
    address: '',
    type: PropertyType.APARTMENT,
    typeOther: '',
    surface: 0,
    rooms: 1,
    isRented: false,
    rentAmount: undefined,
    imageUrl: ''
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'type') {
        setFormData(prev => ({
            ...prev,
            type: value as PropertyType,
            ...(value !== PropertyType.OTHER && { typeOther: '' }),
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: (name === 'surface' || name === 'rooms' || name === 'rentAmount') ? Number(value) : value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.code || formData.surface <= 0) {
      setError('Codice, nome, indirizzo e superficie sono obbligatori.');
      return;
    }
     if (formData.type === PropertyType.OTHER && !formData.typeOther?.trim()) {
        setError('Specificare il tipo di immobile è obbligatorio quando si seleziona "Altro".');
        return;
    }
    const { typeOther, ...restOfData } = formData;
    const dataToSave = {
        ...restOfData,
        ...(formData.type === PropertyType.OTHER && { typeOther }),
    };
    onSave(dataToSave);
    onClose();
  };

  const handleClose = () => {
     setFormData(getInitialFormData());
     setImagePreview(null);
     setError('');
     onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Aggiungi Nuovo Immobile</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-6">
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Immagine Profilo</label>
              <div className="mt-1 w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center p-2 relative">
                {!imagePreview && (
                  <div className="text-gray-500">
                    <UploadCloud size={32} className="mx-auto" />
                    <p className="text-xs mt-1">Trascina o clicca per caricare</p>
                  </div>
                )}
                {imagePreview && <img src={imagePreview} alt="Anteprima" className="w-full h-full object-cover rounded-md"/>}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
            <div className="w-2/3 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">Codice</label>
                        <input type="text" name="code" value={formData.code} onChange={handleChange} className="mt-1 block w-full input" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Nome Immobile</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full input" />
                    </div>
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Indirizzo</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full input" />
              </div>
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full input">
                {Object.values(PropertyType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
             {formData.type === PropertyType.OTHER && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Specifica Tipo</label>
                <input
                  type="text"
                  name="typeOther"
                  value={formData.typeOther || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full input"
                  placeholder="Es. Casa indipendente"
                />
              </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700">Superficie (mq)</label>
                <input type="number" name="surface" value={formData.surface} onChange={handleChange} className="mt-1 block w-full input" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Numero Locali</label>
                <input type="number" name="rooms" min="1" value={formData.rooms} onChange={handleChange} className="mt-1 block w-full input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Canone (€, se affittato)</label>
                <input type="number" name="rentAmount" value={formData.rentAmount} onChange={handleChange} className="mt-1 block w-full input" />
              </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Crea Immobile</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyModal;
