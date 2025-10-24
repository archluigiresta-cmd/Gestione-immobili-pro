import React, { useState, useEffect } from 'react';
import { Payment, PaymentStatus, Contract, Property } from '@/types';
import { X } from 'lucide-react';
import * as dataService from '@/services/dataService';

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Payment) => void;
  payment: Payment;
  projectId: string;
}

const EditPaymentModal: React.FC<EditPaymentModalProps> = ({ isOpen, onClose, onSave, payment, projectId }) => {
  const [formData, setFormData] = useState<Payment>(payment);
  const [contracts, setContracts] = useState<(Contract & { propertyName: string })[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(payment);
  }, [payment]);

  useEffect(() => {
    if (isOpen) {
      const projectContracts = dataService.getContracts(projectId);
      const projectProperties = dataService.getProperties(projectId);
      const propertyMap = new Map(projectProperties.map(p => [p.id, p.name]));
      
      const enrichedContracts = projectContracts.map(c => ({
        ...c,
        propertyName: propertyMap.get(c.propertyId) || 'N/A'
      }));
      setContracts(enrichedContracts);
    }
  }, [isOpen, projectId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'amount' || name === 'referenceMonth' || name === 'referenceYear') ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contractId || !formData.dueDate || formData.amount <= 0) {
      setError('Contratto, data di scadenza e importo (>0) sono obbligatori.');
      return;
    }
    const finalData = {
        ...formData,
        paymentDate: formData.paymentDate || null,
    };
    onSave(finalData);
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Modifica Pagamento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Contratto</label>
            <select value={formData.contractId} disabled className="mt-1 block w-full input bg-gray-100">
              <option value="">Seleziona un contratto</option>
              {contracts.map(c => <option key={c.id} value={c.id}>Contratto per {c.propertyName}</option>)}
            </select>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Importo (€)</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="mt-1 block w-full input" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Stato</label>
                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full input">
                    {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Mese di Riferimento</label>
                <input type="number" name="referenceMonth" min="1" max="12" value={formData.referenceMonth} onChange={handleChange} className="mt-1 block w-full input" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Anno di Riferimento</label>
                <input type="number" name="referenceYear" value={formData.referenceYear} onChange={handleChange} className="mt-1 block w-full input" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700">Data Scadenza</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="mt-1 block w-full input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Pagamento (se pagato)</label>
              <input type="date" name="paymentDate" value={formData.paymentDate || ''} onChange={handleChange} className="mt-1 block w-full input" />
            </div>
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

export default EditPaymentModal;