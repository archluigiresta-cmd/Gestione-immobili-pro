import React, { useState, useEffect, useRef } from 'react';
import { User, Project } from '../types';
import * as dataService from '../services/dataService';
import { Briefcase, PlusCircle, ArrowRight, UserCircle, LogOut, Edit, MoreVertical, Trash2 } from 'lucide-react';
import CreateProjectModal from '../components/modals/CreateProjectModal';
import EditProfileModal from '../components/modals/EditProfileModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

interface ProjectSelectionScreenProps {
  user: User;
  onSelectProject: (project: Project) => void;
  onCreateProject: (projectName: string) => void;
  onLogout: () => void;
  onUpdateProfile: (updatedUser: User) => void;
}

const ProjectCard: React.FC<{ 
    project: Project;
    user: User; 
    onSelect: () => void;
    onDelete: () => void;
}> = ({ project, user, onSelect, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const isOwner = user.id === project.ownerId;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="w-full flex items-center p-5 text-left bg-white border rounded-lg hover:bg-secondary hover:shadow-md transition-all duration-200 relative">
            <button onClick={onSelect} className="flex-1 flex items-center">
                <Briefcase size={36} className="text-primary mr-4" />
                <div className="flex-1">
                    <p className="font-bold text-lg text-dark">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.members.length} membr{project.members.length === 1 ? 'o' : 'i'}</p>
                </div>
                <ArrowRight size={20} className="text-gray-400" />
            </button>
            
            {isOwner && (
                <div ref={menuRef} className="absolute top-2 right-2 z-10">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <MoreVertical size={20} className="text-dark" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 border">
                            <button 
                                onClick={() => { 
                                    onDelete(); 
                                    setMenuOpen(false); 
                                }} 
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <Trash2 size={16} className="mr-2" /> Elimina
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ProjectSelectionScreen: React.FC<ProjectSelectionScreenProps> = ({ user, onSelectProject, onCreateProject, onLogout, onUpdateProfile }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const loadProjects = () => {
    setProjects(dataService.getProjectsForUser(user.id));
  };
  
  useEffect(() => {
    loadProjects();
  }, [user.id]);
  
  const handleCreate = (projectName: string) => {
    onCreateProject(projectName);
    // After creating, the main app logic handles selecting it. We just need to refresh our list.
    loadProjects(); 
    setCreateModalOpen(false);
  }
  
  const handleDeleteProject = () => {
    if (deletingProject) {
        dataService.deleteProject(deletingProject.id);
        loadProjects(); // Refresh the list after deletion
        setDeletingProject(null);
    }
  };

  const handleSaveProfile = (updatedUser: User) => {
    onUpdateProfile(updatedUser);
    setProfileModalOpen(false);
  };

  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-light">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-2xl shadow-2xl m-4">
        <div className="flex justify-between items-start">
            <div className="flex items-center">
                 <UserCircle size={40} className="text-primary mr-4" />
                 <div>
                    <p className="text-gray-600">Benvenuto,</p>
                    <h1 className="text-2xl font-bold text-dark">{user.name}</h1>
                    <button onClick={() => setProfileModalOpen(true)} className="flex items-center text-xs text-primary hover:underline font-semibold mt-1">
                        <Edit size={12} className="mr-1"/> Modifica Profilo
                    </button>
                </div>
            </div>
            <button onClick={onLogout} className="flex items-center text-sm text-red-600 font-semibold p-2 rounded-lg hover:bg-red-50">
                <LogOut size={16} className="mr-1.5"/> Esci
            </button>
        </div>
        
        <div className="text-center border-t pt-6">
            <h2 className="text-xl font-bold text-primary">Seleziona un Progetto</h2>
            <p className="mt-1 text-gray-500">Scegli un progetto esistente o creane uno nuovo per iniziare.</p>
        </div>
        
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          {projects.map(project => (
            <ProjectCard 
                key={project.id} 
                project={project}
                user={user}
                onSelect={() => onSelectProject(project)}
                onDelete={() => setDeletingProject(project)}
            />
          ))}
           {projects.length === 0 && (
                <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-lg">
                    <p>Non fai ancora parte di nessun progetto.</p>
                    <p>Creane uno per iniziare!</p>
                </div>
           )}
        </div>
        
        <div className="pt-4">
            <button
                onClick={() => setCreateModalOpen(true)}
                className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-lg"
            >
                <PlusCircle size={20} className="mr-2" />
                Crea Nuovo Progetto
            </button>
        </div>

      </div>
    </div>
    <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreate}
    />
    <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onSave={handleSaveProfile}
    />
    {deletingProject && (
        <ConfirmDeleteModal
            isOpen={!!deletingProject}
            onClose={() => setDeletingProject(null)}
            onConfirm={handleDeleteProject}
            message={`Sei sicuro di voler eliminare il progetto "${deletingProject.name}"? Tutti i dati associati (immobili, contratti, spese, etc.) verranno rimossi definitivamente. Questa azione è irreversibile.`}
        />
    )}
    </>
  );
};

export default ProjectSelectionScreen;
