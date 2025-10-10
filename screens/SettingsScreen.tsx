
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { User } from '../types';
import { UserCircle, Palette, Bell, CheckCircle } from 'lucide-react';

interface SettingsScreenProps {
  user: User;
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


const SettingsScreen: React.FC<SettingsScreenProps> = ({ user }) => {
    const [settings, setSettings] = useState({
        darkMode: false,
        emailNotifications: true,
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
        setSettings(prev => ({...prev, [key]: value}));
    };

    const handleSave = () => {
        console.log("Impostazioni salvate:", settings);
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    }

  return (
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
                <button className="mt-2 text-sm text-primary hover:underline">Modifica profilo</button>
            </div>
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
                <span className="font-semibold">Impostazioni salvate!</span>
            </div>
        )}
        <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
            Salva Impostazioni
        </button>
      </div>

    </div>
  );
};

export default SettingsScreen;
