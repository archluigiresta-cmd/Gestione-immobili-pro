
import React, { useState, useEffect } from 'react';
import { User, Project } from '../types';
import * as dataService from '../services/dataService';
import { Briefcase, PlusCircle, ArrowRight, UserCircle, LogOut, Edit } from 'lucide-react';
import CreateProjectModal from '../components/modals/CreateProjectModal';
import EditProfileModal from '../components/modals/EditProfileModal';

interface ProjectSelectionScreenProps {
  user: User;
  onSelectProject: (project: Project) => void;
  onCreateProject: (projectName: string) => void;
  onLogout: () => void;
  onUpdateProfile: (updatedUser: User) => void;
}

const ProjectCard: React.FC<{ project: Project, onSelect: () => void }> = ({ project, onSelect }) => (
    <button
        onClick={onSelect}
        className="w-full flex items-center p-5 text-left bg-white border rounded-lg hover:bg-secondary hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
    >
        <Briefcase size={36} className="text-primary mr-4" />
        <div className="flex-1">
            <p className="font-bold text-lg text-dark">{project.name}</p>
            <p className="text-sm text-gray-500">{project.members.length} membr{project.members.length === 1 ? 'o' : 'i'}</p>
        </div>
        <ArrowRight size={20} className="text-gray-400" />
    </button>
);


const ProjectSelectionScreen: React.FC<ProjectSelectionScreenProps> = ({ user, onSelectProject, onCreateProject, onLogout, onUpdateProfile }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    setProjects(dataService.getProjectsForUser(user.id));
  }, [user.id]);
  
  const handleCreate = (projectName: string) => {
    onCreateProject(projectName);
    setCreateModalOpen(false);
  }
  
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
            <ProjectCard key={project.id} project={project} onSelect={() => onSelectProject(project)} />
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
    </>
  );
};

export default ProjectSelectionScreen;
