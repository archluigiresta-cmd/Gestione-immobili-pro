import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Building, FileText, Users, DollarSign, Calendar, Wrench, BarChart3, HelpCircle, Settings, Download, LineChart, Library } from 'lucide-react';
import * as dataService from './services/dataService';
import * as googleDriveService from './services/googleDriveService';
import { User, Project, ProjectMemberRole, UserStatus, AppData } from './types';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import UserSelectionScreen from './screens/UserSelectionScreen';
import ProjectSelectionScreen from './screens/ProjectSelectionScreen';
import PasswordModal from './components/modals/PasswordModal';

import DashboardScreen from './screens/DashboardScreen';
import PropertiesScreen from './screens/PropertiesScreen';
import PropertyDetailScreen from './screens/PropertyDetailScreen';
import ContractsScreen from './screens/ContractsScreen';
import TenantsScreen from './screens/TenantsScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import DeadlinesScreen from './screens/DeadlinesScreen';
import MaintenanceScreen from './screens/MaintenanceScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import ReportsScreen from './screens/ReportsScreen';
import FinancialAnalysisScreen from './screens/FinancialAnalysisScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpScreen from './screens/HelpScreen';

export type Screen = 'dashboard' | 'properties' | 'propertyDetail' | 'contracts' | 'tenants' | 'payments' | 'deadlines' | 'maintenance' | 'expenses' | 'documents' | 'reports' | 'financialAnalysis' | 'settings' | 'help' | 'install';

export const navigationItems = [
  { screen: 'dashboard' as Screen, name: 'Dashboard', icon: LayoutDashboard },
  { screen: 'properties' as Screen, name: 'Immobili', icon: Building },
  { screen: 'tenants' as Screen, name: 'Inquilini', icon: Users },
  { screen: 'contracts' as Screen, name: 'Contratti', icon: FileText },
  { screen: 'payments' as Screen, name: 'Pagamenti', icon: DollarSign },
  { screen: 'deadlines' as Screen, name: 'Scadenze', icon: Calendar },
  { screen: 'maintenance' as Screen, name: 'Manutenzioni', icon: Wrench },
  { screen: 'expenses' as Screen, name: 'Spese', icon: DollarSign },
  { screen: 'documents' as Screen, name: 'Documenti', icon: FileText },
  { screen: 'reports' as Screen, name: 'Report', icon: BarChart3 },
  { screen: 'financialAnalysis' as Screen, name: 'Analisi Finanziaria', icon: LineChart },
];

export const secondaryNavigationItems = [
    { screen: 'settings' as Screen, name: 'Impostazioni', icon: Settings },
    { screen: 'help' as Screen, name: 'Aiuto', icon: HelpCircle },
    { screen: 'install' as Screen, name: 'Installa App', icon: Download },
];

