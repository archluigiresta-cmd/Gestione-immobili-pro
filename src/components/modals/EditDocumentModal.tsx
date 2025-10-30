import React, { useState, useEffect } from 'react';
import { Document, Property, CustomField, CustomFieldType, DocumentType } from '../../types';
import { X, PlusCircle, Trash2, Link, UploadCloud, File as FileIcon } from 'lucide-react';
import * as dataService from '../../services/dataService';

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: Document) => void;
  document: Document;
  projectId: string;
}

const EditDocumentModal: React.FC<EditDocumentModalProps> = ({ isOpen, onClose, onSave, document, projectId }) => {
  const [formData, setFormData] = useState<Document>(document);
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState('');
  const [uploadType, setUploadType] = useState<'url' | 'file'>(document.fileData ? 'file' : 'url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setFormData(document);
    setUploadType(document.fileData ? 'file' : 'url');
    setSelectedFile(null);
  }, [document]);

  useEffect(() => {
    if (isOpen) {
      setProperties(dataService.getProperties(projectId));
    }
  }, [isOpen, projectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'type') {
        setFormData(prev => ({
            ...prev,
            type: value as DocumentType,
            ...(value !== DocumentType.OTHER && { typeOther: '' }),
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadTypeChange = (type: 'url' | 'file') => {
    setUploadType(type);
    if (type === 'url') {
        setFormData(prev => ({...prev, fileData: undefined, fileName: undefined}));
        setSelectedFile(null);
    } else {
        setFormData(prev => ({...prev, fileUrl: undefined}));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAddCustomField = () => {
    const newField = { id: `cf-${Date.now()}`, label: '', type: CustomFieldType.TEXT, value: '' };
    setFormData(prev => ({ ...prev, customFields: [...prev.customFields, newField] }));
  };
  
  const handleCustomFieldChange = (index: number, field: keyof CustomField, value: any) => {
    const newCustomFields = [...formData.customFields];
    const targetField = { ...newCustomFields[index] };

    if (field === 'type') {
      targetField.value = value === CustomFieldType.BOOLEAN ? false : '';
    }
    (targetField as any)[field] = value;
    newCustomFields[index] = targetField;
    setFormData(prev => ({...prev, customFields: newCustomFields}));
  };
  
  const handleRemoveCustomField = (id: string) => {
    setFormData(prev => ({ ...prev, customFields: prev.customFields.filter(cf => cf.id !== id) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.propertyId) {
      setError('Nome del documento e immobile sono obbligatori.');
      return;
    }
     if (uploadType === 'url' && !formData.fileUrl) {
      setError('L\'URL del file è obbligatorio.');
      return;
    }
    if (uploadType === 'file' && !selectedFile && !formData.fileData) {
      setError('Devi selezionare un file da caricare.');
      return;
    }
    if (formData.type === DocumentType.OTHER && !formData.typeOther?.trim()) {
        setError('Specificare il tipo di documento è obbligatorio quando si seleziona "Altro".');
        return;
    }

    const cleanedCustomFields = formData.customFields.filter(cf => cf.label.trim() !== '');
    const { typeOther, ...restOfData } = formData;
    let dataToSave = {
        ...restOfData,
        customFields: cleanedCustomFields,
        ...(formData.type === DocumentType.OTHER && { typeOther }),
    };

    if (uploadType === 'file' && selectedFile) {
        const fileData = await handleFileToBase64(selectedFile);
        dataToSave.fileData = fileData;
        dataToSave.fileName = selectedFile.name;
        dataToSave.fileUrl = undefined;
    }

    onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Modifica Documento</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Documento</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full input" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Immobile</label>
              <select name="propertyId" value={formData.propertyId} onChange={handleChange} className="mt-1 block w-full input">
                <option value="">Seleziona immobile</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo Documento</label>
              <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full input">
                {Object.values(DocumentType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
          {formData.type === DocumentType.OTHER && (
               <div className="md:col-start-2">
                <label className="block text-sm font-medium text-gray-700">Specifica Tipo</label>
                <input
                  type="text"
                  name="typeOther"
                  value={formData.typeOther || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full input"
                  placeholder="Es. Atto di compravendita"
                />
              </div>
          )}

           <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sorgente del Documento</label>
            <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
                <button type="button" onClick={() => handleUploadTypeChange('url')} className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${uploadType === 'url' ? 'bg-primary text-white shadow' : 'text-gray-600'}`}>
                    <Link size={16}/> Link Esterno (URL)
                </button>
                <button type="button" onClick={() => handleUploadTypeChange('file')} className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${uploadType === 'file' ? 'bg-primary text-white shadow' : 'text-gray-600'}`}>
                    <UploadCloud size={16}/> Carica File
                </button>
            </div>
          </div>
          
          {uploadType === 'url' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">URL del File</label>
              <input type="url" name="fileUrl" value={formData.fileUrl || ''} onChange={handleChange} className="mt-1 block w-full input" placeholder="https://..." />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">File Caricato</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                      {selectedFile ? (
                          <>
                              <FileIcon size={32} className="mx-auto text-green-500"/>
                              <p className="font-semibold text-dark">{selectedFile.name}</p>
                              <label htmlFor="file-upload-edit" className="text-sm cursor-pointer text-primary hover:underline">
                                  Cambia file
                                  <input id="file-upload-edit" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.dwg,.jpg,.jpeg,.png,.gif"/>
                              </label>
                          </>
                      ) : formData.fileName ? (
                          <>
                            <FileIcon size={32} className="mx-auto text-green-500"/>
                            <p className="font-semibold text-dark">{formData.fileName}</p>
                            <label htmlFor="file-upload-edit" className="text-sm cursor-pointer text-primary hover:underline">
                                Clicca per sostituire
                                <input id="file-upload-edit" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.dwg,.jpg,.jpeg,.png,.gif"/>
                            </label>
                          </>
                      ) : (
                           <>
                              <UploadCloud size={32} className="mx-auto text-gray-400"/>
                              <div className="flex text-sm text-gray-600">
                                  <label htmlFor="file-upload-edit" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none">
                                      <span>Cerca un file</span>
                                      <input id="file-upload-edit" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.dwg,.jpg,.jpeg,.png,.gif"/>
                                  </label>
                              </div>
                              <p className="text-xs text-gray-500">PDF, DWG, JPG, PNG, GIF</p>
                          </>
                      )}
                  </div>
              </div>
          </div>
          )}

          <div className="pt-2">
            <h3 className="text-md font-semibold text-dark border-b pb-2 mb-3">Campi Personalizzati</h3>
            <div className="space-y-3">
              {formData.customFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Nome Campo"
                    value={field.label}
                    onChange={(e) => handleCustomFieldChange(index, 'label', e.target.value)}
                    className="col-span-4 input"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => handleCustomFieldChange(index, 'type', e.target.value)}
                    className="col-span-3 input"
                  >
                    <option value={CustomFieldType.TEXT}>Testo</option>
                    <option value={CustomFieldType.BOOLEAN}>Sì/No</option>
                  </select>
                  <div className="col-span-4">
                    {field.type === CustomFieldType.TEXT ? (
                      <input
                        type="text"
                        placeholder="Valore"
                        value={field.value as string}
                        onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                        className="w-full input"
                      />
                    ) : (
                      <select
                        value={String(field.value)}
                        onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value === 'true')}
                        className="w-full input"
                      >
                        <option value="true">Sì</option>
                        <option value="false">No</option>
                      </select>
                    )}
                  </div>
                  <button type="button" onClick={() => handleRemoveCustomField(field.id)} className="col-span-1 text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleAddCustomField} className="mt-3 flex items-center text-sm text-primary font-semibold hover:underline">
              <PlusCircle size={16} className="mr-2" /> Aggiungi Campo
            </button>
          </div>

          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Salva Modifiche</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDocumentModal;
