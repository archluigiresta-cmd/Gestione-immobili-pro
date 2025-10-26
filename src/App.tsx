import React, { useState, useEffect, lazy, Suspense } from 'react';

// LAZY LOAD ALL SCREENS using ALIAS paths
const DashboardScreen = lazy(() => import('@/screens/DashboardScreen'));
const PropertiesScreen = lazy(() => import('@/screens/PropertiesScreen'));
const PropertyDetailScreen = lazy(() => import('@/screens/PropertyDetailScreen'));
const ContractsScreen = lazy(() => import('@/screens/ContractsScreen'));
const TenantsScreen = lazy(() => import('@/screens/TenantsScreen'));
const PaymentsScreen = lazy(() => import('@/screens/PaymentsScreen'));
const DeadlinesScreen = lazy(() => import('@/screens/DeadlinesScreen'));
const MaintenanceScreen = lazy(() => import('@/screens/MaintenanceScreen'));
const ExpensesScreen = lazy(() => import('@/screens/ExpensesScreen'));
const DocumentsScreen = lazy(() => import('@/screens/DocumentsScreen'));
const ReportsScreen = lazy(() => import('@/screens/ReportsScreen'));
const FinancialAnalysisScreen = lazy(() => import('@/screens/FinancialAnalysisScreen'));
const SettingsScreen = lazy(() => import('@/screens/SettingsScreen'));
const HelpScreen = lazy(() => import('@/screens/HelpScreen'));
const SplashScreen = lazy(() => import('@/screens/SplashScreen'));
const LoginScreen = lazy(() => import('@/screens/LoginScreen'));
const ProjectSelectionScreen = lazy(() => import('@/screens/ProjectSelectionScreen'));
const UserSelectionScreen = lazy(() => import('@/screens/UserSelectionScreen'));

// Import services and types (using ALIAS paths)
import * as dataService from '@/services/dataService';
import * as googleDriveService from '@/services/googleDriveService';
import { User, Project, ProjectMemberRole, UserStatus, navigationItems, secondaryNavigationItems, Screen } from '@/types';

// Lazy load modals and major layout components (using ALIAS paths)
const RegisterModal = lazy(() => import('@/components/modals/RegisterModal'));
const PasswordModal = lazy(() => import('@/components/modals/PasswordModal'));
const Sidebar = lazy(() => import('@/components/layout/Sidebar'));
const Header = lazy(() => import('@/components/layout/Header'));

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
        googleDriveService.init((ready) => {
            setIsApiReady(ready);
            setAppState('login');
        });

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
                 dataService.approveUser(newUser.id); // Auto-approve Google users
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
        
        const screenProps = { projectId: selectedProject.id, user, userRole };

        switch (activeScreen) {
            case 'dashboard': return <DashboardScreen onNavigate={handleNavigate} projectId={selectedProject.id} />;
            case 'properties': return <PropertiesScreen onNavigate={handleNavigate} {...screenProps} />;
            case 'propertyDetail': return propertyId ? <PropertyDetailScreen propertyId={propertyId} {...screenProps} onBack={() => setActiveScreen('properties')} onNavigate={(screen) => handleNavigate(screen as Screen)} /> : null;
            case 'contracts': return <ContractsScreen {...screenProps} />;
            case 'tenants': return <TenantsScreen projectId={selectedProject.id} user={user} />;
            case 'payments': return <PaymentsScreen {...screenProps} />;
            case 'deadlines': return <DeadlinesScreen projectId={selectedProject.id} user={user} />;
            case 'maintenance': return <MaintenanceScreen projectId={selectedProject.id} user={user} />;
            case 'expenses': return <ExpensesScreen projectId={selectedProject.id} user={user} />;
            case 'documents': return <DocumentsScreen projectId={selectedProject.id} user={user} />;
            case 'reports': return <ReportsScreen projectId={selectedProject.id} />;
            case 'financialAnalysis': return <FinancialAnalysisScreen projectId={selectedProject.id} />;
            case 'settings': return <SettingsScreen 
                project={selectedProject}
                onUpdateProject={(p) => { dataService.updateProject(p); setSelectedProject(p); }}
                onAddUser={(u) => dataService.addUser(u)}
                onDeleteUser={(id) => dataService.deleteUser(id)}
                onApproveUser={(id) => dataService.approveUser(id)}
                onUpdateProfile={handleUpdateProfile} 
                {...screenProps}
            />;
            case 'help': return <HelpScreen />;
            default: return <DashboardScreen onNavigate={handleNavigate} projectId={selectedProject.id} />;
        }
    };
    
    const loadingFallback = <SplashScreen />;

    const renderContent = () => {
        if (appState === 'loading' || !isApiReady) {
            return <SplashScreen />;
        }

        if (appState === 'login') {
            const localUsers = dataService.getUsers().filter(u => u.status === UserStatus.ACTIVE && u.password);
            return <LoginScreen 
                onGoogleLogin={handleGoogleLogin}
                onCollaboratorLogin={() => setAppState('selectUser')}
                onRegister={() => setRegisterModalOpen(true)}
                isApiReady={isApiReady}
                hasLocalUsers={localUsers.length > 0}
            />;
        }

        if (appState === 'selectUser') {
            const localUsers = dataService.getUsers().filter(u => u.status === UserStatus.ACTIVE && u.password);
            return <UserSelectionScreen
                users={localUsers}
                onSelectUser={handleSelectUser}
                onBackToLogin={() => setAppState('login')}
                onRegister={() => setRegisterModalOpen(true)}
            />;
        }
        
        if (user && appState === 'selectProject') {
            return <ProjectSelectionScreen 
                user={user} 
                onSelectProject={handleSelectProject} 
                onCreateProject={handleCreateProject} 
                onLogout={handleLogout}
                onUpdateProfile={handleUpdateProfile}
                onSwitchUser={() => { setUser(null); setAppState('login'); }}
            />;
        }

        if (user && selectedProject && appState === 'main') {
            const screenName = [...navigationItems, ...secondaryNavigationItems].find(item => item.screen === activeScreen)?.name || 'Dashboard';
            const pendingUsersCount = dataService.getUsers().filter(u => u.status === UserStatus.PENDING).length;

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
                            currentScreen={screenName}
                            currentProjectName={selectedProject.name}
                            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                            user={user}
                            onLogout={handleLogout}
                            onNavigate={(s) => handleNavigate(s)}
                            onBackToProjects={() => setAppState('selectProject')}
                            pendingUsersCount={pendingUsersCount}
                        />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light p-6">
                            <Suspense fallback={<div className="text-center p-8">Caricamento...</div>}>
                                {renderScreen()}
                            </Suspense>
                        </main>
                    </div>
                </div>
            );
        }

        return <SplashScreen />; // Fallback for any unexpected state
    };

    return (
        <Suspense fallback={loadingFallback}>
            {renderContent()}
            <RegisterModal 
                isOpen={isRegisterModalOpen} 
                onClose={() => setRegisterModalOpen(false)} 
                onRegister={handleRegister} 
            />
            {userForPassword && (
                <PasswordModal 
                    isOpen={!!userForPassword} 
                    onClose={() => setUserForPassword(null)} 
                    onConfirm={handlePasswordConfirm} 
                />
            )}
        </Suspense>
    );
};

export default App;