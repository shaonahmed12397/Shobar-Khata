
import React from 'react';
import { Customer } from '../types';
import { TRANSLATIONS } from '../constants';

interface DeleteCustomerConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customer: Customer | null;
  transactionCount: number;
}

const DeleteCustomerConfirmationModal: React.FC<DeleteCustomerConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  customer,
  transactionCount,
}) => {
  if (!isOpen || !customer) return null;

  const t = TRANSLATIONS.bn;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-800">কাস্টমার মুছুন?</h3>
            <p className="text-gray-500 text-sm mt-1">আপনি কি নিশ্চিতভাবে এই কাস্টমার এবং তার সকল তথ্য মুছতে চান?</p>
          </div>

          <div className="bg-red-50 rounded-2xl p-4 text-left border border-red-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">কাস্টমার নাম</span>
              <span className="text-sm font-bold text-red-900">{customer.name}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">ফোন নম্বর</span>
              <span className="text-sm font-medium text-red-800">{customer.phone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">মোট লেনদেন</span>
              <span className="text-sm font-bold text-red-900">{transactionCount} টি</span>
            </div>
          </div>

          <p className="text-[11px] text-red-500 font-medium italic">
            * সতর্কবার্তা: কাস্টমার মুছলে তার সকল লেনদেনের ইতিহাস চিরতরে মুছে যাবে।
          </p>

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

export default DeleteCustomerConfirmationModal;
