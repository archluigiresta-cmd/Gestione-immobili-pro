import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Document, User, DocumentType, Property } from '../types';
import { PlusCircle, Edit, Trash2, Download, FileText } from 'lucide-react';
import AddDocumentModal from '../components/modals/AddDocumentModal';
import EditDocumentModal from '../components/modals/EditDocumentModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import InteractiveTable, { Column } from '../components/ui/InteractiveTable';

interface DocumentsScreenProps {
  projectId: string;
  user: User;
}

const DocumentsScreen: React.FC<DocumentsScreenProps> = ({ projectId, user }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  const loadDocuments = () => {
    setDocuments(dataService.getDocuments(projectId));
    setProperties(dataService.getProperties(projectId));
  };

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
  
  const propertyMap = useMemo(() => new Map(properties.map(p => [p.id, p.name])), [properties]);

  const columns: Column<Document>[] = [
      { header: 'Nome Documento', accessor: 'name', render: row => (
          <div className="flex items-center">
              <FileText size={18} className="mr-2 text-primary" />
              <span className="font-medium text-dark">{row.name}</span>
          </div>
      )},
      { header: 'Immobile', accessor: 'propertyId', render: row => propertyMap.get(row.propertyId) || 'N/A' },
      { header: 'Tipo', accessor: 'type', render: row => (row.type === DocumentType.OTHER && row.typeOther) ? row.typeOther : row.type },
      { header: 'Data Caricamento', accessor: 'uploadDate', render: row => new Date(row.uploadDate).toLocaleDateString('it-IT') },
      { header: 'Azioni', accessor: 'id', render: row => (
          <div className="flex justify-center items-center gap-4">
              <a href={row.fileData || row.fileUrl} download={row.fileName} target={row.fileUrl ? "_blank" : "_self"} rel="noopener noreferrer" className="text-gray-500 hover:text-primary" title={row.fileName ? `Scarica ${row.fileName}` : 'Apri link esterno'}>
                  <Download size={18} />
              </a>
              <button onClick={() => setEditingDocument(row)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
              <button onClick={() => setDeletingDocument(row)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
          </div>
      ), className: 'text-center' },
  ];

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
        <InteractiveTable columns={columns} data={documents} />
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