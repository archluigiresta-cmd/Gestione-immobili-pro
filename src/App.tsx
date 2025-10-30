// Force update to unblock version control state.
import React, { useState, useEffect, useCallback } from 'react';
import { User, Project, Screen, ProjectMemberRole, UserStatus, navigationItems, secondaryNavigationItems } from './types';
import * as dataService from './services/dataService';
import * as googleDriveService from './services/googleDriveService';

// Import Screens
import LoginScreen from './screens/LoginScreen';
import SplashScreen from './screens/SplashScreen';
import ProjectSelectionScreen from './screens/ProjectSelectionScreen';
import UserSelectionScreen from './screens/UserSelectionScreen';

// Main App Layout
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Screen Components
import DashboardScreen from './screens/DashboardScreen';
import PropertiesScreen from './screens/PropertiesScreen';
import PropertyDetailScreen from './screens/PropertyDetailScreen';
import TenantsScreen from './screens/TenantsScreen';
import ContractsScreen from './screens/ContractsScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import DeadlinesScreen from './screens/DeadlinesScreen';
import MaintenanceScreen from './screens/MaintenanceScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import ReportsScreen from './screens/ReportsScreen';
import FinancialAnalysisScreen from './screens/FinancialAnalysisScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpScreen from './screens/HelpScreen';
import RegisterModal from './components/modals/RegisterModal';

type AppState = 'loading' | 'login' | 'userSelection' | 'projectSelection' | 'app';

