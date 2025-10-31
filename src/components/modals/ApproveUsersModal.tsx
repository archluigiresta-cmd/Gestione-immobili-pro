import React from 'react';
import { User } from '../../types';
import { X, Check, UserCheck } from 'lucide-react';

interface ApproveUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingUsers: User[];
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
}

const ApproveUsersModal: React.FC<ApproveUsersModalProps> = ({ isOpen, onClose, pendingUsers, onApprove, onReject }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark flex items-center gap-2">
            <UserCheck size={22} className="text-primary" />
            Richieste di Registrazione
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">Approva o rifiuta le richieste dei nuovi utenti per consentire loro l'accesso all'applicazione.</p>

        {pendingUsers.length > 0 ? (
          <div className="space-y-3">
            {pendingUsers.map(user => (
              <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                <div>
                  <p className="font-semibold text-dark">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => onApprove(user.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 font-semibold rounded-lg hover:bg-green-200 text-sm">
                    <Check size={16} /> Approva
                  </button>
                  <button onClick={() => onReject(user.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 text-sm">
                    <X size={16} /> Rifiuta
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6">Nessuna nuova richiesta di registrazione.</p>
        )}
        
        <div className="flex justify-end pt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveUsersModal;
