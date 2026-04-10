
import React, { useState } from 'react';
import { Customer, Transaction, TransactionType } from '../types';
import { TRANSLATIONS } from '../constants';
import { formatTime12h, formatDate } from '../lib/utils';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DeleteCustomerConfirmationModal from './DeleteCustomerConfirmationModal';

interface CustomerDetailProps {
  customer: Customer;
  transactions: Transaction[];
  onBack: () => void;
  onAddTx: (type: TransactionType) => void;
  onEditCustomer: () => void;
  onDeleteCustomer: (id: string) => void;
  onEditTx: (tx: Transaction) => void;
  onDeleteTx: (id: string) => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ 
  customer, transactions, onBack, onAddTx, onEditCustomer, onDeleteCustomer, onEditTx, onDeleteTx 
}) => {
  const t = TRANSLATIONS.bn;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteCustomerModalOpen, setIsDeleteCustomerModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const sortedTxs = [...transactions].sort((a, b) => {
    const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return dateTimeB - dateTimeA || b.createdAt - a.createdAt;
  });

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-6 duration-300">
      {/* Header */}
      <div className="bg-[#006A4E] text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg leading-tight">{customer.name}</h2>
                <button 
                  onClick={onEditCustomer}
                  className="p-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  title="এডিট করুন"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setIsDeleteCustomerModalOpen(true)}
                  className="p-1 bg-red-500/20 rounded-lg hover:bg-red-500/40 transition-colors text-red-200"
                  title="কাস্টমার মুছুন"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className="text-xs opacity-80">{customer.phone}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 flex justify-between items-center backdrop-blur-sm border border-white/10">
          <div>
            <p className="text-xs opacity-70 uppercase font-bold tracking-widest">{t.runningBalance}</p>
            <p className="text-2xl font-bold">৳ {Math.abs(customer.balance).toLocaleString()}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            customer.balance > 0 ? 'bg-red-500 text-white' : (customer.balance < 0 ? 'bg-green-500 text-white' : 'bg-gray-400 text-white')
          }`}>
            {customer.balance > 0 ? t.due : (customer.balance < 0 ? t.advance : 'নীল')}
          </span>
        </div>
      </div>

      {/* Transactions */}
      <div className="flex-1 p-4 space-y-4">
        {sortedTxs.length > 0 ? sortedTxs.map((tx) => (
          <div 
            key={tx.id} 
            className="flex gap-3 group cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => onEditTx(tx)}
          >
            <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${tx.type === 'CREDIT' ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <div className="flex-1 bg-gray-50 rounded-2xl p-4 relative border border-transparent hover:border-gray-200 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-gray-400">
                  {formatDate(tx.date)} {tx.time && <span className="ml-1">• {formatTime12h(tx.time)}</span>}
                </span>
                <div className="flex gap-2">
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       setTxToDelete(tx);
                       setIsDeleteModalOpen(true);
                     }} 
                     className="text-[10px] text-gray-300 hover:text-red-500 font-bold uppercase tracking-wider transition-colors"
                   >
                     মুছুন
                   </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-700 font-medium">{tx.note || (tx.type === 'CREDIT' ? 'বাকি লেনদেন' : 'জমা লেনদেন')}</p>
                <div className="text-right">
                  <p className={`font-bold text-lg ${tx.type === 'CREDIT' ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.type === 'CREDIT' ? '-' : '+'} ৳ {tx.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 text-gray-400">
            {t.noTransactions}
          </div>
        )}
      </div>

      {/* Floating Action Buttons for detail view */}
      <div className="p-4 grid grid-cols-2 gap-4 sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100">
        <button 
          onClick={() => onAddTx('CREDIT')}
          className="bg-red-50 text-red-600 py-3 rounded-2xl font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 border border-red-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          দিলাম ({t.baki})
        </button>
        <button 
          onClick={() => onAddTx('PAYMENT')}
          className="bg-green-600 text-white py-3 rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          পেলাম ({t.jama})
        </button>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTxToDelete(null);
        }}
        onConfirm={() => {
          if (txToDelete) onDeleteTx(txToDelete.id);
        }}
        transaction={txToDelete}
        customerName={customer.name}
      />

      <DeleteCustomerConfirmationModal
        isOpen={isDeleteCustomerModalOpen}
        onClose={() => setIsDeleteCustomerModalOpen(false)}
        onConfirm={() => onDeleteCustomer(customer.id)}
        customer={customer}
        transactionCount={transactions.length}
      />
    </div>
  );
};

export default CustomerDetail;
