// Versione finale corretta 5
import React, { useState } from 'react';
import { User } from '../../types';
import { X, KeyRound } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (newPassword: string) => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (user.password && currentPassword !== user.password) {
      setError('La password attuale non è corretta.');
      return;
    }
    if (newPassword.length < 6) {
      setError('La nuova password deve essere di almeno 6 caratteri.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Le nuove password non coincidono.');
      return;
    }

    onSave(newPassword);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark flex items-center gap-2">
            <KeyRound size={20} />
            Cambia Password
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {user.password && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Password Attuale</label>
              <input 
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full input"
                autoFocus
              />
            </div>
          )}
           <div>
            <label className="block text-sm font-medium text-gray-700">Nuova Password</label>
            <input 
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="mt-1 block w-full input"
              autoFocus={!user.password}
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Conferma Nuova Password</label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full input"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Salva Password</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
