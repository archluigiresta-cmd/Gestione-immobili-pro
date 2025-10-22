import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
// FIX: Import from widgets file to break circular dependency with DashboardScreen
import { availableDashboardWidgets } from '../dashboard/widgets';

interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedWidgets: string[]) => void;
  currentWidgets: string[];
}

const CustomizeDashboardModal: React.FC<CustomizeDashboardModalProps> = ({ isOpen, onClose, onSave, currentWidgets }) => {
  const [selected, setSelected] = useState(new Set(currentWidgets));

  useEffect(() => {
    setSelected(new Set(currentWidgets));
  }, [currentWidgets]);

  const handleToggle = (widgetId: string) => {
    const newSelection = new Set(selected);
    if (newSelection.has(widgetId)) {
      newSelection.delete(widgetId);
    } else {
      newSelection.add(widgetId);
    }
    setSelected(newSelection);
  };

  const handleSave = () => {
    onSave(Array.from(selected));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Personalizza Dashboard</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Seleziona i widget che vuoi visualizzare sulla tua dashboard.</p>
          {availableDashboardWidgets.map(widget => (
            <label key={widget.id} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={selected.has(widget.id)}
                onChange={() => handleToggle(widget.id)}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-3 font-medium text-gray-800">{widget.name}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end pt-6">
          <button type="button" onClick={onClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Annulla
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
          >
            Salva Preferenze
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeDashboardModal;