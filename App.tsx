
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, Customer, Transaction, TransactionType } from './types';
import { TRANSLATIONS, COLORS } from './constants';
import { dbService } from './services/db';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import ReportView from './components/ReportView';
import Navbar from './components/Navbar';
import AddTransactionModal from './components/AddTransactionModal';
import AddCustomerModal from './components/AddCustomerModal';
import EditTransactionModal from './components/EditTransactionModal';
import EditCustomerModal from './components/EditCustomerModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'customers' | 'reports'>('home');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('CREDIT');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [state, setState] = useState<AppState>(() => dbService.loadData());

  const t = TRANSLATIONS.bn;

  // Sync with localStorage
  useEffect(() => {
    dbService.saveData(state);
  }, [state]);

  const addCustomer = (name: string, phone: string) => {
    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name,
      phone,
      balance: 0,
      lastUpdated: Date.now(),
    };
    setState(prev => ({
      ...prev,
      customers: [...prev.customers, newCustomer]
    }));
    setIsCustomerModalOpen(false);
  };

  const handleUpdateCustomer = (id: string, name: string, phone: string) => {
    setState(prev => ({
      ...prev,
      customers: prev.customers.map(c => c.id === id ? { ...c, name, phone, lastUpdated: Date.now() } : c)
    }));
    setIsEditCustomerModalOpen(false);
  };

  const deleteCustomer = (id: string) => {
    setState(prev => {
      const nextCustomers = prev.customers.filter(c => c.id !== id);
      const nextTransactions = prev.transactions.filter(t => t.customerId !== id);
      return dbService.calculateBalances(nextCustomers, nextTransactions);
    });
    setSelectedCustomerId(null);
  };

  const addTransaction = (customerId: string, amount: number, type: TransactionType, note?: string, date?: string, time?: string) => {
    const now = new Date();
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      customerId,
      amount,
      type,
      note,
      date: date || now.toISOString().split('T')[0],
      time: time || now.toTimeString().split(' ')[0].substring(0, 5),
      createdAt: Date.now(),
    };
    
    setState(prev => {
      const nextTransactions = [...prev.transactions, newTx];
      return dbService.calculateBalances(prev.customers, nextTransactions);
    });
    setIsTxModalOpen(false);
  };

  const handleEditTx = (id: string, updates: Partial<Transaction>) => {
    setState(prev => {
      const nextTransactions = prev.transactions.map(t => t.id === id ? { ...t, ...updates } : t);
      return dbService.calculateBalances(prev.customers, nextTransactions);
    });
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string) => {
    setState(prev => {
      const nextTransactions = prev.transactions.filter(t => t.id !== id);
      return dbService.calculateBalances(prev.customers, nextTransactions);
    });
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsEditModalOpen(true);
  };

  const selectedCustomer = useMemo(() => 
    state.customers.find(c => c.id === selectedCustomerId) || null,
  [selectedCustomerId, state.customers]);

  const renderContent = () => {
    if (selectedCustomerId) {
      return (
        <CustomerDetail 
          customer={selectedCustomer!} 
          transactions={state.transactions.filter(t => t.customerId === selectedCustomerId)}
          onBack={() => setSelectedCustomerId(null)}
          onAddTx={(type) => {
            setTxModalType(type);
            setIsTxModalOpen(true);
          }}
          onEditCustomer={() => setIsEditCustomerModalOpen(true)}
          onDeleteCustomer={deleteCustomer}
          onEditTx={openEditModal}
          onDeleteTx={deleteTransaction}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <Dashboard 
            state={state} 
            onQuickAdd={(type) => {
              setTxModalType(type);
              setIsTxModalOpen(true);
            }}
          />
        );
      case 'customers':
        return (
          <CustomerList 
            customers={state.customers} 
            onSelectCustomer={setSelectedCustomerId}
            onAddCustomer={() => setIsCustomerModalOpen(true)}
          />
        );
      case 'reports':
        return (
          <ReportView 
            transactions={state.transactions}
            customers={state.customers}
            onEditTx={openEditModal}
            onDeleteTx={deleteTransaction}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-50 shadow-xl overflow-hidden relative">
      <main className="flex-1 overflow-y-auto pb-24">
        {renderContent()}
      </main>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <AddTransactionModal 
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        type={txModalType}
        customers={state.customers}
        preSelectedCustomerId={selectedCustomerId || undefined}
        onSubmit={addTransaction}
      />

      <AddCustomerModal 
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSubmit={addCustomer}
      />

      <EditTransactionModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        transaction={editingTransaction}
        customers={state.customers}
        onSubmit={handleEditTx}
      />

      <EditCustomerModal
        isOpen={isEditCustomerModalOpen}
        onClose={() => setIsEditCustomerModalOpen(false)}
        customer={selectedCustomer}
        onSubmit={handleUpdateCustomer}
      />
    </div>
  );
};

export default App;