function App() {
  const [loading, setLoading] = useState(true);
  const [isGoogleApiReady, setGoogleApiReady] = useState(false);
  
  const [googleUser, setGoogleUser] = useState<User | null>(null); // User from Google Sign-In
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // User profile selected to operate with

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [propertyDetailId, setPropertyDetailId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [driveFileId, setDriveFileId] = useState<string | null>(null);

  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [userToAuthenticate, setUserToAuthenticate] = useState<User | null>(null);


  useEffect(() => {
    googleDriveService.init((isReady) => {
      setGoogleApiReady(isReady);
      setLoading(false); 
    });
    
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    setDeferredInstallPrompt(null);
    setIsInstallable(false);
  };
  
  const handleLogin = async () => {
    if (!isGoogleApiReady) return;
    setLoading(true);
    try {
      const user = await googleDriveService.signIn();
      const { fileId, data } = await googleDriveService.findOrCreateDataFile();
      
      dataService.loadDataFromObject(data);
      dataService.setDriveFileId(fileId);
      
      setDriveFileId(fileId);
      setGoogleUser(user);
      setAllUsers(dataService.getUsers());
      
    } catch (error) {
        console.error("Google Sign-In or data loading failed", error);
        alert("Accesso con Google o caricamento dati non riuscito. Controlla la console.");
    } finally {
        setLoading(false);
    }
  };

  const loginAsUser = (user: User) => {
    setSelectedUser(user);
    setPasswordModalOpen(false);
    setUserToAuthenticate(null);
  };

  const handleUserSelection = (user: User) => {
    if (user.password) {
      setUserToAuthenticate(user);
      setPasswordModalOpen(true);
    } else {
      loginAsUser(user);
    }
  };

  const handlePasswordConfirm = (password: string) => {
    if (userToAuthenticate && userToAuthenticate.password === password) {
      loginAsUser(userToAuthenticate);
      return true;
    }
    return false;
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    localStorage.setItem('lastProjectId', project.id);
    setActiveScreen('dashboard');
  };

  const handleCreateProject = (projectName: string) => {
    if (!selectedUser) return;
    const newProjectData = {
      name: projectName,
      ownerId: selectedUser.id,
      members: [{ userId: selectedUser.id, role: ProjectMemberRole.OWNER }]
    };
    const newProject = dataService.addProject(newProjectData);
    handleSelectProject(newProject);
  };
  
  const handleLogout = () => {
    googleDriveService.signOut();
    dataService.setDriveFileId(null);
    setGoogleUser(null);
    setSelectedUser(null);
    setCurrentProject(null);
    setDriveFileId(null);
    localStorage.removeItem('lastProjectId');
  };

  const handleSwitchUser = () => {
    setSelectedUser(null);
    setCurrentProject(null);
    localStorage.removeItem('lastProjectId');
  }
  
  const handleBackToProjects = () => {
    setCurrentProject(null);
    localStorage.removeItem('lastProjectId');
  };
  
  const handleNavigate = (screen: Screen, propertyId?: string) => {
    if (screen === 'propertyDetail' && propertyId) {
      setPropertyDetailId(propertyId);
    } else {
      setPropertyDetailId(null);
    }
    setActiveScreen(screen);
  };

  const refreshUsers = useCallback(() => setAllUsers(dataService.getUsers()), []);
  const handleUpdateProfile = (updatedUser: User) => {
      dataService.updateUser(updatedUser);
      setSelectedUser(updatedUser);
      refreshUsers();
  };
  const handleUpdateProject = (updatedProject: Project) => {
      dataService.updateProject(updatedProject);
      setCurrentProject(updatedProject);
  };

  if (loading) return <SplashScreen />;
  if (!googleUser) return <LoginScreen onLogin={handleLogin} isApiReady={isGoogleApiReady} />;
  if (!selectedUser) return <UserSelectionScreen users={allUsers} onSelectUser={handleUserSelection} onLogout={handleLogout} />;
  if (!currentProject) return <ProjectSelectionScreen user={selectedUser} onSelectProject={handleSelectProject} onCreateProject={handleCreateProject} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} onSwitchUser={handleSwitchUser} />;

  const userRole = currentProject.members.find(m => m.userId === selectedUser.id)?.role || ProjectMemberRole.VIEWER;
  const pendingUsersCount = allUsers.filter(u => u.status === UserStatus.PENDING).length;

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard': return <DashboardScreen onNavigate={handleNavigate} projectId={currentProject.id} />;
      case 'properties': return <PropertiesScreen onNavigate={handleNavigate} projectId={currentProject.id} user={selectedUser} userRole={userRole} />;
      case 'propertyDetail': return propertyDetailId ? <PropertyDetailScreen propertyId={propertyDetailId} projectId={currentProject.id} user={selectedUser} userRole={userRole} onBack={() => handleNavigate('properties')} onNavigate={handleNavigate}/> : <PropertiesScreen onNavigate={handleNavigate} projectId={currentProject.id} user={selectedUser} userRole={userRole} />;
      case 'contracts': return <ContractsScreen projectId={currentProject.id} user={selectedUser} userRole={userRole} />;
      case 'tenants': return <TenantsScreen projectId={currentProject.id} user={selectedUser} />;
      case 'payments': return <PaymentsScreen projectId={currentProject.id} user={selectedUser} userRole={userRole} />;
      case 'deadlines': return <DeadlinesScreen projectId={currentProject.id} user={selectedUser} />;
      case 'maintenance': return <MaintenanceScreen projectId={currentProject.id} user={selectedUser} />;
      case 'expenses': return <ExpensesScreen projectId={currentProject.id} user={selectedUser} />;
      case 'documents': return <DocumentsScreen projectId={currentProject.id} user={selectedUser} />;
      case 'reports': return <ReportsScreen projectId={currentProject.id} />;
      case 'financialAnalysis': return <FinancialAnalysisScreen projectId={currentProject.id} />;
      case 'settings': return <SettingsScreen user={selectedUser} project={currentProject} userRole={userRole} onUpdateProfile={handleUpdateProfile} onUpdateProject={handleUpdateProject} onAddUser={(data) => { dataService.addUser(data); refreshUsers(); }} onDeleteUser={(id) => { dataService.deleteUser(id); refreshUsers(); }} onApproveUser={(id) => { dataService.approveUser(id); refreshUsers(); }} />;
      case 'help': return <HelpScreen />;
      default: return <DashboardScreen onNavigate={handleNavigate} projectId={currentProject.id} />;
    }
  };

  return (
    <>
      <div className="flex h-screen bg-light">
        <Sidebar 
          activeScreen={activeScreen} 
          setActiveScreen={setActiveScreen}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onInstall={handleInstall}
          isInstallable={isInstallable}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            currentScreen={navigationItems.find(item => item.screen === activeScreen)?.name || secondaryNavigationItems.find(item => item.screen === activeScreen)?.name || 'Dashboard'} 
            currentProjectName={currentProject.name}
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
            user={selectedUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            onBackToProjects={handleBackToProjects}
            pendingUsersCount={pendingUsersCount}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light p-6">
            {renderScreen()}
          </main>
        </div>
      </div>
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onConfirm={handlePasswordConfirm}
      />
    </>
  );
}

export default App;