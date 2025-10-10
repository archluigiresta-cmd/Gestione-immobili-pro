
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { User } from '../types';
import { UserCircle, Palette, Bell, CheckCircle, Users as UsersIcon, PlusCircle, Trash2 } from 'lucide-react';
import EditProfileModal from '../components/modals/EditProfileModal';
import AddUserModal from '../components/modals/AddUserModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import * as dataService from '../services/dataService';

interface SettingsScreenProps {
  user: User;
  onUpdateProfile: (user: User) => void;
  onAddUser: (userData: Omit<User, 'id'>) => void;
  onDeleteUser: (userId: string) => void;
}

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void; }> = ({ label, enabled, onChange }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-gray-700">{label}</span>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-gray-200'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
    </div>
);


const SettingsScreen: React.FC<SettingsScreenProps> = ({ user, onUpdateProfile, onAddUser, onDeleteUser }) => {
    const [settings, setSettings] = useState({
        darkMode: false,
        emailNotifications: true,
    });
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("Modifiche salvate!");

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        setAllUsers(dataService.getUsers());
    };

    const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
        setSettings(prev => ({...prev, [key]: value}));
    };
    
    const showSuccessWithMessage = (message = "Modifiche salvate!") => {
        setSuccessMessage(message);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    }

    const handleSaveSettings = () => {
        console.log("Impostazioni salvate:", settings);
        showSuccessWithMessage();
    }

    const handleSaveProfile = (updatedUser: User) => {
        onUpdateProfile(updatedUser);
        setProfileModalOpen(false);
        showSuccessWithMessage();
        loadUsers();
    }

    const handleSaveNewUser = (userData: Omit<User, 'id'>) => {
        onAddUser(userData);
        setAddUserModalOpen(false);
        loadUsers();
        showSuccessWithMessage("Utente aggiunto con successo!");
    }

    const handleDeleteUser = () => {
        if (deletingUser) {
            onDeleteUser(deletingUser.id);
            setDeletingUser(null);
            loadUsers();
            showSuccessWithMessage("Utente eliminato.");
        }
    }

  return (
    <>
    <div className="max-w-4xl mx-auto space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-dark">Impostazioni</h1>
            <p className="text-gray-500 mt-1">Gestisci il tuo profilo e le preferenze dell'applicazione.</p>
        </div>

      <Card className="p-6">
        <div className="flex items-center">
            <UserCircle size={64} className="text-primary mr-6"/>
            <div>
                <h2 className="text-2xl font-bold text-dark">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <button onClick={() => setProfileModalOpen(true)} className="mt-2 text-sm text-primary hover:underline">Modifica profilo</button>
            </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-xl font-bold text-dark mb-4 border-b pb-2 flex justify-between items-center">
            <span className="flex items-center"><UsersIcon size={20} className="mr-3 text-primary" />Gestione Utenti</span>
            <button onClick={() => setAddUserModalOpen(true)} className="flex items-center text-sm px-3 py-1.5 bg-secondary text-primary font-semibold rounded-lg hover:bg-blue-200 transition-colors">
                <PlusCircle size={16} className="mr-2"/> Aggiungi Utente
            </button>
        </h3>
        <div className="space-y-3">
            {allUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                        <UserCircle size={28} className="text-primary mr-3"/>
                        <div>
                            <p className="font-semibold text-dark">{u.name} {u.id === user.id && <span className="text-xs font-normal text-gray-500">(Tu)</span>}</p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                    </div>
                    {u.id !== user.id && (
                        <button onClick={() => setDeletingUser(u)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                            <Trash2 size={18}/>
                        </button>
                    )}
                </div>
            ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-bold text-dark mb-4 border-b pb-2">Preferenze Applicazione</h3>
        <div className="space-y-4">
            <div className="flex items-start">
                <Palette className="w-5 h-5 mr-3 text-primary mt-3"/>
                <div className="flex-1">
                    <h4 className="font-semibold text-dark">Tema</h4>
                    <p className="text-sm text-gray-500 mb-2">Scegli tra il tema chiaro e scuro.</p>
                    <ToggleSwitch label="Tema Scuro" enabled={settings.darkMode} onChange={(val) => handleSettingChange('darkMode', val)} />
                </div>
            </div>
             <div className="flex items-start">
                <Bell className="w-5 h-5 mr-3 text-primary mt-3"/>
                <div className="flex-1">
                    <h4 className="font-semibold text-dark">Notifiche</h4>
                    <p className="text-sm text-gray-500 mb-2">Gestisci come ricevi le notifiche.</p>
                    <ToggleSwitch label="Notifiche Email" enabled={settings.emailNotifications} onChange={(val) => handleSettingChange('emailNotifications', val)} />
                </div>
            </div>
        </div>
      </Card>

      <div className="flex justify-end items-center">
        {showSuccess && (
            <div className="flex items-center text-green-600 mr-4 transition-opacity duration-300">
                <CheckCircle size={18} className="mr-1" />
                <span className="font-semibold">{successMessage}</span>
            </div>
        )}
        <button
            onClick={handleSaveSettings}
            className="px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
            Salva Preferenze
        </button>
      </div>

    </div>
    <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onSave={handleSaveProfile}
    />
     <AddUserModal 
        isOpen={isAddUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        onSave={handleSaveNewUser}
    />
    {deletingUser && (
        <ConfirmDeleteModal
            isOpen={!!deletingUser}
            onClose={() => setDeletingUser(null)}
            onConfirm={handleDeleteUser}
            message={`Sei sicuro di voler eliminare l'utente "${deletingUser.name}"? Questa azione è irreversibile.`}
        />
    )}
    </>
  );
};

export default SettingsScreen;