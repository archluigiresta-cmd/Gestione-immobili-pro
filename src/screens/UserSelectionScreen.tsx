import React from 'react';
import { User } from '../types';
import { UserCircle, ArrowRight, LogOut } from 'lucide-react';

interface UserSelectionScreenProps {
  users: User[];
  onSelectUser: (user: User) => void;
  onLogout: () => void;
}

const UserSelectionScreen: React.FC<UserSelectionScreenProps> = ({ users, onSelectUser, onLogout }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-light">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-2xl shadow-2xl m-4">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold text-dark">Seleziona un Profilo</h1>
                <p className="mt-1 text-gray-500">Scegli con quale utente vuoi accedere.</p>
            </div>
            <button onClick={onLogout} className="flex items-center text-sm text-red-600 font-semibold p-2 rounded-lg hover:bg-red-50">
                <LogOut size={16} className="mr-1.5"/> Esci
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
        </div>
      </div>
    </div>
  );
};

export default UserSelectionScreen;