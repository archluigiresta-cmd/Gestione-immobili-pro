

import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Document, User, DocumentType, Property } from '../types';
import { PlusCircle, Edit, Trash2, Download, FileText } from 'lucide-react';
import AddDocumentModal from '../components/modals/AddDocumentModal';
import EditDocumentModal from '../components/modals/EditDocumentModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import AccordionItem from '../components/ui/AccordionItem';

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
  
  const groupedDocuments = useMemo(() => {
      return documents.reduce((acc, doc) => {
          const key = doc.propertyId;
          if(!acc[key]) acc[key] = [];
          acc[key].push(doc);
          return acc;
      }, {} as Record<string, Document[]>)
  }, [documents]);

  return (
    <>
      <div className="space-y-6">
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
            {properties.filter(p => groupedDocuments[p.id]).map(property => {
                const propertyDocs = groupedDocuments[property.id];
                 const title = (
                  <div className="flex items-center gap-3">
                      <span>{property.name}</span>
                      <span className="text-sm bg-gray-200 text-gray-700 font-bold px-2.5 py-1 rounded-full">{propertyDocs.length}</span>
                  </div>
                );
                return (
                    <AccordionItem key={property.id} title={title}>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="p-3 text-sm font-semibold text-gray-600">Nome Documento</th>
                                  <th className="p-3 text-sm font-semibold text-gray-600">Tipo</th>
                                  <th className="p-3 text-sm font-semibold text-gray-600">Data Caricamento</th>
                                  <th className="p-3 text-sm font-semibold text-gray-600 text-center">Azioni</th>
                                </tr>
                              </thead>
                              <tbody>
                                {propertyDocs.map(row => (
                                    <tr key={row.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                        <td className="p-3">
                                            <div className="flex items-center">
                                                <FileText size={18} className="mr-2 text-primary" />
                                                <span className="font-medium text-dark">{row.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-gray-700">{(row.type === DocumentType.OTHER && row.typeOther) ? row.typeOther : row.type}</td>
                                        <td className="p-3 text-gray-700">{new Date(row.uploadDate).toLocaleDateString('it-IT')}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center items-center gap-4">
                                                <a href={row.fileData || row.fileUrl} download={row.fileName} target={row.fileUrl ? "_blank" : "_self"} rel="noopener noreferrer" className="text-gray-500 hover:text-primary" title={row.fileName ? `Scarica ${row.fileName}` : 'Apri link esterno'}>
                                                    <Download size={18} />
                                                </a>
                                                <button onClick={() => setEditingDocument(row)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                                <button onClick={() => setDeletingDocument(row)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                              </tbody>
                           </table>
                        </div>
                    </AccordionItem>
                )
            })}
             {Object.keys(groupedDocuments).length === 0 && (
                <Card className="p-8 text-center text-gray-500">
                    Nessun documento trovato.
                </Card>
            )}
        </div>
      </div>

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
