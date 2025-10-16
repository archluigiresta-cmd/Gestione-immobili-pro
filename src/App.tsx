
import React, { useState, useEffect, useRef } from 'react';
import {
    LayoutDashboard, Building, Users, FileText, Banknote, CalendarClock, Wrench, Receipt, FolderArchive, AreaChart, PieChart,
    Settings, LifeBuoy, DownloadCloud
} from 'lucide-react';

// Import screens
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
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import ProjectSelectionScreen from './screens/ProjectSelectionScreen';
import UserSelectionScreen from './screens/UserSelectionScreen';

// Import components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import RegisterModal from './components/modals/RegisterModal';
import PasswordModal from './components/modals/PasswordModal';

// Import services and types
import * as dataService from './services/dataService';
import * as googleDriveService from './services/googleDriveService';
import { User, Project, ProjectMemberRole, UserStatus } from './types';

// Screen types and navigation items
export const navigationItems = [
    { screen: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { screen: 'properties', name: 'Immobili', icon: Building },
    { screen: 'tenants', name: 'Inquilini', icon: Users },
    { screen: 'contracts', name: 'Contratti', icon: FileText },
    { screen: 'payments', name: 'Pagamenti', icon: Banknote },
    { screen: 'deadlines', name: 'Scadenze', icon: CalendarClock },
    { screen: 'maintenance', name: 'Manutenzioni', icon: Wrench },
    { screen: 'expenses', name: 'Spese', icon: Receipt },
    { screen: 'documents', name: 'Documenti', icon: FolderArchive },
    { screen: 'reports', name: 'Report', icon: AreaChart },
    { screen: 'financialAnalysis', name: 'Analisi Finanziaria', icon: PieChart },
];

export const secondaryNavigationItems = [
    { screen: 'settings', name: 'Impostazioni', icon: Settings },
    { screen: 'help', name: 'Aiuto & Supporto', icon: LifeBuoy },
    { screen: 'install', name: 'Installa App', icon: DownloadCloud },
];

export type Screen = typeof navigationItems[number]['screen'] | typeof secondaryNavigationItems[number]['screen'] | 'propertyDetail';

// PWA install type
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string; }>;
    prompt(): Promise<void>;
}

