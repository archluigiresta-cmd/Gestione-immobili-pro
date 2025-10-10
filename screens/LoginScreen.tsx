
import React, { useState, useEffect } from 'react';
import * as dataService from '../services/dataService';
import { User } from '../types';
import { UserCircle, ArrowRight } from 'lucide-react';
import RegisterModal from '../components/modals/RegisterModal';

interface LoginScreenProps {
    onLogin: (userId: string) => void;
    onRegister: (userData: Omit<User, 'id'>) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

    useEffect(() => {
        setUsers(dataService.getUsers());
    }, []);

    const handleRegister = (userData: Omit<User, 'id'>) => {
        onRegister(userData);
        setRegisterModalOpen(false);
    };

    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-light">
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-primary">Gest-Immo</h1>
                        <p className="mt-2 text-gray-600">Seleziona un utente per continuare</p>
                    </div>
                    <div className="space-y-4">
                        {users.map(user => (
                            <button
                                key={user.id}
                                onClick={() => onLogin(user.id)}
                                className="w-full flex items-center p-4 text-left bg-white border rounded-lg hover:bg-secondary hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <UserCircle size={40} className="text-primary mr-4" />
                                <div className="flex-1">
                                    <p className="font-semibold text-dark">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                                <ArrowRight size={20} className="text-gray-400" />
                            </button>
                        ))}
                    </div>
                    <div className="text-center pt-2">
                        <p className="text-sm text-gray-500">
                            Nuovo utente?{' '}
                            <button onClick={() => setRegisterModalOpen(true)} className="font-semibold text-primary hover:underline">
                                Registrati ora
                            </button>
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400">&copy; 2024 Gestore Immobili PRO</p>
                    </div>
                </div>
            </div>
            <RegisterModal
                isOpen={isRegisterModalOpen}
                onClose={() => setRegisterModalOpen(false)}
                onRegister={handleRegister}
            />
        </>
    );
};

export default LoginScreen;