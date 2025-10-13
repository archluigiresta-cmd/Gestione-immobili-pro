
import React, { useState, useEffect, useMemo } from 'react';
import { Deadline, DeadlineType, Property } from '../../types';
import { X, CalendarPlus } from 'lucide-react';
import * as dataService from '../../services/dataService';

// Helper function to generate a Google Calendar link
const generateGoogleCalendarUrl = (deadline: Deadline, propertyName: string) => {
    const title = encodeURIComponent(`${deadline.title} (${propertyName})`);
    const details = encodeURIComponent(`Scadenza per l'immobile: ${propertyName}.\nTipo: ${deadline.type}${deadline.typeOther ? ` (${deadline.typeOther})` : ''}.`);
    // Format for all-day event: YYYYMMDD / YYYYMMDD+1
    const startDate = deadline.dueDate.replace(/-/g, '');
    const endDate = new Date(deadline.dueDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '');

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDateStr}&details=${details}`;
};

// Helper function to generate and download an .ics file
const handleIcsDownload = (deadline: Deadline, propertyName: string) => {
    const formatDate = (dateStr: string) => dateStr.replace(/-/g, '');
    const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
    const startDate = formatDate(deadline.dueDate);

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//GestImmoPRO//IT',
        'BEGIN:VEVENT',
        `UID:${deadline.id}@gestimmopro.app`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${startDate}`,
        `SUMMARY:${deadline.title} (${propertyName})`,
        `DESCRIPTION:Scadenza per l'immobile: ${propertyName}. Tipo: ${deadline.type}${deadline.typeOther ? ` (${deadline.typeOther})` : ''}.`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const sanitizedTitle = deadline.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `${sanitizedTitle}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


interface EditDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deadline: Deadline) => void;
  deadline: Deadline;
  projectId: string;
}

const EditDeadlineModal: React.FC<EditDeadlineModalProps> = ({ isOpen, onClose, onSave, deadline, projectId }) => {
  const [formData, setFormData] = useState<Deadline>(deadline);
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState('');

  const propertyName = useMemo(() => {
    return dataService.getProperty(projectId, formData.propertyId)?.name || 'N/A';
  }, [projectId, formData.propertyId]);

  useEffect(() => {
    setFormData(deadline);
  }, [deadline]);
  
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
            type: value as DeadlineType,
            ...(value !== DeadlineType.OTHER && { typeOther: '' }),
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isCompleted: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.title || !formData.dueDate) {
      setError('Tutti i campi sono obbligatori.');
      return;
    }
     if (formData.type === DeadlineType.OTHER && !formData.typeOther?.trim()) {
        setError('Specificare il tipo è obbligatorio quando si seleziona "Altro".');
        return;
    }

    const { typeOther, ...restOfData } = formData;
    const dataToSave = {
        ...restOfData,
        ...(formData.type === DeadlineType.OTHER && { typeOther }),
    };

    onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Modifica Scadenza</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titolo</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Immobile</label>
            <select name="propertyId" value={formData.propertyId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
              <option value="">Seleziona immobile</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Scadenza</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                {Object.values(DeadlineType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
           {formData.type === DeadlineType.OTHER && (
               <div>
                <label className="block text-sm font-medium text-gray-700">Specifica Tipo</label>
                <input
                  type="text"
                  name="typeOther"
                  value={formData.typeOther || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full input"
                  placeholder="Es. Fattura fornitore"
                />
              </div>
          )}
           <div className="flex items-center">
                <input
                    id="isCompleted"
                    name="isCompleted"
                    type="checkbox"
                    checked={formData.isCompleted}
                    onChange={handleToggle}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="isCompleted" className="ml-2 block text-sm text-gray-900">
                    Completata
                </label>
            </div>

            <div className="pt-4 border-t">
                 <h3 className="text-md font-semibold text-dark flex items-center mb-3"><CalendarPlus size={18} className="mr-2 text-primary"/>Esporta nel tuo calendario</h3>
                 <div className="flex gap-3">
                     <a
                        href={generateGoogleCalendarUrl(formData, propertyName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-semibold"
                     >
                         Google Calendar
                     </a>
                      <button
                        type="button"
                        onClick={() => handleIcsDownload(formData, propertyName)}
                        className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-semibold"
                     >
                         Apple / Outlook (.ics)
                     </button>
                 </div>
            </div>

          <div className="flex justify-end pt-4 border-t">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm">Salva Modifiche</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDeadlineModal;
