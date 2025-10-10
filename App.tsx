
import React, { useState, useEffect } from 'react';
import { Home, FileText, Calendar, File, Users, Wrench, DollarSign, Building2, CreditCard, Settings, Download } from 'lucide-react';
import DashboardScreen from './screens/DashboardScreen';
import PropertiesScreen from './screens/PropertiesScreen';
import ContractsScreen from './screens/ContractsScreen';
import DeadlinesScreen from './screens/DeadlinesScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import TenantsScreen from './screens/TenantsScreen';
import MaintenanceScreen from './screens/MaintenanceScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { User } from './types';
import * as dataService from './services/dataService';


export type Screen = 'dashboard' | 'properties' | 'contracts' | 'deadlines' | 'documents' | 'tenants' | 'maintenance' | 'expenses' | 'payments' | 'settings' | 'install';

export const navigationItems = [
  { name: 'Dashboard', icon: Home, screen: 'dashboard' as Screen },
  { name: 'Immobili', icon: Building2, screen: 'properties' as Screen },
  { name: 'Contratti', icon: FileText, screen: 'contracts' as Screen },
  { name: 'Scadenze', icon: Calendar, screen: 'deadlines' as Screen },
  { name: 'Documenti', icon: File, screen: 'documents' as Screen },
  { name: 'Inquilini', icon: Users, screen: 'tenants' as Screen },
  { name: 'Manutenzioni', icon: Wrench, screen: 'maintenance' as Screen },
  { name: 'Spese', icon: DollarSign, screen: 'expenses' as Screen },
  { name: 'Pagamenti', icon: CreditCard, screen: 'payments' as Screen },
];

export const secondaryNavigationItems = [
    { name: 'Impostazioni', icon: Settings, screen: 'settings' as Screen },
    { name: 'Installa App', icon: Download, screen: 'install' as Screen },
];

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check for an active user session in localStorage on initial load
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId) {
      const users = dataService.getUsers();
      const user = users.find(u => u.id === currentUserId);
      setCurrentUser(user || null);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if (!installPromptEvent) return;

    (installPromptEvent as any).prompt();
    (installPromptEvent as any).userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPromptEvent(null);
    });
  };
  
  const handleLogin = (userId: string) => {
    const users = dataService.getUsers();
    const user = users.find(u => u.id === userId);
    if(user) {
        setCurrentUser(user);
        localStorage.setItem('currentUserId', userId);
        setActiveScreen('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUserId');
    setCurrentUser(null);
  };

  const handleProfileUpdate = (updatedUserData: User) => {
    const updatedUser = dataService.updateUser(updatedUserData);
    setCurrentUser(updatedUser);
  };

  const renderScreen = () => {
    if (!currentUser) return null; // Should not happen if logic is correct
    switch (activeScreen) {
      case 'dashboard': return <DashboardScreen />;
      case 'properties': return <PropertiesScreen />;
      case 'contracts': return <ContractsScreen />;
      case 'deadlines': return <DeadlinesScreen />;
      case 'documents': return <DocumentsScreen />;
      case 'tenants': return <TenantsScreen />;
      case 'maintenance': return <MaintenanceScreen />;
      case 'expenses': return <ExpensesScreen />;
      case 'payments': return <PaymentsScreen />;
      case 'settings': return <SettingsScreen user={currentUser} onUpdateProfile={handleProfileUpdate} />;
      default: return <DashboardScreen />;
    }
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-light">
      <Sidebar 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
        isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        onInstall={handleInstall}
        isInstallable={!!installPromptEvent}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentScreen={[...navigationItems, ...secondaryNavigationItems].find(item => item.screen === activeScreen)?.name || 'Dashboard'} 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          user={currentUser}
          onLogout={handleLogout}
          onNavigate={setActiveScreen}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light p-4 md:p-6 lg:p-8">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
};

export default App;
