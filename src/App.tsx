// Pulizia Definitiva 3
import React, { useState, useEffect } from 'react';
import { User, Project, Screen, ProjectMemberRole, UserStatus, navigationItems, secondaryNavigationItems } from './types';
import * as dataService from './services/dataService';

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
import ApproveUsersModal from './components/modals/ApproveUsersModal';

type AppState = 'loading' | 'login' | 'userSelection' | 'projectSelection' | 'app';

function App() {
    const [appState, setAppState] = useState<AppState>('loading');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
    const [propertyDetailId, setPropertyDetailId] = useState<string | null>(null);

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const [isApprovalModalOpen, setApprovalModalOpen] = useState(false);
    
    // State to force re-read of data from localStorage
    const [dataTimestamp, setDataTimestamp] = useState(Date.now());
    
    // PWA Install state
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    
    // Get user data - this will be reactive to changes via re-renders
    const allUsers = dataService.getUsers();
    const pendingUsers = allUsers.filter(u => u.status === UserStatus.PENDING);
    const hasLocalUsers = allUsers.some(u => u.password);

    // App Initialization
    useEffect(() => {
        const beforeInstallPromptHandler = (e: Event) => {
            e.preventDefault();
            setIsInstallable(true);
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);

        dataService.migrateData();
        
        // Setup admin password if not set
        const users = dataService.getUsers();
        const admin = users.find(u => u.id === 'user-1');
        if (admin && !admin.password) {
            dataService.updateUser({ ...admin, password: 'admin123' });
        }
        
        const timer = setTimeout(() => {
            setAppState('login');
        }, 1500); // Splash screen duration

        return () => {
            window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
            clearTimeout(timer);
        };
    }, []);

    // Approval modal on admin login
    useEffect(() => {
        if (currentUser && currentUser.id === 'user-1' && pendingUsers.length > 0 && appState === 'app') {
            const timer = setTimeout(() => setApprovalModalOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [currentUser, appState, dataTimestamp]); // depends on dataTimestamp to re-evaluate when users change


    const handleInstallClick = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            setIsInstallable(false);
        });
    };

    // --- Authentication and State Transitions ---
    
    const handleCollaboratorLogin = () => setAppState('userSelection');
    
    const handleUserSelect = (user: User) => {
        setCurrentUser(user);
        setAppState('projectSelection');
    };
    
    const handleBackToLogin = () => setAppState('login');
    
    const handleRegister = (userData: Omit<User, 'id' | 'status'>) => {
        dataService.addUser(userData);
        setRegisterModalOpen(false);
        alert('Richiesta di registrazione inviata. Un amministratore approverà il tuo account.');
        setDataTimestamp(Date.now());
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentProject(null);
        setAppState('login');
        setActiveScreen('dashboard');
        setPropertyDetailId(null);
    };

    // --- Project Management ---

    const handleSelectProject = (project: Project) => {
        setCurrentProject(project);
        setAppState('app');
        setActiveScreen('dashboard');
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

    const handleBackToProjects = () => {
        setCurrentProject(null);
        setAppState('projectSelection');
    };

    // --- Navigation ---

    const handleNavigate = (screen: Screen, id?: string) => {
        if (screen === 'propertyDetail' && id) {
            setPropertyDetailId(id);
            setActiveScreen('propertyDetail');
        } else {
            setPropertyDetailId(null);
            setActiveScreen(screen);
        }
        setSidebarOpen(false);
    };
    
    // --- Data Management Callbacks (for Settings) ---

    const handleUpdateProfile = (updatedUser: User) => {
        dataService.updateUser(updatedUser);
        if (currentUser && currentUser.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
        setDataTimestamp(Date.now());
    };

    const handleUpdateProject = (updatedProject: Project) => {
        dataService.updateProject(updatedProject);
        if (currentProject && currentProject.id === updatedProject.id) {
            setCurrentProject(updatedProject);
        }
        setDataTimestamp(Date.now());
    };

    const handleAddUser = (userData: Omit<User, 'id' | 'status'>) => {
        dataService.addUser(userData);
        setDataTimestamp(Date.now());
    };

    const handleDeleteUser = (userId: string) => {
        dataService.deleteUser(userId);
        setDataTimestamp(Date.now());
    };

    const handleApproveUser = (userId: string) => {
        dataService.approveUser(userId);
        setDataTimestamp(Date.now());
    };

    // --- Render Logic ---

    const renderScreen = () => {
        if (!currentProject || !currentUser) return null;

        const userRole = currentProject.members.find(m => m.userId === currentUser.id)?.role || ProjectMemberRole.VIEWER;

        switch (activeScreen) {
            case 'dashboard': return <DashboardScreen onNavigate={handleNavigate} projectId={currentProject.id} />;
            case 'properties': return <PropertiesScreen onNavigate={handleNavigate} projectId={currentProject.id} user={currentUser} userRole={userRole} />;
            case 'propertyDetail': return <PropertyDetailScreen propertyId={propertyDetailId!} projectId={currentProject.id} user={currentUser} userRole={userRole} onBack={() => handleNavigate('properties')} onNavigate={handleNavigate} />;
            case 'tenants': return <TenantsScreen projectId={currentProject.id} user={currentUser} />;
            case 'contracts': return <ContractsScreen projectId={currentProject.id} user={currentUser} userRole={userRole} />;
            case 'payments': return <PaymentsScreen projectId={currentProject.id} user={currentUser} userRole={userRole} />;
            case 'deadlines': return <DeadlinesScreen projectId={currentProject.id} user={currentUser} />;
            case 'maintenance': return <MaintenanceScreen projectId={currentProject.id} user={currentUser} />;
            case 'expenses': return <ExpensesScreen projectId={currentProject.id} user={currentUser} />;
            case 'documents': return <DocumentsScreen projectId={currentProject.id} user={currentUser} />;
            case 'reports': return <ReportsScreen projectId={currentProject.id} />;
            case 'financialAnalysis': return <FinancialAnalysisScreen projectId={currentProject.id} />;
            case 'settings': return <SettingsScreen user={currentUser} project={currentProject} onUpdateProfile={handleUpdateProfile} onUpdateProject={handleUpdateProject} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} onApproveUser={handleApproveUser} userRole={userRole} />;
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
                <LoginScreen onCollaboratorLogin={handleCollaboratorLogin} onRegister={() => setRegisterModalOpen(true)} hasLocalUsers={hasLocalUsers} />
                <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)} onRegister={handleRegister} />
            </>
        );
    }
    
    if (appState === 'userSelection') {
        return <UserSelectionScreen onSelectUser={handleUserSelect} onBack={handleBackToLogin} />;
    }
    
    if (appState === 'projectSelection' && currentUser) {
        return <ProjectSelectionScreen user={currentUser} onSelectProject={handleSelectProject} onCreateProject={handleCreateProject} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} onSwitchUser={handleCollaboratorLogin}/>;
    }
    
    if (appState === 'app' && currentUser && currentProject) {
        const activeScreenData = [...navigationItems, ...secondaryNavigationItems].find(item => item.screen === activeScreen);
        const screenName = activeScreen === 'propertyDetail' ? 'Dettaglio Immobile' : activeScreenData?.name || '';
        
        return (
            <div className="flex h-screen bg-light">
                <Sidebar 
                    activeScreen={activeScreen} 
                    setActiveScreen={handleNavigate}
                    isSidebarOpen={isSidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    onInstall={handleInstallClick}
                    isInstallable={isInstallable}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header 
                        currentScreen={screenName} 
                        currentProjectName={currentProject.name}
                        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
                        user={currentUser} 
                        onLogout={handleLogout}
                        onNavigate={handleNavigate}
                        onBackToProjects={handleBackToProjects}
                        pendingUsersCount={pendingUsers.length}
                    />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                        {renderScreen()}
                    </main>
                </div>
                 <ApproveUsersModal 
                    isOpen={isApprovalModalOpen} 
                    onClose={() => setApprovalModalOpen(false)}
                    pendingUsers={pendingUsers}
                    onApprove={handleApproveUser}
                    onReject={handleDeleteUser}
                />
            </div>
        );
    }

    // Fallback if state is inconsistent
    return <SplashScreen />; 
}

export default App;
