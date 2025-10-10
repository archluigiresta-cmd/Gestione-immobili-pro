
import React, { useState, useEffect } from 'react';
import { Property, PropertyType } from '../../types';
import { X } from 'lucide-react';

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Property) => void;
  property: Property;
}

const EditPropertyModal: React.FC<EditPropertyModalProps> = ({ isOpen, onClose, onSave, property }) => {
  const [formData, setFormData] = useState<Property>(property);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(property);
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: (name === 'surface' || name === 'rooms' || name === 'rentAmount') ? Number(value) : value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || formData.surface <= 0) {
      setError('Nome, indirizzo e superficie sono obbligatori.');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Modifica Immobile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome Immobile</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full input" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Indirizzo</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full input" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full input">
                    {Object.values(PropertyType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Superficie (mq)</label>
                    <input type="number" name="surface" value={formData.surface} onChange={handleChange} className="mt-1 block w-full input" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Numero Locali</label>
                    <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} className="mt-1 block w-full input" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Canone (€)</label>
                    <input type="number" name="rentAmount" value={formData.rentAmount} onChange={handleChange} className="mt-1 block w-full input" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">URL Immagine</label>
                <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 block w-full input" />
            </div>
            <div className="flex items-center">
                <input
                    id="isRented"
                    name="isRented"
                    type="checkbox"
                    checked={formData.isRented}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="isRented" className="ml-2 block text-sm text-gray-900">
                    Affittato
                </label>
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

export default EditPropertyModal;
