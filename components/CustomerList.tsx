
import React, { useState } from 'react';
import { Customer } from '../types';
import { TRANSLATIONS } from '../constants';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
  onAddCustomer: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onSelectCustomer, onAddCustomer }) => {
  const t = TRANSLATIONS.bn;
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  ).sort((a, b) => b.lastUpdated - a.lastUpdated);

  return (
    <div className="p-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t.customers}</h2>
        <button 
          onClick={onAddCustomer}
          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 shadow-md active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {t.addCustomer}
        </button>
      </div>

      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input 
          type="text" 
          placeholder="কাস্টমার খুঁজুন..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? filtered.map(customer => (
          <div 
            key={customer.id} 
            onClick={() => onSelectCustomer(customer.id)}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center active:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                customer.balance > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
              }`}>
                {customer.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-800">{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.phone}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ৳ {Math.abs(customer.balance).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 font-medium">
                {customer.balance > 0 ? t.due : (customer.balance < 0 ? t.advance : 'হিসাব নীল')}
              </p>
            </div>
          </div>
        )) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-gray-400">কাস্টমার পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
