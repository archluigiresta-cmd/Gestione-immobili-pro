import React from 'react';
import { ArrowRight, UserCircle } from 'lucide-react';

interface LoginScreenProps {
    onLogin: () => void;
    isApiReady: boolean;
    onShowLocalUsers: () => void;
}

const GoogleIcon = () => (
    <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.213,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isApiReady, onShowLocalUsers }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-light">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl text-center">
                <h1 className="text-3xl font-bold text-primary">Gest-Immo PRO</h1>
                <p className="mt-2 text-gray-600">
                    Accedi con il tuo account Google per sincronizzare i dati su tutti i tuoi dispositivi.
                </p>
                
                <div className="pt-4">
                    <button
                        onClick={onLogin}
                        disabled={!isApiReady}
                        className="w-full flex items-center justify-center p-4 text-left bg-white border-2 border-gray-300 rounded-lg hover:bg-secondary hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-wait"
                    >
                        <GoogleIcon />
                        <span className="font-semibold text-lg text-dark flex-1">Accedi con Google</span>
                        <ArrowRight size={20} className="text-gray-400" />
                    </button>
                    {!isApiReady && (
                        <p className="text-xs text-gray-500 mt-2 animate-pulse">
                            Inizializzazione del servizio di autenticazione...
                        </p>
                    )}
                </div>

                <div className="relative flex items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-sm text-gray-400">oppure</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div>
                    <button
                        onClick={onShowLocalUsers}
                        className="w-full flex items-center justify-center p-4 text-left bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                        <UserCircle size={24} className="mr-3 text-gray-600"/>
                        <span className="font-semibold text-gray-700 flex-1">Accedi con un profilo locale</span>
                        <ArrowRight size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="pt-6">
                    <p className="text-xs text-gray-400">&copy; 2024 Gestore Immobili PRO</p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
