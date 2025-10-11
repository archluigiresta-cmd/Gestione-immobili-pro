import React, { useState, useEffect } from 'react';
import { Document, Property, CustomField, CustomFieldType, DocumentType } from '../../types';
import { X, PlusCircle, Trash2 } from 'lucide-react';
import * as dataService from '../../services/dataService';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: Omit<Document, 'id' | 'history'>) => void;
  projectId: string;
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose, onSave, projectId }) => {
  const getInitialState = () => ({
    name: '',
    propertyId: '',
    type: DocumentType.CONTRACT,
    typeOther: '',
    uploadDate: new Date().toISOString().split('T')[0],
    fileUrl: '',
    expiryDate: undefined as string | undefined,
  });

  const [formData, setFormData] = useState(getInitialState());
  const [customFields, setCustomFields] = useState<Omit<CustomField, 'id'>[]>([]);
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
            type: value as DocumentType,
            ...(value !== DocumentType.OTHER && { typeOther: '' }),
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
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

  const handleClose = () => {
      setFormData(getInitialState());
      setCustomFields([]);
      setError('');
      onClose();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.propertyId || !formData.fileUrl) {
      setError('Nome, immobile e URL del file sono obbligatori.');
      return;
    }
    if (formData.type === DocumentType.OTHER && !formData.typeOther?.trim()) {
        setError('Specificare il tipo di documento è obbligatorio quando si seleziona "Altro".');
        return;
    }

    const finalCustomFields = customFields
      .filter(cf => cf.label.trim() !== '')
      .map(cf => ({...cf, id: `cf-${Date.now()}-${Math.random()}`}));
    
    const { typeOther, ...restOfData } = formData;
    const dataToSave = {
        ...restOfData,
        ...(formData.type === DocumentType.OTHER && { typeOther }),
    };

    onSave({ ...dataToSave, projectId, customFields: finalCustomFields });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Carica Nuovo Documento</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Documento</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full input" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Immobile</label>
              <select name="propertyId" value={formData.propertyId} onChange={handleChange} className="mt-1 block w-full input">
                <option value="">Seleziona immobile</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo Documento</label>
              <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full input">
                {Object.values(DocumentType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
            {formData.type === DocumentType.OTHER && (
               <div className="md:col-start-2">
                <label className="block text-sm font-medium text-gray-700">Specifica Tipo</label>
                <input
                  type="text"
                  name="typeOther"
                  value={formData.typeOther || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full input"
                  placeholder="Es. Atto di compravendita"
                />
              </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">URL del File</label>
            <input type="url" name="fileUrl" value={formData.fileUrl} onChange={handleChange} className="mt-1 block w-full input" placeholder="https://" />
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
            <button type="button" onClick={handleClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Salva Documento</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDocumentModal;