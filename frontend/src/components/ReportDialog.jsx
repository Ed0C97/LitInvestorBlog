import React, { useState } from 'react';
import { X, Flag, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import Modal from './Modal'; // <-- 1. IMPORTA IL COMPONENTE MODALE GENERICO

const ReportDialog = ({ isOpen, onClose, onSubmit, loading }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const reasons = [
    { value: 'spam', label: 'Spam or advertising' },
    { value: 'harassment', label: 'Harassment or bullying' },
    { value: 'hate_speech', label: 'Hate speech' },
    { value: 'misinformation', label: 'Misinformation' },
    { value: 'inappropriate_content', label: 'Inappropriate content' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = () => {
    if (!selectedReason) {
      return;
    }
    // Passa i dati al componente genitore che gestisce la logica API
    onSubmit(selectedReason, additionalInfo);
    // Pulisce lo stato internamente dopo l'invio
    setSelectedReason('');
    setAdditionalInfo('');
  };

  const handleClose = () => {
    // Pulisce lo stato quando si chiude la modale
    setSelectedReason('');
    setAdditionalInfo('');
    onClose();
  };

  // 2. USA IL COMPONENTE <Modal> COME CONTENITORE PRINCIPALE
  // Tutta la logica del portale e dello sfondo è ora gestita da <Modal>
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      className="max-w-[500px]" // Passiamo una classe per definire la larghezza
    >
      {/* 3. TUTTO IL JSX PRECEDENTE VA QUI DENTRO COME "CHILDREN" */}
      
      {/* Header */}
      <div className="flex items-center justify-between p-[1.5rem] border-b border-input-gray">
        <div className="flex items-center gap-[0.75rem]">
          <div className="p-[0.5rem] bg-red/10 rounded-full">
            <Flag className="w-[1.25rem] h-[1.25rem] text-red" />
          </div>
          <h2 className="text-xl font-bold text-dark">Report Comment</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
        >
          <X className="w-[1.srem] h-[1.5rem]" />
        </Button>
      </div>

      {/* Body */}
      <div className="p-[1.5rem] space-y-[1.5rem]">
        {/* Warning */}
        <div className="flex items-start gap-[0.75rem] p-[1rem] bg-yellow/10 border border-yellow/30 rounded-lg">
          <AlertTriangle className="w-[1.25rem] h-[1.25rem] text-yellow flex-shrink-0 mt-[0.125rem]" />
          <div className="text-sm text-dark">
            <p className="font-semibold mb-[0.25rem]">Before you report</p>
            <p className="text-gray">
              False reports may result in action against your account. Please select an accurate reason.
            </p>
          </div>
        </div>

        {/* Reason Selection */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-[0.75rem]">
            Why are you reporting this comment? *
          </label>
          <div className="space-y-[0.5rem]">
            {reasons.map((reason) => (
              <label
                key={reason.value}
                className={`flex items-center gap-[0.75rem] p-[0.75rem] border rounded-lg cursor-pointer transition-colors ${
                  selectedReason === reason.value
                    ? 'border-blue bg-blue/5'
                    : 'border-input-gray hover:bg-light-gray/30'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-[1rem] h-[1rem] text-blue focus:ring-blue"
                />
                <span className="text-sm text-dark">{reason.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <label className="block text-sm font-semibold text-dark mb-[0.5rem]">
            Additional information (optional)
          </label>
          <Textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Provide more context about why you're reporting this..."
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-[0.75rem] p-[1.5rem] border-t border-input-gray bg-light-gray/30">
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedReason || loading}
          className="bg-red hover:bg-red/90"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </Modal>
  );
};

export default ReportDialog;