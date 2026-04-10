
import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, phone: string) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const t = TRANSLATIONS.bn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSubmit(name, phone || '01XXXXXXX');
    setName('');
    setPhone('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">{t.addCustomer}</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">{t.name}</label>
            <input 
              type="text" 
              placeholder="কাস্টমারের নাম লিখুন"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">{t.phone}</label>
            <input 
              type="tel" 
              placeholder="যেমন: ০১৭০০০০০০০০"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-[#006A4E] text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all mt-4"
          >
            সেভ করুন
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;
