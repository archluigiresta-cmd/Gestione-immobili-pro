import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Document, User, DocumentType, Property } from '../types';
import { PlusCircle, Edit, Trash2, Download, FileText, ChevronDown } from 'lucide-react';
import AddDocumentModal from '../components/modals/AddDocumentModal';
import EditDocumentModal from '../components/modals/EditDocumentModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import InteractiveTable, { Column } from '../components/ui/InteractiveTable';

interface DocumentsScreenProps {
  projectId: string;
  user: User;
}

const getPropertyColors = (index: number) => {
    const colors = [
        'border-teal-500', 'border-blue-500', 'border-green-500', 'border-indigo-500',
        'border-purple-500', 'border-pink-500', 'border-yellow-500', 'border-red-500'
    ];
    return colors[index % colors.length];
};

const DocumentsScreen: React.FC<DocumentsScreenProps> = ({ projectId, user }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

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

  const toggleSection = (propertyId: string) => {
    setOpenSections(prev => {
        const newSet = new Set(prev);
        if (newSet.has(propertyId)) {
            newSet.delete(propertyId);
        } else {
            newSet.add(propertyId);
        }
        return newSet;
    });
  };

  const groupedDocuments = useMemo(() => {
    return documents.reduce<Record<string, Document[]>>((acc, doc) => {
        (acc[doc.propertyId] = acc[doc.propertyId] || []).push(doc);
        return acc;
    }, {});
  }, [documents]);

  const columns: Column<Document>[] = [
      { header: 'Nome Documento', accessor: 'name', render: row => (
          <div className="flex items-center">
              <FileText size={18} className="mr-2 text-primary" />
              <span className="font-medium text-dark">{row.name}</span>
          </div>
      )},
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

  const propertyMap = useMemo(() => new Map(properties.map(p => [p.id, p.name])), [properties]);

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
        <div className="space-y-4">
            {Object.entries(groupedDocuments).map(([propertyId, docsForProperty], index) => {
              const propertyName = propertyMap.get(propertyId) || 'Immobile non trovato';
              const isOpen = openSections.has(propertyId);
              return (
                  <div key={propertyId} className={`rounded-lg overflow-hidden border-l-4 ${getPropertyColors(index)} bg-white shadow-sm`}>
                      <button onClick={() => toggleSection(propertyId)} className={`w-full flex justify-between items-center p-4 text-left font-bold text-lg ${isOpen ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          <span>{propertyName} <span className="text-sm font-medium text-gray-500">({docsForProperty.length} documenti)</span></span>
                          <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                          <div className="p-2 bg-white">
                              <InteractiveTable columns={columns} data={docsForProperty} />
                          </div>
                      )}
                  </div>
              );
            })}
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