const App: React.FC = () => {
    const [appState, setAppState] = useState<'loading' | 'login' | 'selectUser' | 'selectProject' | 'main'>('loading');
    const [user, setUser] = useState<User | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
    const [propertyId, setPropertyId] = useState<string | null>(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isApiReady, setIsApiReady] = useState(false);

    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const [userForPassword, setUserForPassword] = useState<User | null>(null);

    useEffect(() => {
        dataService.migrateData();
        googleDriveService.init(setIsApiReady);

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleLogin = async () => {
        try {
            const loggedInUser = await googleDriveService.signIn();
            const { fileId, data } = await googleDriveService.findOrCreateDataFile();
            dataService.loadDataFromObject(data);
            dataService.setDriveFileId(fileId);

            const existingUser = dataService.getUsers().find(u => u.email === loggedInUser.email);
            if (existingUser) {
                setUser(existingUser);
                setAppState('selectProject');
            } else {
                 const newUser = dataService.addUser({ name: loggedInUser.name, email: loggedInUser.email });
                 dataService.approveUser(newUser.id);
                 setUser(newUser);
                 setAppState('selectProject');
            }
        } catch (error) {
            console.error("Login failed", error);
            if((error as any).result?.error === 'popup_closed_by_user') {
                setAppState('selectUser');
            }
        }
    };
    
    const handleLogout = () => {
        googleDriveService.signOut();
        setUser(null);
        setSelectedProject(null);
        dataService.setDriveFileId(null);
        setAppState('login');
    };
    
    const handleSelectUser = (selectedUser: User) => {
        if (selectedUser.password) {
            setUserForPassword(selectedUser);
        } else {
            setUser(selectedUser);
            setAppState('selectProject');
        }
    };
    
    const handlePasswordConfirm = (password: string) => {
        if (userForPassword && userForPassword.password === password) {
            setUser(userForPassword);
            setAppState('selectProject');
            setUserForPassword(null);
            return true;
        }
        return false;
    };

    const handleSelectProject = (project: Project) => {
        setSelectedProject(project);
        setActiveScreen('dashboard');
        setAppState('main');
    };
    
    const handleCreateProject = (projectName: string) => {
        if(!user) return;
        const newProject = dataService.addProject({
            name: projectName,
            ownerId: user.id,
            members: [{ userId: user.id, role: ProjectMemberRole.OWNER }]
        });
        handleSelectProject(newProject);
    };

    const handleNavigate = (screen: Screen, id?: string) => {
        setActiveScreen(screen);
        if (screen === 'propertyDetail' && id) {
            setPropertyId(id);
        } else {
            setPropertyId(null);
        }
    };
    
    const handleUpdateProfile = (updatedUser: User) => {
        dataService.updateUser(updatedUser);
        setUser(updatedUser);
    };
    
    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsInstallable(false);
            setDeferredPrompt(null);
        }
    };
    
    const renderScreen = () => {
        const userRole = selectedProject?.members.find(m => m.userId === user?.id)?.role || ProjectMemberRole.VIEWER;
        if (!selectedProject || !user) return null;
        
        switch (activeScreen) {
            case 'dashboard': return <DashboardScreen onNavigate={handleNavigate} projectId={selectedProject.id} />;
            case 'properties': return <PropertiesScreen onNavigate={handleNavigate} projectId={selectedProject.id} user={user} userRole={userRole} />;
            case 'propertyDetail': return propertyId ? <PropertyDetailScreen propertyId={propertyId} projectId={selectedProject.id} user={user} userRole={userRole} onBack={() => setActiveScreen('properties')} onNavigate={(screen) => handleNavigate(screen as Screen)} /> : null;
            case 'contracts': return <ContractsScreen projectId={selectedProject.id} user={user} userRole={userRole} />;
            case 'tenants': return <TenantsScreen projectId={selectedProject.id} user={user} />;
            case 'payments': return <PaymentsScreen projectId={selectedProject.id} user={user} userRole={userRole} />;
            case 'deadlines': return <DeadlinesScreen projectId={selectedProject.id} user={user} />;
            case 'maintenance': return <MaintenanceScreen projectId={selectedProject.id} user={user} />;
            case 'expenses': return <ExpensesScreen projectId={selectedProject.id} user={user} />;
            case 'documents': return <DocumentsScreen projectId={selectedProject.id} user={user} />;
            case 'reports': return <ReportsScreen projectId={selectedProject.id} />;
            case 'financialAnalysis': return <FinancialAnalysisScreen projectId={selectedProject.id} />;
            case 'settings': return <SettingsScreen 
                user={user} 
                project={selectedProject}
                onUpdateProfile={handleUpdateProfile} 
                onUpdateProject={(p) => { dataService.updateProject(p); setSelectedProject(p); }}
                onAddUser={(u) => dataService.addUser(u)}
                onDeleteUser={(id) => dataService.deleteUser(id)}
                onApproveUser={(id) => dataService.approveUser(id)}
                userRole={userRole}
            />;
            case 'help': return <HelpScreen />;
            default: return <DashboardScreen onNavigate={handleNavigate} projectId={selectedProject.id} />;
        }
    };
    
    if (appState === 'loading' && !isApiReady) return <SplashScreen />;
    if (appState === 'loading' && isApiReady) setAppState('login');

    if (appState === 'login') return <LoginScreen onLogin={handleLogin} isApiReady={isApiReady} />;
    
    if (appState === 'selectUser') {
        const users = dataService.getUsers().filter(u => u.status === UserStatus.ACTIVE);
        return <UserSelectionScreen users={users} onSelectUser={handleSelectUser} onLogout={() => setAppState('login')} />;
    }

    if (!user) {
         if (appState !== 'login') setAppState('login'); // safety net
         return <LoginScreen onLogin={handleLogin} isApiReady={isApiReady} />;
    }
    
    if (appState === 'selectProject') {
        return <ProjectSelectionScreen 
            user={user} 
            onSelectProject={handleSelectProject} 
            onCreateProject={handleCreateProject}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            onSwitchUser={() => setAppState('selectUser')}
        />
    }

    if (appState === 'main' && selectedProject) {
        const currentScreenItem = [...navigationItems, ...secondaryNavigationItems].find(item => item.screen === activeScreen);
        return (
            <div className="flex h-screen bg-light">
                <Sidebar 
                    activeScreen={activeScreen} 
                    setActiveScreen={(s) => handleNavigate(s)} 
                    isSidebarOpen={isSidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                    onInstall={handleInstall}
                    isInstallable={isInstallable}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header 
                        currentScreen={currentScreenItem?.name || 'Dettaglio'}
                        currentProjectName={selectedProject.name}
                        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
                        user={user}
                        onLogout={handleLogout}
                        onNavigate={(s) => handleNavigate(s)}
                        onBackToProjects={() => setAppState('selectProject')}
                        pendingUsersCount={dataService.getUsers().filter(u => u.status === UserStatus.PENDING).length}
                    />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                        {renderScreen()}
                    </main>
                </div>
            </div>
        );
    }
    
    return (
        <>
            <SplashScreen />
            {isRegisterModalOpen && <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)} onRegister={(u) => { dataService.addUser(u); alert('Registrazione inviata. Attendi approvazione.'); setRegisterModalOpen(false); }} />}
            {userForPassword && <PasswordModal isOpen={!!userForPassword} onClose={() => {setUserForPassword(null); setAppState('selectUser')}} onConfirm={handlePasswordConfirm} />}
        </>
    );
};

export default App;
