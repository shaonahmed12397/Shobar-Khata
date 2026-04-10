
import React, { useState, useEffect } from 'react';
import { Customer, Transaction, TransactionType } from '../types';
import { TRANSLATIONS } from '../constants';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  customers: Customer[];
  onSubmit: (id: string, updates: Partial<Transaction>) => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ 
  isOpen, onClose, transaction, customers, onSubmit 
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<TransactionType>('CREDIT');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setNote(transaction.note || '');
      setDate(transaction.date);
      setType(transaction.type);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const t = TRANSLATIONS.bn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onSubmit(transaction.id, {
      amount: parseFloat(amount),
      type,
      note,
      date
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">লেনদেন সংশোধন</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
            <button 
              type="button"
              onClick={() => setType('CREDIT')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${type === 'CREDIT' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500'}`}
            >
              {t.baki}
            </button>
            <button 
              type="button"
              onClick={() => setType('PAYMENT')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${type === 'PAYMENT' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500'}`}
            >
              {t.jama}
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">{t.amount} (৳)</label>
            <input 
              type="number" 
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20 text-2xl font-bold"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
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
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-[#006A4E] text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all mt-4"
          >
            আপডেট করুন
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
