
import React, { useState, useEffect } from 'react';
import { Customer, TransactionType } from '../types';
import { TRANSLATIONS } from '../constants';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType;
  customers: Customer[];
  preSelectedCustomerId?: string;
  onSubmit: (customerId: string, amount: number, type: TransactionType, note?: string, date?: string, time?: string) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ 
  isOpen, onClose, type, customers, preSelectedCustomerId, onSubmit 
}) => {
  const [customerId, setCustomerId] = useState(preSelectedCustomerId || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (preSelectedCustomerId) setCustomerId(preSelectedCustomerId);
  }, [preSelectedCustomerId]);

  if (!isOpen) return null;

  const t = TRANSLATIONS.bn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !amount) return;
    onSubmit(customerId, parseFloat(amount), type, note, date);
    // Reset
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold ${type === 'CREDIT' ? 'text-red-600' : 'text-green-600'}`}>
            {type === 'CREDIT' ? 'বাকি যোগ করুন' : 'জমা যোগ করুন'}
          </h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">{t.customers}</label>
            <select 
              value={customerId} 
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20"
              required
            >
              <option value="">কাস্টমার সিলেক্ট করুন</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">{t.amount} (৳)</label>
            <input 
              type="number" 
              placeholder="0.00"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20 text-2xl font-bold"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">তারিখ</label>
            <input 
              type="date" 
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">{t.note}</label>
            <input 
              type="text" 
              placeholder="যেমন: ১ কেজি চাল"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all mt-4 ${
              type === 'CREDIT' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
            }`}
          >
            {t.save}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
