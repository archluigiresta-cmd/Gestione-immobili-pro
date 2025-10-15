import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Building, FileText, Users, DollarSign, Calendar, Wrench, BarChart3, HelpCircle, Settings, Download, LineChart, Library } from 'lucide-react';
import * as dataService from './services/dataService';
import { User, Project, ProjectMemberRole, UserStatus } from './types';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import ProjectSelectionScreen from './screens/ProjectSelectionScreen';
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

// Dummy implementation for now
// A real implementation will be added in the next steps
const googleDriveService = {
  init: (callback: (isReady: boolean) => void) => { 
      // Simulate API loading
      setTimeout(() => callback(true), 1500);
  },
  signIn: () => {
    // Simulate a successful sign-in
    const mockUser: User = { id: 'user-1', name: 'Luigi Resta (from Google)', email: 'arch.luigiresta@gmail.com', status: UserStatus.ACTIVE };
    return Promise.resolve(mockUser);
  },
  signOut: () => {
    // Simulate sign-out
    return Promise.resolve();
  }
};


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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [propertyDetailId, setPropertyDetailId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [users, setUsers] = useState<User[]>([]); // This will be sourced from Drive file later

  useEffect(() => {
    // Initialize Google services
    googleDriveService.init((isReady) => {
      setGoogleApiReady(isReady);
      setLoading(false); // Stop initial loading splash screen
    });
    
    // PWA install prompt handler
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
    try {
      const user = await googleDriveService.signIn();
      // In a real scenario, we would now fetch the data file from Drive.
      // For now, we'll use local mock data but set the user from Google.
      setCurrentUser(user);
      
      // We will replace this with data from the drive file.
      setUsers(dataService.getUsers());
      // For now, we will still check for the last project in local storage
      const lastProjectId = localStorage.getItem('lastProjectId');
      if (lastProjectId) {
        const project = dataService.getProjectsForUser(user.id).find(p => p.id === lastProjectId);
        if (project) {
          setCurrentProject(project);
        }
      }
    } catch (error) {
        console.error("Google Sign-In failed", error);
        // Here you could show an error message to the user
    }
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    localStorage.setItem('lastProjectId', project.id);
    setActiveScreen('dashboard');
  };

  const handleCreateProject = (projectName: string) => {
    if (!currentUser) return;
    const newProjectData = {
      name: projectName,
      ownerId: currentUser.id,
      members: [{ userId: currentUser.id, role: ProjectMemberRole.OWNER }]
    };
    const newProject = dataService.addProject(newProjectData);
    handleSelectProject(newProject);
  };
  
  const handleLogout = async () => {
    await googleDriveService.signOut();
    setCurrentUser(null);
    setCurrentProject(null);
    localStorage.removeItem('lastProjectId'); // Keep local data, but clear session
  };
  
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

  // These functions will be adapted to write to Google Drive later
  const refreshUsers = useCallback(() => setUsers(dataService.getUsers()), []);
  const handleUpdateProfile = (updatedUser: User) => {
      dataService.updateUser(updatedUser);
      setCurrentUser(updatedUser);
      refreshUsers();
  };
  const handleUpdateProject = (updatedProject: Project) => {
      dataService.updateProject(updatedProject);
      setCurrentProject(updatedProject);
  };

  if (loading) return <SplashScreen />;
  if (!currentUser) return <LoginScreen onLogin={handleLogin} isApiReady={isGoogleApiReady} />;
  if (!currentProject) return <ProjectSelectionScreen user={currentUser} onSelectProject={handleSelectProject} onCreateProject={handleCreateProject} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />;

  const userRole = currentProject.members.find(m => m.userId === currentUser.id)?.role || ProjectMemberRole.VIEWER;
  const pendingUsersCount = users.filter(u => u.status === UserStatus.PENDING).length;

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard': return <DashboardScreen onNavigate={handleNavigate} projectId={currentProject.id} />;
      case 'properties': return <PropertiesScreen onNavigate={handleNavigate} projectId={currentProject.id} user={currentUser} userRole={userRole} />;
      case 'propertyDetail': return propertyDetailId ? <PropertyDetailScreen propertyId={propertyDetailId} projectId={currentProject.id} user={currentUser} userRole={userRole} onBack={() => handleNavigate('properties')} onNavigate={handleNavigate}/> : <PropertiesScreen onNavigate={handleNavigate} projectId={currentProject.id} user={currentUser} userRole={userRole} />;
      case 'contracts': return <ContractsScreen projectId={currentProject.id} user={currentUser} userRole={userRole} />;
      case 'tenants': return <TenantsScreen projectId={currentProject.id} user={currentUser} />;
      case 'payments': return <PaymentsScreen projectId={currentProject.id} user={currentUser} userRole={userRole} />;
      case 'deadlines': return <DeadlinesScreen projectId={currentProject.id} user={currentUser} />;
      case 'maintenance': return <MaintenanceScreen projectId={currentProject.id} user={currentUser} />;
      case 'expenses': return <ExpensesScreen projectId={currentProject.id} user={currentUser} />;
      case 'documents': return <DocumentsScreen projectId={currentProject.id} user={currentUser} />;
      case 'reports': return <ReportsScreen projectId={currentProject.id} />;
      case 'financialAnalysis': return <FinancialAnalysisScreen projectId={currentProject.id} />;
      case 'settings': return <SettingsScreen user={currentUser} project={currentProject} userRole={userRole} onUpdateProfile={handleUpdateProfile} onUpdateProject={handleUpdateProject} onAddUser={(data) => { dataService.addUser(data); refreshUsers(); }} onDeleteUser={(id) => { dataService.deleteUser(id); refreshUsers(); }} onApproveUser={(id) => { dataService.approveUser(id); refreshUsers(); }} />;
      case 'help': return <HelpScreen />;
      default: return <DashboardScreen onNavigate={handleNavigate} projectId={currentProject.id} />;
    }
  };

  return (
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
          user={currentUser}
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
  );
}

export default App;