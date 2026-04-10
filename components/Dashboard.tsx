
import React from 'react';
import { AppState, TransactionType } from '../types';
import { TRANSLATIONS, COLORS } from '../constants';
import { formatDate } from '../lib/utils';

interface DashboardProps {
  state: AppState;
  onQuickAdd: (type: TransactionType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onQuickAdd }) => {
  const t = TRANSLATIONS.bn;
  
  const today = new Date().toISOString().split('T')[0];
  const todayTxs = state.transactions.filter(tx => tx.date === today);
  
  const todayCredit = todayTxs.filter(tx => tx.type === 'CREDIT').reduce((a, b) => a + b.amount, 0);
  const todayPayment = todayTxs.filter(tx => tx.type === 'PAYMENT').reduce((a, b) => a + b.amount, 0);

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t.appName}</h1>
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-green-800 font-bold">SK</span>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-red-500">
          <p className="text-sm text-gray-500 font-medium">{t.totalBaki}</p>
          <p className="text-xl font-bold text-red-600">৳ {state.totalReceivable.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">{t.totalJama}</p>
          <p className="text-xl font-bold text-green-600">৳ {state.totalPayable.toLocaleString()}</p>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="bg-[#006A4E] text-white p-6 rounded-3xl shadow-lg">
        <h3 className="text-lg font-semibold opacity-90 mb-4">{t.today} - {formatDate(today)}</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs opacity-70 uppercase tracking-wider">{t.baki}</p>
            <p className="text-xl font-bold">৳ {todayCredit}</p>
          </div>
          <div className="h-10 w-[1px] bg-white/20"></div>
          <div className="text-right">
            <p className="text-xs opacity-70 uppercase tracking-wider">{t.jama}</p>
            <p className="text-xl font-bold">৳ {todayPayment}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest px-1">কুইক অ্যাকশন</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onQuickAdd('CREDIT')}
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2 group border border-transparent hover:border-red-100"
          >
            <div className="p-3 bg-red-50 rounded-xl group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="font-semibold text-gray-700">{t.baki} যোগ</span>
          </button>

          <button 
            onClick={() => onQuickAdd('PAYMENT')}
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2 group border border-transparent hover:border-green-100"
          >
            <div className="p-3 bg-green-50 rounded-xl group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-semibold text-gray-700">{t.jama} যোগ</span>
          </button>
        </div>
      </div>
      
      {/* Visual Welcome Image Placeholder */}
      <div className="relative overflow-hidden rounded-3xl bg-blue-50 p-6 h-32 flex items-center">
        <div className="z-10">
          <p className="text-blue-900 font-bold text-lg">আপনার ব্যবসার বিশ্বস্ত সাথী</p>
          <p className="text-blue-700 text-sm">হিসাব রাখুন নির্ভুলভাবে</p>
        </div>
        <img src="https://picsum.photos/200/200?grayscale" alt="illus" className="absolute right-0 top-0 h-full w-1/3 object-cover opacity-20" />
      </div>
    </div>
  );
};

export default Dashboard;
