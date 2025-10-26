import React, { useState, useRef } from 'react';
import { User, Project, ProjectMemberRole, UserStatus } from '@/types';
import Card from '@/components/ui/Card';
import * as dataService from '@/services/dataService';
import { UserCircle, Edit, Trash2, Shield, PlusCircle, Share2, Users, HardDrive, Upload, Check, X } from 'lucide-react';

import EditProfileModal from '@/components/modals/EditProfileModal';
import AddUserModal from '@/components/modals/AddUserModal';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import ShareProjectModal from '@/components/modals/ShareProjectModal';

interface SettingsScreenProps {
  user: User;
  project: Project;
  onUpdateProfile: (updatedUser: User) => void;
  onUpdateProject: (updatedProject: Project) => void;
  onAddUser: (userData: Omit<User, 'id' | 'status'>) => void;
  onDeleteUser: (userId: string) => void;
  onApproveUser: (userId: string) => void;
  userRole: ProjectMemberRole;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  project,
  onUpdateProfile,
  onUpdateProject,
  onAddUser,
  onDeleteUser,
  onApproveUser,
  userRole
}) => {
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [editingProjectName, setEditingProjectName] = useState(false);
    const [newProjectName, setNewProjectName] = useState(project.name);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Refresh user list from dataService on each render
    const allUsers = dataService.getUsers();
    const pendingUsers = allUsers.filter(u => u.status === UserStatus.PENDING);

    const isOwner = userRole === ProjectMemberRole.OWNER;
    
    const projectMembers = project.members.map(member => {
        const memberUser = allUsers.find(u => u.id === member.userId);
        return {
            ...member,
            name: memberUser?.name || 'Utente Sconosciuto',
            email: memberUser?.email || 'N/A',
        };
    });

    const handleSaveProfile = (updatedUser: User) => {
        onUpdateProfile(updatedUser);
        setEditProfileModalOpen(false);
    };
    
    const handleSaveProjectName = () => {
        if(newProjectName.trim() && newProjectName !== project.name) {
            onUpdateProject({ ...project, name: newProjectName.trim() });
        }
        setEditingProjectName(false);
    }
    
    const handleRoleChange = (userId: string, newRole: ProjectMemberRole) => {
        if (!isOwner) return;
        const updatedMembers = project.members.map(m => m.userId === userId ? { ...m, role: newRole } : m);
        onUpdateProject({ ...project, members: updatedMembers });
    }
    
    const handleRemoveMember = (userId: string) => {
        if (!isOwner || userId === project.ownerId) return; // Can't remove owner
        const updatedMembers = project.members.filter(m => m.userId !== userId);
        onUpdateProject({ ...project, members: updatedMembers });
    }
    
    const handleShareProject = (userId: string, role: ProjectMemberRole) => {
        const newMember = { userId, role };
        const updatedMembers = [...project.members, newMember];
        onUpdateProject({ ...project, members: updatedMembers });
        setShareModalOpen(false);
    }
    
    const handleAddUserAndRefresh = (userData: Omit<User, 'id' | 'status'>) => {
      onAddUser(userData);
    }

    const handleExportData = () => {
        const dataToBackup: { [key: string]: any } = {};
        const keysToBackup = ['users', 'projects', 'properties', 'tenants', 'contracts', 'deadlines', 'maintenances', 'expenses', 'documents', 'payments'];
        
        keysToBackup.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                dataToBackup[key] = JSON.parse(data);
            }
        });

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(dataToBackup, null, 2)
        )}`;
        
        const link = document.createElement("a");
        const date = new Date().toISOString().split('T')[0];
        link.href = jsonString;
        link.download = `gest-immo-backup-${date}.json`;
        link.click();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        if (!event.target.files || event.target.files.length === 0) return;

        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            if (!e.target?.result || typeof e.target.result !== 'string') return;
            
            const confirmation = window.confirm(
                "ATTENZIONE: L'importazione di un backup sovrascriverà tutti i dati attuali. Questa azione è irreversibile. Continuare?"
            );

            if (confirmation) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    Object.keys(importedData).forEach(key => {
                        localStorage.setItem(key, JSON.stringify(importedData[key]));
                    });
                    alert("Importazione completata con successo! L'applicazione verrà ricaricata.");
                    window.location.reload();
                } catch (error) {
                    alert("Errore: Il file selezionato non è un backup valido.");
                    console.error("Import failed:", error);
                }
            }
        };
        // Reset the file input
        event.target.value = '';
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-dark">Impostazioni</h1>
            
            {user.id === 'user-1' && (
                <Card className="p-6 border-l-4 border-yellow-400 bg-yellow-50">
                    <h2 className="text-xl font-bold text-yellow-800 mb-4">Pannello Amministratore</h2>
                    
                    <div className="bg-white rounded-lg p-4">
                         <h3 className="text-lg font-semibold text-dark mb-3">Richieste di Registrazione in Sospeso</h3>
                         {pendingUsers.length > 0 ? (
                            <div className="space-y-3">
                                {pendingUsers.map(u => (
                                    <div key={u.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                        <div>
                                            <p className="font-semibold">{u.name}</p>
                                            <p className="text-sm text-gray-600">{u.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => onApproveUser(u.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 font-semibold rounded-lg hover:bg-green-200">
                                                <Check size={16}/> Approva
                                            </button>
                                            <button onClick={() => setDeletingUser(u)} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200">
                                                <X size={16}/> Rifiuta
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         ) : (
                            <p className="text-center text-gray-500 py-4">Nessuna richiesta di registrazione in sospeso.</p>
                         )}
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-dark">Il Mio Profilo</h2>
                        <button onClick={() => setEditProfileModalOpen(true)} className="flex items-center text-sm px-3 py-1.5 bg-secondary text-primary font-semibold rounded-lg hover:bg-blue-200 transition-colors">
                            <Edit size={16} className="mr-2"/> Modifica
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserCircle size={48} className="text-primary"/>
                        <div>
                            <p className="font-bold text-lg">{user.name}</p>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold text-dark mb-4">Progetto Corrente</h2>
                    {editingProjectName ? (
                         <div className="flex items-center gap-2">
                             <input type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} className="input flex-grow"/>
                             <button onClick={handleSaveProjectName} className="px-3 py-2 bg-primary text-white rounded-lg">Salva</button>
                         </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-lg">{project.name}</p>
                            {isOwner && (
                                <button onClick={() => setEditingProjectName(true)} className="flex items-center text-sm px-3 py-1.5 bg-secondary text-primary font-semibold rounded-lg hover:bg-blue-200 transition-colors">
                                    <Edit size={16} className="mr-2"/> Rinomina
                                </button>
                            )}
                        </div>
                    )}
                </Card>
            </div>

            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-dark flex items-center"><HardDrive size={20} className="mr-2 text-primary"/> Gestione Dati Applicazione</h2>
                </div>
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                    <p className="font-bold">Backup e Ripristino</p>
                    <p className="text-sm">Esporta tutti i dati della tua applicazione in un unico file per sicurezza. Puoi importare questo file in seguito per ripristinare i dati.</p>
                </div>
                <div className="flex items-center gap-4 mt-4">
                     <button onClick={handleExportData} className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        <Upload size={16} className="mr-2"/> Esporta Dati (Backup)
                    </button>
                    <button onClick={handleImportClick} className="flex items-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors shadow-sm">
                        <HardDrive size={16} className="mr-2"/> Importa Dati (Ripristino)
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept=".json"/>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-dark flex items-center"><Users size={20} className="mr-2 text-primary" /> Membri del Progetto</h2>
                    {isOwner && (
                        <button onClick={() => setShareModalOpen(true)} className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">
                            <Share2 size={16} className="mr-2"/> Condividi / Invita
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-gray-600">Nome</th>
                                <th className="p-3 text-sm font-semibold text-gray-600">Email</th>
                                <th className="p-3 text-sm font-semibold text-gray-600">Ruolo</th>
                                {isOwner && <th className="p-3 text-sm font-semibold text-gray-600 text-center">Azioni</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {projectMembers.map(member => (
                                <tr key={member.userId} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium text-dark">{member.name}</td>
                                    <td className="p-3 text-gray-700">{member.email}</td>
                                    <td className="p-3">
                                        {isOwner && member.userId !== project.ownerId ? (
                                            <select value={member.role} onChange={e => handleRoleChange(member.userId, e.target.value as ProjectMemberRole)} className="input">
                                                <option value={ProjectMemberRole.EDITOR}>Editor</option>
                                                <option value={ProjectMemberRole.VIEWER}>Visualizzatore</option>
                                            </select>
                                        ) : (
                                            <span className="flex items-center gap-2 font-semibold">
                                                {member.role}
                                                {member.role === ProjectMemberRole.OWNER && <Shield size={16} className="text-yellow-600" />}
                                            </span>
                                        )}
                                    </td>
                                    {isOwner && (
                                        <td className="p-3 text-center">
                                            {member.userId !== project.ownerId && (
                                                <button onClick={() => handleRemoveMember(member.userId)} className="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-50">
                                                    <Trash2 size={18}/>
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            
            {user.id === 'user-1' && (
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-dark">Gestione Utenti (Globale)</h2>
                        <button onClick={() => setAddUserModalOpen(true)} className="flex items-center px-4 py-2 bg-secondary text-primary font-semibold rounded-lg hover:bg-blue-200 transition-colors">
                            <PlusCircle size={18} className="mr-2" /> Aggiungi Utente
                        </button>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-sm font-semibold text-gray-600">Nome</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">Email</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">Stato</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600 text-center">Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.map(u => (
                                    <tr key={u.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-dark">{u.name}</td>
                                        <td className="p-3 text-gray-700">{u.email}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button 
                                                onClick={() => setDeletingUser(u)} 
                                                className="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                                                disabled={u.id === user.id && allUsers.filter(us => us.status === UserStatus.ACTIVE).length <=1}
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} user={user} onSave={handleSaveProfile} />
            <AddUserModal isOpen={isAddUserModalOpen} onClose={() => setAddUserModalOpen(false)} onSave={handleAddUserAndRefresh} />
            <ShareProjectModal isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} onShare={handleShareProject} project={project} />
            {deletingUser && (
                <ConfirmDeleteModal 
                    isOpen={!!deletingUser} 
                    onClose={() => setDeletingUser(null)} 
                    onConfirm={() => {
                        onDeleteUser(deletingUser.id);
                        setDeletingUser(null);
                    }}
                    message={`Sei sicuro di voler eliminare l'utente "${deletingUser.name}"? L'azione è irreversibile.`}
                />
            )}
        </div>
    );
};

export default SettingsScreen;