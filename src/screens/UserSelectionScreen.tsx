import React from 'react';
import { User } from '@/types';
import { ArrowLeft, UserPlus, UserCircle, ArrowRight } from 'lucide-react';

interface UserSelectionScreenProps {
  users: User[];
  onSelectUser: (user: User) => void;
  onBackToLogin: () => void;
  onRegister: () => void;
}

const UserSelectionScreen: React.FC<UserSelectionScreenProps> = ({ users, onSelectUser, onBackToLogin, onRegister }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-light">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl relative">
        <button onClick={onBackToLogin} className="absolute top-4 left-4 flex items-center text-sm text-gray-600 font-semibold p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={16} className="mr-1.5"/> Torna al Login
        </button>
        <div className="text-center pt-8">
          <h1 className="text-3xl font-bold text-primary">Seleziona Utente</h1>
          <p className="mt-2 text-gray-600">
            Accedi come utente collaboratore.
          </p>
        </div>
        <div className="space-y-4 pt-4">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className="w-full flex items-center p-4 text-left bg-white border-2 border-gray-300 rounded-lg hover:bg-secondary hover:shadow-md transition-all duration-200"
            >
              <UserCircle size={24} className="mr-3 text-primary"/>
              <span className="font-semibold text-lg text-dark flex-1">{user.name}</span>
              <ArrowRight size={20} className="text-gray-400" />
            </button>
          ))}
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