function App() {
    const [appState, setAppState] = useState<AppState>('loading');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
    const [propertyDetailId, setPropertyDetailId] = useState<string | null>(null);

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isApiReady, setIsApiReady] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    
    // PWA Install state
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e);
            setIsInstallable(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then(() => {
            setInstallPrompt(null);
            setIsInstallable(false);
        });
    };

    const loadDataFromDrive = useCallback(async () => {
        try {
            const { fileId, data } = await googleDriveService.findOrCreateDataFile();
            dataService.setDriveFileId(fileId);
            dataService.loadDataFromObject(data);
            dataService.migrateData();
        } catch (error) {
            console.error("Failed to load data from Drive, using local mock data:", error);
            // This will initialize from mock if local storage is empty
            dataService.getUsers(); 
            dataService.migrateData();
        }
    }, []);

    useEffect(() => {
        googleDriveService.init((ready, error) => {
            setIsApiReady(ready);
            setApiError(error || null);
            if (ready) {
                setAppState('login');
            } else {
                 setAppState('login'); // Go to login screen even on error to show the message
            }
        });
    }, []);

    const handleGoogleLogin = async () => {
        try {
            const user = await googleDriveService.signIn();
            await loadDataFromDrive();
            setCurrentUser(user);
            setAppState('projectSelection');
        } catch (error) {
            console.error("Google Sign-In failed:", error);
            alert("Login con Google fallito. Riprova.");
        }
    };
    
    const hasLocalUsers = dataService.getUsers().some(u => u.password);

    const handleCollaboratorLogin = () => setAppState('userSelection');
    
    const handleRegister = (userData: Omit<User, 'id' | 'status'>) => {
        dataService.addUser(userData);
        alert("Richiesta di registrazione inviata. Un amministratore dovrà approvarla per consentirti l'accesso.");
        setRegisterModalOpen(false);
    };

    const handleUserSelection = (user: User) => {
        setCurrentUser(user);
        setAppState('projectSelection');
    };

    const handleSelectProject = (project: Project) => {
        setCurrentProject(project);
        setActiveScreen('dashboard');
        setAppState('app');
    };
    
    const handleCreateProject = (projectName: string) => {
        if (!currentUser) return;
        const newProject = dataService.addProject({
            name: projectName,
            ownerId: currentUser.id,
            members: [{ userId: currentUser.id, role: ProjectMemberRole.OWNER }]
        });
        handleSelectProject(newProject);
    };

    const handleLogout = () => {
        if (currentUser?.id && currentUser.id.length > 21) { 
            googleDriveService.signOut();
        }
        setCurrentUser(null);
        setCurrentProject(null);
        setAppState('login');
    };
    
    const handleUpdateProfile = (updatedUser: User) => {
        dataService.updateUser(updatedUser);
        setCurrentUser(updatedUser); // Update state
    }
    
    const handleNavigate = (screen: Screen, id?: string) => {
        if (screen === 'propertyDetail' && id) {
            setPropertyDetailId(id);
            setActiveScreen('propertyDetail');
        } else if (screen !== 'propertyDetail') {
            setPropertyDetailId(null);
            setActiveScreen(screen);
        }
        setSidebarOpen(false);
    }
    
    const allUsers = dataService.getUsers();
    const pendingUsers = allUsers.filter(u => u.status === UserStatus.PENDING);
    const userRole = currentProject?.members.find(m => m.userId === currentUser?.id)?.role || ProjectMemberRole.VIEWER;

    const renderScreen = () => {
        if (!currentUser || !currentProject) return null;

        switch (activeScreen) {
            case 'dashboard': return <DashboardScreen onNavigate={handleNavigate} projectId={currentProject.id} />;
            case 'properties': return <PropertiesScreen onNavigate={handleNavigate} projectId={currentProject.id} user={currentUser} userRole={userRole} />;
            case 'propertyDetail': return propertyDetailId ? <PropertyDetailScreen propertyId={propertyDetailId} projectId={currentProject.id} user={currentUser} userRole={userRole} onBack={() => setActiveScreen('properties')} onNavigate={(s) => setActiveScreen(s as Screen)}/> : null;
            case 'tenants': return <TenantsScreen projectId={currentProject.id} user={currentUser} />;
            case 'contracts': return <ContractsScreen projectId={currentProject.id} user={currentUser} userRole={userRole} />;
            case 'payments': return <PaymentsScreen projectId={currentProject.id} user={currentUser} userRole={userRole} />;
            case 'deadlines': return <DeadlinesScreen projectId={currentProject.id} user={currentUser} />;
            case 'maintenance': return <MaintenanceScreen projectId={currentProject.id} user={currentUser} />;
            case 'expenses': return <ExpensesScreen projectId={currentProject.id} user={currentUser} />;
            case 'documents': return <DocumentsScreen projectId={currentProject.id} user={currentUser} />;
            case 'reports': return <ReportsScreen projectId={currentProject.id} />;
            case 'financialAnalysis': return <FinancialAnalysisScreen projectId={currentProject.id} />;
            case 'settings': return <SettingsScreen 
                user={currentUser} 
                project={currentProject} 
                onUpdateProfile={handleUpdateProfile} 
                onUpdateProject={(p) => {
                    dataService.updateProject(p);
                    setCurrentProject(p);
                }}
                onAddUser={(u) => dataService.addUser(u)}
                onDeleteUser={(id) => dataService.deleteUser(id)}
                onApproveUser={(id) => dataService.approveUser(id)}
                userRole={userRole}
            />;
            case 'help': return <HelpScreen />;
            default: return <DashboardScreen onNavigate={handleNavigate} projectId={currentProject.id} />;
        }
    };

    if (appState === 'loading') {
        return <SplashScreen />;
    }
    
    if (appState === 'login') {
        return (
            <>
                <LoginScreen onGoogleLogin={handleGoogleLogin} onCollaboratorLogin={handleCollaboratorLogin} onRegister={() => setRegisterModalOpen(true)} isApiReady={isApiReady} hasLocalUsers={hasLocalUsers} apiError={apiError} />
                <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)} onRegister={handleRegister} />
            </>
        );
    }

    if (appState === 'userSelection') {
        return <UserSelectionScreen onSelectUser={handleUserSelection} onBack={() => setAppState('login')} />;
    }

    if (appState === 'projectSelection' && currentUser) {
        return <ProjectSelectionScreen 
            user={currentUser} 
            onSelectProject={handleSelectProject} 
            onCreateProject={handleCreateProject} 
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            onSwitchUser={() => {
                setCurrentUser(null);
                setAppState('login');
            }}
        />;
    }
    
    if (appState === 'app' && currentUser && currentProject) {
        const screenName = activeScreen === 'propertyDetail' ? `Dettaglio Immobile` : (navigationItems.find(i => i.screen === activeScreen) || secondaryNavigationItems.find(i => i.screen === activeScreen))?.name || 'Dashboard';
        
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
                        currentProjectName={currentProject.name}
                        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
                        user={currentUser}
                        onLogout={handleLogout}
                        onNavigate={(s) => handleNavigate(s)}
                        onBackToProjects={() => {
                            setCurrentProject(null);
                            setAppState('projectSelection');
                        }}
                        pendingUsersCount={pendingUsers.length}
                    />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                        {renderScreen()}
                    </main>
                </div>
            </div>
        );
    }
    
    return <SplashScreen />; // Fallback
}

export default App;