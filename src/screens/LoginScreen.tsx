import React from 'react';
import { ArrowRight, UserPlus, Users } from 'lucide-react';

interface LoginScreenProps {
    onCollaboratorLogin: () => void;
    onRegister: () => void;
    hasLocalUsers: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onCollaboratorLogin, onRegister, hasLocalUsers }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-light">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl text-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Gest-Immo PRO</h1>
                    <p className="mt-2 text-gray-600">
                        Accesso locale all'applicazione. I dati sono salvati solo su questo computer.
                    </p>
                </div>
                
                <div className="space-y-4 pt-4">
                     {hasLocalUsers ? (
                         <button
                            onClick={onCollaboratorLogin}
                            className="w-full flex items-center justify-center p-4 text-left bg-white border-2 border-gray-300 rounded-lg hover:bg-secondary hover:shadow-md transition-all duration-200"
                        >
                            <Users size={24} className="mr-3 text-primary"/>
                            <span className="font-semibold text-lg text-dark flex-1">Accedi con un utente locale</span>
                            <ArrowRight size={20} className="text-gray-400" />
                        </button>
                    ) : (
                        <div className="p-4 text-center bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800">Nessun utente locale trovato. Registrati per iniziare.</p>
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

                <div className="pt-2">
                    <p className="text-xs text-gray-400">&copy; 2024 Gestore Immobili PRO</p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;