import React from 'react';
import { User } from '@/types';
import { UserCircle, ArrowRight, ArrowLeft, UserPlus } from 'lucide-react';

interface UserSelectionScreenProps {
  users: User[];
  onSelectUser: (user: User) => void;
  onBackToLogin: () => void;
  onRegister: () => void;
}

const UserSelectionScreen: React.FC<UserSelectionScreenProps> = ({ users, onSelectUser, onBackToLogin, onRegister }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-light">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-2xl shadow-2xl m-4">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold text-dark">Seleziona un Profilo</h1>
                <p className="mt-1 text-gray-500">Scegli con quale utente vuoi accedere.</p>
            </div>
            <button onClick={onBackToLogin} className="flex items-center text-sm text-gray-600 font-semibold p-2 rounded-lg hover:bg-gray-100">
                <ArrowLeft size={16} className="mr-1.5"/> Torna Indietro
            </button>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="w-full flex items-center p-4 text-left bg-white border rounded-lg hover:bg-secondary hover:shadow-md transition-all duration-200"
            >
              <UserCircle size={36} className="text-primary mr-4" />
              <div className="flex-1">
                <p className="font-bold text-lg text-dark">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <ArrowRight size={20} className="text-gray-400" />
            </button>
          ))}
           {users.length === 0 && (
              <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
                    <p>Nessun utente locale attivo trovato.</p>
              </div>
          )}
        </div>
         <div className="pt-4 border-t">
             <button
                onClick={onRegister}
                className="w-full flex items-center justify-center px-4 py-3 bg-secondary text-primary font-semibold rounded-lg hover:bg-blue-200 transition-colors"
            >
                <UserPlus size={20} className="mr-2" />
                Nuovo utente? Registrati qui
            </button>
        </div>
      </div>
    </div>
  );
};

export default UserSelectionScreen;
