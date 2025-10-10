
import React from 'react';
import Card from '../components/ui/Card';
import { MOCK_DOCUMENTS, MOCK_PROPERTIES } from '../constants';
import { Document } from '../types';
import { FileText, Download, Clock, PlusCircle } from 'lucide-react';

const DocumentsScreen: React.FC = () => {
    const getPropertyName = (id: string) => MOCK_PROPERTIES.find(p => p.id === id)?.name || 'N/A';
  
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-dark">Archivio Documenti</h1>
          <button
            onClick={() => alert("Funzionalità 'Carica Documento' da implementare.")}
            className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
          >
            <PlusCircle size={18} className="mr-2" />
            Carica Documento
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-600">Nome Documento</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Immobile</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Data Caricamento</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-center">Azione</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DOCUMENTS.map((doc: Document) => (
                <tr key={doc.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-dark font-medium flex items-center">
                    <FileText size={18} className="text-primary mr-2"/>
                    {doc.name}
                  </td>
                  <td className="p-3 text-gray-700">{getPropertyName(doc.propertyId)}</td>
                  <td className="p-3 text-gray-700">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">{doc.type}</span>
                  </td>
                  <td className="p-3 text-gray-700 flex items-center">
                    <Clock size={14} className="mr-1 text-gray-400"/>
                    {new Date(doc.uploadDate).toLocaleDateString('it-IT')}
                  </td>
                  <td className="p-3 text-center">
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-primary hover:text-primary-hover" title="Scarica">
                      <Download size={20} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
};

export default DocumentsScreen;
