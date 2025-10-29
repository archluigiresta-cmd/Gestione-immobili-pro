import React, { useState, useEffect } from 'react';
import { User, UserStatus } from '../types';
import * as dataService from '../services/dataService';
import { ArrowLeft, UserCircle } from 'lucide-react';
import PasswordModal from '../components/modals/PasswordModal';

interface UserSelectionScreenProps {
  onSelectUser: (user: User) => void;
  onBack: () => void;
}

const UserSelectionScreen: React.FC<UserSelectionScreenProps> = ({ onSelectUser, onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  
  useEffect(() => {
    const localUsers = dataService.getUsers().filter(u => u.password && u.status === UserStatus.ACTIVE);
    setUsers(localUsers);
  }, []);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setPasswordModalOpen(true);
  };
  
  const handlePasswordConfirm = (password: string) => {
    if (selectedUser && selectedUser.password === password) {
      onSelectUser(selectedUser);
    } else {
      alert("Password errata.");
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl text-center">
            <h1 className="text-2xl font-bold text-primary">Seleziona Utente</h1>
            <p className="text-gray-600">Scegli il tuo profilo per continuare.</p>
            <div className="space-y-3 pt-4">
                {users.map(user => (
                    <button
                        key={user.id}
                        onClick={() => handleUserClick(user)}
                        className="w-full flex items-center p-4 text-left bg-white border-2 border-gray-300 rounded-lg hover:bg-secondary hover:shadow-md transition-all"
                    >
                        <UserCircle size={28} className="text-primary mr-4"/>
                        <span className="font-semibold text-lg text-dark flex-1">{user.name}</span>
                    </button>
                ))}
            </div>
            <div className="pt-4 border-t">
                 <button
                    onClick={onBack}
                    className="flex items-center text-primary font-semibold hover:underline"
                >
                    <ArrowLeft size={16} className="mr-1" /> Torna alla selezione login
                </button>
            </div>
        </div>
      </div>
      {selectedUser && (
        <PasswordModal 
            isOpen={isPasswordModalOpen}
            onClose={() => setPasswordModalOpen(false)}
            onConfirm={handlePasswordConfirm}
            username={selectedUser.name}
        />
      )}
    </>
  );
};

export default UserSelectionScreen;
