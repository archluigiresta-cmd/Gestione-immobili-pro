import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectName: string) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSave }) => {
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError('Il nome del progetto non può essere vuoto.');
      return;
    }
    onSave(projectName);
  };
  
  const handleClose = () => {
    setProjectName('');
    setError('');
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Crea Nuovo Progetto</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-gray-700">Nome del Progetto</label>
            <input 
              id="project-name"
              type="text" 
              value={projectName} 
              onChange={e => setProjectName(e.target.value)} 
              placeholder="Es. Ristrutturazione Villa Rossi"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
            />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={handleClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Crea Progetto</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
