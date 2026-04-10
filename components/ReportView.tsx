
import React, { useState, useMemo } from 'react';
import { Transaction, Customer } from '../types';
import { TRANSLATIONS } from '../constants';
import { formatTime12h } from '../lib/utils';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportViewProps {
  transactions: Transaction[];
  customers: Customer[];
  onEditTx: (tx: Transaction) => void;
  onDeleteTx: (id: string) => void;
}

const ReportView: React.FC<ReportViewProps> = ({ transactions, customers, onEditTx, onDeleteTx }) => {
  const t = TRANSLATIONS.bn;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const [filter, setFilter] = useState<'today' | 'month' | 'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const filteredTxs = useMemo(() => {
    const monthStr = now.toISOString().substring(0, 7);

    return transactions.filter(tx => {
      if (selectedCustomerId !== 'all' && tx.customerId !== selectedCustomerId) return false;
      if (filter === 'today') return tx.date === todayStr;
      if (filter === 'month') return tx.date.startsWith(monthStr);
      if (filter === 'custom') {
        return tx.date >= startDate && tx.date <= endDate;
      }
      return true;
    }).sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      return dateTimeB - dateTimeA || b.createdAt - a.createdAt;
    });
  }, [transactions, filter, selectedCustomerId, startDate, endDate, todayStr]);

  const groupedTxs = useMemo(() => {
    const groups: { [customerId: string]: { txs: Transaction[], balances: { [id: string]: number } } } = {};
    
    // First, calculate running balances for ALL transactions per customer
    const allGroups: { [customerId: string]: Transaction[] } = {};
    transactions.forEach(tx => {
      if (!allGroups[tx.customerId]) allGroups[tx.customerId] = [];
      allGroups[tx.customerId].push(tx);
    });

    Object.keys(allGroups).forEach(customerId => {
      const sorted = [...allGroups[customerId]].sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
        const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
        return dateTimeA - dateTimeB || a.createdAt - b.createdAt;
      });

      let runningBalance = 0;
      const balances: { [id: string]: number } = {};
      sorted.forEach(tx => {
        runningBalance = tx.type === 'CREDIT' ? runningBalance + tx.amount : runningBalance - tx.amount;
        balances[tx.id] = runningBalance;
      });

      // Now filter for the display
      const displayTxs = filteredTxs.filter(tx => tx.customerId === customerId);
      if (displayTxs.length > 0) {
        groups[customerId] = { txs: displayTxs, balances };
      }
    });

    return groups;
  }, [filteredTxs, transactions]);

  const stats = useMemo(() => {
    const totalCredit = filteredTxs.filter(t => t.type === 'CREDIT').reduce((a, b) => a + b.amount, 0);
    const totalPayment = filteredTxs.filter(t => t.type === 'PAYMENT').reduce((a, b) => a + b.amount, 0);
    return { totalCredit, totalPayment, net: totalPayment - totalCredit };
  }, [filteredTxs]);

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown';

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Transaction Report', 14, 22);
    
    // Filter Info
    doc.setFontSize(11);
    let filterText = `Period: ${filter === 'all' ? 'All Time' : (filter === 'month' ? 'This Month' : (filter === 'today' ? 'Today' : `${startDate} to ${endDate}`))}`;
    doc.text(filterText, 14, 30);
    
    const customerText = `Customer: ${selectedCustomerId === 'all' ? 'All Customers' : getCustomerName(selectedCustomerId)}`;
    doc.text(customerText, 14, 36);

    // Summary Stats
    doc.text(`Total Credit: BDT ${stats.totalCredit.toLocaleString()}`, 14, 46);
    doc.text(`Total Payment: BDT ${stats.totalPayment.toLocaleString()}`, 14, 52);
    doc.text(`Net Balance: BDT ${Math.abs(stats.net).toLocaleString()} ${stats.net >= 0 ? '(Receivable)' : '(Payable)'}`, 14, 58);

    const tableData: any[] = [];
    
    Object.keys(groupedTxs).forEach(customerId => {
      const { txs } = groupedTxs[customerId];
      const name = getCustomerName(customerId);
      
      txs.forEach(tx => {
        tableData.push([
          tx.date,
          name,
          tx.type === 'CREDIT' ? 'Credit (Baki)' : 'Payment (Jama)',
          tx.amount.toLocaleString(),
          tx.note || '-'
        ]);
      });
    });

    autoTable(doc, {
      startY: 65,
      head: [['Date', 'Customer', 'Type', 'Amount (BDT)', 'Note']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 106, 78] }
    });

    doc.save(`report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{t.reports}</h2>
        <button 
          onClick={exportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-[#006A4E] text-white rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF
        </button>
      </div>

      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
        {(['all', 'month', 'today', 'custom'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all ${
              filter === type ? 'bg-[#006A4E] text-white shadow-md' : 'text-gray-500'
            }`}
          >
            {type === 'all' ? 'সব সময়' : (type === 'month' ? 'এই মাস' : (type === 'today' ? 'আজ' : 'তারিখ'))}
          </button>
        ))}
      </div>

      {filter === 'custom' && (
        <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">শুরু</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 bg-white border border-gray-100 rounded-2xl outline-none text-sm font-medium text-gray-700 shadow-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">শেষ</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 bg-white border border-gray-100 rounded-2xl outline-none text-sm font-medium text-gray-700 shadow-sm"
            />
          </div>
        </div>
      )}

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">কাস্টমার ফিল্টার</label>
        <select 
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="w-full p-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#006A4E]/20 text-sm font-medium text-gray-700 shadow-sm"
        >
          <option value="all">সব কাস্টমার</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
          <p className="text-xs text-red-600 font-bold uppercase tracking-tight">মোট বাকি</p>
          <p className="text-xl font-bold text-red-700">৳ {stats.totalCredit.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
          <p className="text-xs text-green-600 font-bold uppercase tracking-tight">মোট জমা</p>
          <p className="text-xl font-bold text-green-700">৳ {stats.totalPayment.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedTxs).length > 0 ? Object.keys(groupedTxs).map(customerId => {
          const { txs: customerTxs, balances } = groupedTxs[customerId];
          const customerNet = customerTxs.reduce((acc, tx) => tx.type === 'CREDIT' ? acc - tx.amount : acc + tx.amount, 0);
          
          return (
            <div key={customerId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#006A4E] text-white flex items-center justify-center text-xs font-bold">
                    {getCustomerName(customerId).charAt(0)}
                  </div>
                  <h3 className="font-bold text-gray-700">{getCustomerName(customerId)}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">এই সময়ের নেট</p>
                  <p className={`text-sm font-bold ${customerNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {customerNet >= 0 ? '+' : '-'} ৳ {Math.abs(customerNet).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {customerTxs.map(tx => (
                  <div 
                    key={tx.id} 
                    className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors group cursor-pointer active:bg-gray-100"
                    onClick={() => onEditTx(tx)}
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs text-gray-400">{tx.date} {tx.time && `• ${formatTime12h(tx.time)}`}</p>
                        <div className="text-right">
                           <p className="text-[10px] text-gray-400 font-bold uppercase">ব্যালেন্স</p>
                           <p className={`text-xs font-bold ${balances[tx.id] > 0 ? 'text-red-500' : (balances[tx.id] < 0 ? 'text-green-600' : 'text-gray-400')}`}>
                             ৳ {Math.abs(balances[tx.id]).toLocaleString()} {balances[tx.id] > 0 ? '(বাকি)' : (balances[tx.id] < 0 ? '(অগ্রিম)' : '')}
                           </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-700">{tx.note || (tx.type === 'CREDIT' ? 'বাকি' : 'জমা')}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <p className={`font-bold whitespace-nowrap ${tx.type === 'CREDIT' ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.type === 'CREDIT' ? '-' : '+'} ৳ {tx.amount.toLocaleString()}
                      </p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setTxToDelete(tx);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }) : (
          <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
            কোনো ডাটা পাওয়া যায়নি
          </div>
        )}
      </div>
      <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-2">যেকোনো লেনদেন সংশোধন করতে উপরে ট্যাপ করুন</p>
      
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
        customerName={txToDelete ? getCustomerName(txToDelete.customerId) : ''}
      />
    </div>
  );
};

export default ReportView;
