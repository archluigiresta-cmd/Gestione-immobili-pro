
import React, { useState, useEffect } from 'react';
import { Home, Building2, FileText, Calendar, Users, Wrench, CircleDollarSign, Download, BarChart2, Settings, LifeBuoy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import * as dataService from './services/dataService';
import { User } from './types';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginScreen from './screens/LoginScreen';
import SplashScreen from './screens/SplashScreen';
import DashboardScreen from './screens/DashboardScreen';
import PropertiesScreen from './screens/PropertiesScreen';
import PropertyDetailScreen from './screens/PropertyDetailScreen';
import ContractsScreen from './screens/ContractsScreen';
import DeadlinesScreen from './screens/DeadlinesScreen';
import TenantsScreen from './screens/TenantsScreen';
import MaintenanceScreen from './screens/MaintenanceScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import SettingsScreen from './screens/SettingsScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import ReportsScreen from './screens/ReportsScreen';


export type Screen = 'dashboard' | 'properties' | 'propertyDetail' | 'contracts' | 'documents' | 'deadlines' | 'tenants' | 'maintenance' | 'expenses' | 'payments' | 'reports' | 'settings' | 'help' | 'install';

const screenComponents: Record<Screen, React.FC<any>> = {
  dashboard: DashboardScreen,
  properties: PropertiesScreen,
  propertyDetail: PropertyDetailScreen,
  contracts: ContractsScreen,
  documents: DocumentsScreen,
  deadlines: DeadlinesScreen,
  tenants: TenantsScreen,
  maintenance: MaintenanceScreen,
  expenses: ExpensesScreen,
  payments: PaymentsScreen,
  reports: ReportsScreen,
  settings: SettingsScreen,
  help: () => <div className="p-6">Help & Support coming soon.</div>,
  install: () => null, // Placeholder, handled by button
};

const getScreenName = (screen: Screen): string => {
  const item = [...navigationItems, ...secondaryNavigationItems].find(i => i.screen === screen);
  if (screen === 'propertyDetail') return 'Dettaglio Immobile';
  return item ? item.name : 'Dashboard';
};

interface NavItem {
  screen: Screen;
  name: string;
  icon: LucideIcon;
}

export const navigationItems: NavItem[] = [
  { screen: 'dashboard', name: 'Dashboard', icon: Home },
  { screen: 'properties', name: 'Immobili', icon: Building2 },
  { screen: 'contracts', name: 'Contratti', icon: FileText },
  { screen: 'payments', name: 'Pagamenti', icon: CircleDollarSign },
  { screen: 'deadlines', name: 'Scadenze', icon: Calendar },
  { screen: 'tenants', name: 'Inquilini', icon: Users },
  { screen: 'maintenance', name: 'Manutenzioni', icon: Wrench },
  { screen: 'expenses', name: 'Spese', icon: CircleDollarSign },
  { screen: 'documents', name: 'Documenti', icon: FileText },
  { screen: 'reports', name: 'Report', icon: BarChart2 },
];

export const secondaryNavigationItems: NavItem[] = [
  { screen: 'settings', name: 'Impostazioni', icon: Settings },
  { screen: 'help', name: 'Aiuto e Supporto', icon: LifeBuoy },
  { screen: 'install', name: 'Installa App', icon: Download },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [propertyId, setPropertyId] = useState<string | null>(null);
  
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setIsInstallable(true);
      setDeferredPrompt(e);
    });

    // Check for logged-in user
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
      const currentUser = dataService.getUser(loggedInUserId);
      setUser(currentUser || null);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userId: string) => {
    const currentUser = dataService.getUser(userId);
    if (currentUser) {
      setUser(currentUser);
      localStorage.setItem('loggedInUserId', userId);
    }
  };
  
  const handleRegister = (userData: Omit<User, 'id'>) => {
    const newUser = dataService.addUser(userData);
    handleLogin(newUser.id);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('loggedInUserId');
    setActiveScreen('dashboard');
  };
  
  const handleNavigate = (screen: Screen, id?: string) => {
    setActiveScreen(screen);
    if (id) {
      setPropertyId(id);
    } else {
      setPropertyId(null);
    }
  };
  
  const handleUpdateProfile = (updatedUser: User) => {
    dataService.updateUser(updatedUser);
    setUser(updatedUser);
  };
  
  const handleAddUser = (userData: Omit<User, 'id'>) => {
    dataService.addUser(userData);
  };

  const handleDeleteUser = (userId: string) => {
    dataService.deleteUser(userId);
  };

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setIsInstallable(false);
        setDeferredPrompt(null);
      });
    }
  };


  if (loading) return <SplashScreen />;
  if (!user) return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />;

  const CurrentScreenComponent = screenComponents[activeScreen];

  return (
    <div className="flex h-screen bg-light">
      <Sidebar 
        activeScreen={activeScreen}
        setActiveScreen={handleNavigate}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onInstall={handleInstall}
        isInstallable={isInstallable}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentScreen={getScreenName(activeScreen)} 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          <CurrentScreenComponent 
            onNavigate={handleNavigate} 
            propertyId={propertyId}
            onBack={() => handleNavigate('properties')}
            user={user}
            onUpdateProfile={handleUpdateProfile}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
          />
        </main>
      </div>
    </div>
  );
};

export default App;