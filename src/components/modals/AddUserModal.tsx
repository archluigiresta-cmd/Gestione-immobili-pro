import React, { useState } from 'react';
import { User } from '@/types';
import { X } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Omit<User, 'id' | 'status'>) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Nome e Email non possono essere vuoti.');
      return;
    }
    onSave({ name, email, password: password || undefined });
    handleClose();
  };
  
  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Aggiungi Nuovo Utente</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="add-name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input 
              id="add-name"
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
            />
          </div>
          <div>
            <label htmlFor="add-email" className="block text-sm font-medium text-gray-700">Indirizzo Email</label>
            <input 
              id="add-email"
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
            />
          </div>
          <div>
            <label htmlFor="add-password" className="block text-sm font-medium text-gray-700">Password (opzionale)</label>
            <input 
              id="add-password"
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Lascia vuoto per accesso senza password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
            />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Aggiungi Utente</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;