
import React from 'react';
import { Transaction, Customer } from '../types';
import { TRANSLATIONS } from '../constants';
import { formatTime12h } from '../lib/utils';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: Transaction | null;
  customerName: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  customerName,
}) => {
  if (!isOpen || !transaction) return null;

  const t = TRANSLATIONS.bn;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-800">লেনদেন মুছুন?</h3>
            <p className="text-gray-500 text-sm mt-1">আপনি কি নিশ্চিতভাবে এই লেনদেনটি মুছতে চান?</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">কাস্টমার</span>
              <span className="text-sm font-bold text-gray-800">{customerName}</span>
            </div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">পরিমাণ</span>
              <span className={`text-sm font-bold ${transaction.type === 'CREDIT' ? 'text-red-600' : 'text-green-600'}`}>
                ৳ {transaction.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">তারিখ</span>
              <span className="text-sm text-gray-600">{transaction.date} {transaction.time && `• ${formatTime12h(transaction.time)}`}</span>
            </div>
            {transaction.note && (
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">নোট</span>
                <span className="text-sm text-gray-600">{transaction.note}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold active:scale-95 transition-all"
            >
              {t.cancel}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 active:scale-95 transition-all"
            >
              মুছুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
