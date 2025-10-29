import React from 'react';
import { X } from 'lucide-react';

interface ExpenseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExpenseHistoryModal: React.FC<ExpenseHistoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Cronologia Spesa</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <p>Cronologia non implementata.</p>
      </div>
    </div>
  );
};

export default ExpenseHistoryModal;
