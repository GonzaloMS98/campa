import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ResetModalProps } from '../types';

const ResetModal: React.FC<ResetModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center mb-4">
          <AlertTriangle size={24} className="text-red-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">Reset Event Data</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to reset all event data? This will delete all match records and reset the leaderboard.
          </p>
          <p className="text-red-600 font-semibold">
            This action cannot be undone!
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetModal;