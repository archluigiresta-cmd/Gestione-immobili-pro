import React, { useState, useEffect } from 'react';
import { Expense, Property, ExpenseCategory, UtilityType, TaxType } from '../../types';
import { X } from 'lucide-react';
import * as dataService from '../../services/dataService';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'history'>) => void;
  projectId: string;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSave, projectId }) => {
  const getInitialState = () => ({
    propertyId: '',
    description: '',
    amount: 0,
    category: ExpenseCategory.UTILITIES,
    categoryOther: '',
    date: new Date().toISOString().split('T')[0],
    providerUrl: '',
    invoiceUrl: '',
    utilityType: UtilityType.ELECTRICITY,
    utilityTypeOther: '',
    utilityProvider: '',
    utilityDetails: '',
    taxType: TaxType.IMU,
    taxTypeOther: '',
    taxReferenceYear: new Date().getFullYear(),
    taxDetails: '',
  });

  const [formData, setFormData] = useState(getInitialState());
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProperties(dataService.getProperties(projectId));
    }
  }, [isOpen, projectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
        const newState = { ...prev, [name]: name === 'amount' || name === 'taxReferenceYear' ? Number(value) : value };
        
        if (name === 'category') {
            newState.categoryOther = '';
            if (value !== ExpenseCategory.UTILITIES) {
                newState.utilityType = undefined;
                newState.utilityTypeOther = '';
                newState.utilityProvider = '';
                newState.utilityDetails = '';
            }
            if (value !== ExpenseCategory.TAXES) {
                newState.taxType = undefined;
                newState.taxTypeOther = '';
                newState.taxReferenceYear = new Date().getFullYear();
                newState.taxDetails = '';
            }
        }
        
        if(name === 'utilityType' && value !== UtilityType.OTHER) newState.utilityTypeOther = '';
        if(name === 'taxType' && value !== TaxType.OTHER) newState.taxTypeOther = '';
        
        return newState;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.description || formData.amount <= 0 || !formData.date) {
      setError('Immobile, descrizione, importo (> 0) e data sono obbligatori.');
      return;
    }
    if (formData.category === ExpenseCategory.OTHER && !formData.categoryOther?.trim()) {
        setError('Specificare la categoria è obbligatorio quando si seleziona "Altro".');
        return;
    }
    if (formData.category === ExpenseCategory.UTILITIES && formData.utilityType === UtilityType.OTHER && !formData.utilityTypeOther?.trim()) {
        setError('Specificare il tipo di utenza è obbligatorio.');
        return;
    }
    if (formData.category === ExpenseCategory.TAXES && formData.taxType === TaxType.OTHER && !formData.taxTypeOther?.trim()) {
        setError('Specificare il tipo di tassa è obbligatorio.');
        return;
    }
    
    let dataToSave: Omit<Expense, 'id' | 'history'> = {
        projectId,
        propertyId: formData.propertyId,
        description: formData.description,
        amount: formData.amount,
        category: formData.category,
        date: formData.date,
        providerUrl: formData.providerUrl,
        invoiceUrl: formData.invoiceUrl,
    };

    if (formData.category === ExpenseCategory.OTHER) dataToSave.categoryOther = formData.categoryOther;
    
    if (formData.category === ExpenseCategory.UTILITIES) {
        dataToSave.utilityType = formData.utilityType;
        dataToSave.utilityProvider = formData.utilityProvider;
        dataToSave.utilityDetails = formData.utilityDetails;
        if(formData.utilityType === UtilityType.OTHER) dataToSave.utilityTypeOther = formData.utilityTypeOther;
    }
    
    if (formData.category === ExpenseCategory.TAXES) {
        dataToSave.taxType = formData.taxType;
        dataToSave.taxReferenceYear = formData.taxReferenceYear;
        dataToSave.taxDetails = formData.taxDetails;
        if(formData.taxType === TaxType.OTHER) dataToSave.taxTypeOther = formData.taxTypeOther;
    }

    onSave(dataToSave);
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
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Aggiungi Nuova Spesa</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Descrizione</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full input" />
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
              <label className="block text-sm font-medium text-gray-700">Categoria</label>
              <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full input">
                {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          {formData.category === ExpenseCategory.OTHER && (
               <div>
                <label className="block text-sm font-medium text-gray-700">Specifica Categoria</label>
                <input
                  type="text"
                  name="categoryOther"
                  value={formData.categoryOther || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full input"
                  placeholder="Es. Spese legali"
                />
              </div>
          )}

          {formData.category === ExpenseCategory.UTILITIES && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-4 border border-blue-200">
                <h3 className="text-md font-semibold text-primary">Dettagli Utenza</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo Utenza</label>
                      <select name="utilityType" value={formData.utilityType} onChange={handleChange} className="mt-1 block w-full input">
                        {Object.values(UtilityType).map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    {formData.utilityType === UtilityType.OTHER && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Specifica Tipo Utenza</label>
                            <input type="text" name="utilityTypeOther" value={formData.utilityTypeOther} onChange={handleChange} className="mt-1 block w-full input" />
                        </div>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gestore</label>
                  <input type="text" name="utilityProvider" value={formData.utilityProvider} onChange={handleChange} className="mt-1 block w-full input" placeholder="Es. Enel Energia" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Note / Dettagli Aggiuntivi</label>
                    <textarea name="utilityDetails" value={formData.utilityDetails} onChange={handleChange} rows={2} className="mt-1 block w-full input" placeholder="Es. Codice cliente, POD, PDR..."></textarea>
                </div>
            </div>
          )}
          
          {formData.category === ExpenseCategory.TAXES && (
            <div className="p-4 bg-yellow-50 rounded-lg space-y-4 border border-yellow-200">
                <h3 className="text-md font-semibold text-yellow-800">Dettagli Tassa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo Tassa</label>
                      <select name="taxType" value={formData.taxType} onChange={handleChange} className="mt-1 block w-full input">
                        {Object.values(TaxType).map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    {formData.taxType === TaxType.OTHER && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Specifica Tipo Tassa</label>
                            <input type="text" name="taxTypeOther" value={formData.taxTypeOther} onChange={handleChange} className="mt-1 block w-full input" />
                        </div>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Anno di Riferimento</label>
                  <input type="number" name="taxReferenceYear" value={formData.taxReferenceYear} onChange={handleChange} className="mt-1 block w-full input" placeholder="Es. 2024" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Note / Dettagli Aggiuntivi</label>
                    <textarea name="taxDetails" value={formData.taxDetails} onChange={handleChange} rows={2} className="mt-1 block w-full input" placeholder="Es. Acconto, Saldo, Rif. F24..."></textarea>
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Importo (€)</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="mt-1 block w-full input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Link al sito del gestore (Opzionale)</label>
            <input type="url" name="providerUrl" value={formData.providerUrl} onChange={handleChange} className="mt-1 block w-full input" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Link alla fattura (Opzionale)</label>
            <input type="url" name="invoiceUrl" value={formData.invoiceUrl} onChange={handleChange} className="mt-1 block w-full input" placeholder="https://..." />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Aggiungi Spesa</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;