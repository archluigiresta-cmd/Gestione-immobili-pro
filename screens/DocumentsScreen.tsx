import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Document, User, DocumentType } from '../types';
import { PlusCircle, Edit, Trash2, Download, FileText } from 'lucide-react';
import AddDocumentModal from '../components/modals/AddDocumentModal';
import EditDocumentModal from '../components/modals/EditDocumentModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

interface DocumentsScreenProps {
  projectId: string;
  user: User;
}

const DocumentsScreen: React.FC<DocumentsScreenProps> = ({ projectId, user }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  const loadDocuments = () => {
    setDocuments(dataService.getDocuments(projectId));
  };

  const getPropertyName = (id: string) => dataService.getProperties(projectId).find(p => p.id === id)?.name || 'N/A';

  const handleAddDocument = (docData: Omit<Document, 'id' | 'history'>) => {
    dataService.addDocument({ ...docData, projectId }, user.id);
    loadDocuments();
    setAddModalOpen(false);
  };

  const handleUpdateDocument = (updatedDoc: Document) => {
    dataService.updateDocument(updatedDoc, user.id);
    loadDocuments();
    setEditingDocument(null);
  };

  const handleDeleteDocument = () => {
    if (deletingDocument) {
      dataService.deleteDocument(deletingDocument.id, user.id);
      loadDocuments();
      setDeletingDocument(null);
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-dark">Archivio Documenti</h1>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
          >
            <PlusCircle size={18} className="mr-2" />
            Carica Documento
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-600">Nome Documento</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Immobile Associato</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Data Caricamento</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => {
                const displayType = (doc.type === DocumentType.OTHER && doc.typeOther) ? doc.typeOther : doc.type;
                return (
                    <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-dark font-medium flex items-center">
                        <FileText size={18} className="mr-2 text-primary" />
                        {doc.name}
                    </td>
                    <td className="p-3 text-gray-700">{getPropertyName(doc.propertyId)}</td>
                    <td className="p-3 text-gray-700">{displayType}</td>
                    <td className="p-3 text-gray-700">{new Date(doc.uploadDate).toLocaleDateString('it-IT')}</td>
                    <td className="p-3 text-center">
                        <div className="flex justify-center items-center gap-4">
                        <a 
                          href={doc.fileData || doc.fileUrl}
                          download={doc.fileName}
                          target={doc.fileUrl ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-primary"
                          title={doc.fileName ? `Scarica ${doc.fileName}` : 'Apri link esterno'}
                        >
                          <Download size={18} />
                        </a>
                        <button onClick={() => setEditingDocument(doc)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                        <button onClick={() => setDeletingDocument(doc)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                        </div>
                    </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddDocument}
        projectId={projectId}
      />
      {editingDocument && (
        <EditDocumentModal
          isOpen={!!editingDocument}
          onClose={() => setEditingDocument(null)}
          onSave={handleUpdateDocument}
          document={editingDocument}
          projectId={projectId}
        />
      )}
      {deletingDocument && (
        <ConfirmDeleteModal
          isOpen={!!deletingDocument}
          onClose={() => setDeletingDocument(null)}
          onConfirm={handleDeleteDocument}
          message={`Sei sicuro di voler eliminare il documento "${deletingDocument.name}"?`}
        />
      )}
    </>
  );
};

export default DocumentsScreen;