import React, { useState, useEffect } from 'react';
import { User, Project, ProjectMemberRole } from '../../types';
import { X } from 'lucide-react';
import * as dataService from '../../services/dataService';

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (userId: string, role: ProjectMemberRole) => void;
  project: Project;
}

const ShareProjectModal: React.FC<ShareProjectModalProps> = ({ isOpen, onClose, onShare, project }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState<ProjectMemberRole>(ProjectMemberRole.VIEWER);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const allUsers = dataService.getUsers();
      const projectMemberIds = new Set(project.members.map(m => m.userId));
      const usersToShareWith = allUsers.filter(u => !projectMemberIds.has(u.id));
      setAvailableUsers(usersToShareWith);
    }
  }, [isOpen, project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Devi selezionare un utente da invitare.');
      return;
    }
    onShare(selectedUser, selectedRole);
  };
  
  const handleClose = () => {
    setSelectedUser('');
    setSelectedRole(ProjectMemberRole.VIEWER);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Condividi Progetto</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">Utente da Invitare</label>
            <select
              id="user-select"
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="">Seleziona un utente...</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
              ))}
            </select>
            {availableUsers.length === 0 && <p className="text-xs text-gray-500 mt-1">Tutti gli utenti sono già nel progetto.</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Assegna Ruolo</label>
            <div className="mt-2 space-y-2">
                <label className="flex items-center">
                    <input type="radio" name="role" value={ProjectMemberRole.EDITOR} checked={selectedRole === ProjectMemberRole.EDITOR} onChange={() => setSelectedRole(ProjectMemberRole.EDITOR)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300"/>
                    <span className="ml-2 text-sm text-gray-700">
                        <span className="font-semibold">Editor</span> - Può visualizzare e modificare i dati.
                    </span>
                </label>
                <label className="flex items-center">
                    <input type="radio" name="role" value={ProjectMemberRole.VIEWER} checked={selectedRole === ProjectMemberRole.VIEWER} onChange={() => setSelectedRole(ProjectMemberRole.VIEWER)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300"/>
                    <span className="ml-2 text-sm text-gray-700">
                        <span className="font-semibold">Visualizzatore</span> - Può solo visualizzare i dati.
                    </span>
                </label>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annulla</button>
            <button type="submit" disabled={availableUsers.length === 0} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                Condividi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareProjectModal;