
import React from 'react';
import { TRANSLATIONS } from '../constants';

interface NavbarProps {
  activeTab: 'home' | 'customers' | 'reports';
  setActiveTab: (tab: 'home' | 'customers' | 'reports') => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const t = TRANSLATIONS.bn;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 rounded-t-3xl shadow-2xl">
      <NavItem 
        isActive={activeTab === 'home'} 
        label={t.dashboard} 
        onClick={() => setActiveTab('home')}
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
      />
      <NavItem 
        isActive={activeTab === 'customers'} 
        label={t.customers} 
        onClick={() => setActiveTab('customers')}
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
      />
      <NavItem 
        isActive={activeTab === 'reports'} 
        label={t.reports} 
        onClick={() => setActiveTab('reports')}
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 2v-6m-9 9h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />}
      />
    </nav>
  );
};

const NavItem: React.FC<{ isActive: boolean; label: string; onClick: () => void; icon: React.ReactNode }> = ({ isActive, label, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-[#006A4E]' : 'text-gray-400'}`}
  >
    <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-green-50 scale-110' : ''}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {icon}
      </svg>
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default Navbar;
