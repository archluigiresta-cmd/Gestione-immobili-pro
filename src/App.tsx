import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';

// Import screens
import DashboardScreen from './screens/DashboardScreen.tsx';
import PropertiesScreen from './screens/PropertiesScreen.tsx';
import PropertyDetailScreen from './screens/PropertyDetailScreen.tsx';
import ContractsScreen from './screens/ContractsScreen.tsx';
import TenantsScreen from './screens/TenantsScreen.tsx';
import PaymentsScreen from './screens/PaymentsScreen.tsx';
import DeadlinesScreen from './screens/DeadlinesScreen.tsx';
import MaintenanceScreen from './screens/MaintenanceScreen.tsx';
import ExpensesScreen from './screens/ExpensesScreen.tsx';
import DocumentsScreen from './screens/DocumentsScreen.tsx';
import ReportsScreen from './screens/ReportsScreen.tsx';
import FinancialAnalysisScreen from './screens/FinancialAnalysisScreen.tsx';
import SettingsScreen from './screens/SettingsScreen.tsx';
import HelpScreen from './screens/HelpScreen.tsx';
import SplashScreen from './screens/SplashScreen.tsx';
import LoginScreen from './screens/LoginScreen.tsx';
import ProjectSelectionScreen from './screens/ProjectSelectionScreen.tsx';
import UserSelectionScreen from './screens/UserSelectionScreen.tsx';

// Import services and types
import * as dataService from './services/dataService.ts';
import * as googleDriveService from './services/googleDriveService.ts';
import { User, Project, ProjectMemberRole, UserStatus, navigationItems, secondaryNavigationItems, Screen } from './types.ts';

// Lazy load modals
const RegisterModal = lazy(() => import('./components/modals/RegisterModal.tsx'));
const PasswordModal = lazy(() => import('./components/modals/PasswordModal.tsx'));
const Sidebar = lazy(() => import('./components/layout/Sidebar.tsx'));
const Header = lazy(() => import('./components/layout/Header.tsx'));


// PWA install type
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string; }>;
    prompt(): Promise<void>;
}

const App: React.FC = () => {
    const [appState, setAppState] = useState<'login' | 'selectUser' | 'selectProject' | 'main'>('login');
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

    const handleGoogleLogin = async () => {
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
            console.error("Login failed or cancelled", error);
        }
    };
    
    const handleLogout = () => {
        if (user?.email && user.id.length > 15) { // Heuristic to check if it's a Google ID
          googleDriveService.signOut();
        }
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
    
    const handleRegister = (userData: Omit<User, 'id' | 'status'>) => {
        dataService.addUser(userData);
        setRegisterModalOpen(false);
        alert("Richiesta di registrazione inviata. Un amministratore dovrà approvare il tuo account.");
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
    
    if (!isApiReady) {
        return <SplashScreen />;
    }
    
    const activeUsers = dataService.getUsers().filter(u => u.status === UserStatus.ACTIVE);
    const localUsers = activeUsers.filter(u => u.password);

    if (appState === 'login') {
        return (
            <Suspense fallback={<SplashScreen />}>
                <LoginScreen 
                    onGoogleLogin={handleGoogleLogin}
                    onCollaboratorLogin={() => setAppState('selectUser')}
                    onRegister={() => setRegisterModalOpen(true)}
                    isApiReady={isApiReady}
                    hasLocalUsers={localUsers.length > 0}
                />
                <RegisterModal 
                    isOpen={isRegisterModalOpen}
                    onClose={() => setRegisterModalOpen(false)}
                    onRegister={handleRegister}
                />
            </Suspense>
        );
    }

    if (appState === 'selectUser') {
        return (
            <Suspense fallback={<SplashScreen />}>
                <UserSelectionScreen
                    users={localUsers}
                    onSelectUser={handleSelectUser}
                    onBackToLogin={() => setAppState('login')}
                    onRegister={() => setRegisterModalOpen(true)}
                />
                {userForPassword && <PasswordModal isOpen={!!userForPassword} onClose={() => {setUserForPassword(null);}} onConfirm={handlePasswordConfirm} />}
                <RegisterModal 
                    isOpen={isRegisterModalOpen}
                    onClose={() => setRegisterModalOpen(false)}
                    onRegister={handleRegister}
                />
            </Suspense>
        );
    }
    

    if (!user) {
         return <SplashScreen />; // Should not happen if logic is correct, but as a fallback
    }
    
    if (appState === 'selectProject') {
        return (
            <Suspense fallback={<SplashScreen />}>
                <ProjectSelectionScreen 
                    user={user} 
                    onSelectProject={handleSelectProject} 
                    onCreateProject={handleCreateProject}
                    onLogout={handleLogout}
                    onUpdateProfile={handleUpdateProfile}
                    onSwitchUser={() => { setUser(null); setAppState('login'); }}
                />
            </Suspense>
        );
    }

    if (appState === 'main' && selectedProject) {
        const currentScreenItem = [...navigationItems, ...secondaryNavigationItems].find(item => item.screen === activeScreen);
        return (
            <div className="flex h-screen bg-light">
                <Suspense fallback={null}>
                    <Sidebar 
                        activeScreen={activeScreen} 
                        setActiveScreen={(s) => handleNavigate(s)} 
                        isSidebarOpen={isSidebarOpen} 
                        setSidebarOpen={setSidebarOpen} 
                        onInstall={handleInstall}
                        isInstallable={isInstallable}
                    />
                </Suspense>
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Suspense fallback={null}>
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
                    </Suspense>
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                        <Suspense fallback={<div className="text-center p-8">Caricamento...</div>}>
                            {renderScreen()}
                        </Suspense>
                    </main>
                </div>
            </div>
        );
    }

    // Fallback in case of an unexpected state
    return <SplashScreen />;
};

export default App;
