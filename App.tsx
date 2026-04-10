
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
import SettingsView from './components/SettingsView';
import PinEntry from './components/PinEntry';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot, 
  query, 
  where, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'customers' | 'reports' | 'settings'>('home');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('CREDIT');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userPin, setUserPin] = useState<string | null>(null);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [isPinLoading, setIsPinLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [rawCustomers, setRawCustomers] = useState<Customer[]>([]);
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);

  const state = useMemo(() => {
    return dbService.calculateBalances(rawCustomers, rawTransactions);
  }, [rawCustomers, rawTransactions]);

  const t = TRANSLATIONS.bn;

  // Online/Offline Listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auth Listener
  useEffect(() => {
    let unsubUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsAuthReady(true);
      
      if (!u) {
        setRawCustomers([]);
        setRawTransactions([]);
        setUserPin(null);
        setIsPinVerified(false);
        setIsPinLoading(false);
        if (unsubUserDoc) unsubUserDoc();
      } else {
        setIsPinLoading(true);
        // Use onSnapshot for the user document to ensure it's cached and reactive
        unsubUserDoc = onSnapshot(doc(db, 'users', u.uid), async (snapshot) => {
          if (snapshot.exists()) {
            setUserPin(snapshot.data().pin || null);
            setIsPinLoading(false);
          } else {
            // Create user doc if it doesn't exist
            try {
              const newUser = {
                uid: u.uid,
                email: u.email || '',
                displayName: u.displayName || '',
                photoURL: u.photoURL || '',
                createdAt: Date.now()
              };
              await setDoc(doc(db, 'users', u.uid), newUser);
              // snapshot will trigger again
            } catch (err) {
              console.error('Error creating user doc:', err);
              setIsPinLoading(false);
            }
          }
        }, (err) => {
          console.error('Error listening to user doc:', err);
          setIsPinLoading(false);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  const handlePinSuccess = async (pin: string) => {
    if (!user) return;
    
    if (!userPin) {
      // First time setting up PIN
      try {
        await setDoc(doc(db, 'users', user.uid), { pin }, { merge: true });
        setUserPin(pin);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
    setIsPinVerified(true);
  };

  // Firestore Sync
  useEffect(() => {
    if (!user || !isAuthReady) {
      setRawCustomers([]);
      setRawTransactions([]);
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);
    const customersQuery = query(collection(db, 'customers'), where('ownerUid', '==', user.uid));
    const transactionsQuery = query(collection(db, 'transactions'), where('ownerUid', '==', user.uid));

    const unsubCustomers = onSnapshot(customersQuery, { includeMetadataChanges: true }, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Customer);
      setRawCustomers(data);
      setIsSyncing(snapshot.metadata.hasPendingWrites);
      setIsDataLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'customers');
      setIsDataLoading(false);
    });

    const unsubTransactions = onSnapshot(transactionsQuery, { includeMetadataChanges: true }, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Transaction);
      setRawTransactions(data);
      setIsSyncing(snapshot.metadata.hasPendingWrites);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'transactions'));

    return () => {
      unsubCustomers();
      unsubTransactions();
    };
  }, [user, isAuthReady]);

  // Local Data Migration
  useEffect(() => {
    if (!user || !isAuthReady || isDataLoading) return;

    const migrateLocalData = async () => {
      const localData = dbService.loadData();
      if (localData.customers.length > 0 && rawCustomers.length === 0) {
        if (confirm('আপনার ফোনে কিছু অফলাইন ডাটা পাওয়া গেছে। আপনি কি এগুলো আপনার গুগল অ্যাকাউন্টে সিঙ্ক করতে চান?')) {
          try {
            const batch = writeBatch(db);
            localData.customers.forEach(c => {
              batch.set(doc(db, 'customers', c.id), { ...c, ownerUid: user.uid });
            });
            localData.transactions.forEach(t => {
              batch.set(doc(db, 'transactions', t.id), { ...t, ownerUid: user.uid });
            });
            await batch.commit();
            // Clear local storage after migration
            dbService.saveData({ customers: [], transactions: [], totalReceivable: 0, totalPayable: 0 });
            alert('সফলভাবে সিঙ্ক করা হয়েছে!');
          } catch (err) {
            console.error('Migration failed:', err);
          }
        }
      }
    };

    migrateLocalData();
  }, [user, isAuthReady, isDataLoading, rawCustomers.length]);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setSelectedCustomerId(null);
      setActiveTab('home');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const addCustomer = async (name: string, phone: string) => {
    if (!user) return;
    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name,
      phone,
      balance: 0,
      lastUpdated: Date.now(),
      ownerUid: user.uid
    };
    
    try {
      await setDoc(doc(db, 'customers', newCustomer.id), newCustomer);
      setIsCustomerModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `customers/${newCustomer.id}`);
    }
  };

  const handleUpdateCustomer = async (id: string, name: string, phone: string) => {
    if (!user) return;
    const customer = state.customers.find(c => c.id === id);
    if (!customer) return;

    const updated = { ...customer, name, phone, lastUpdated: Date.now() };
    try {
      await setDoc(doc(db, 'customers', id), updated);
      setIsEditCustomerModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `customers/${id}`);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'customers', id));
      
      // Also delete their transactions
      const customerTxs = state.transactions.filter(t => t.customerId === id);
      customerTxs.forEach(tx => {
        batch.delete(doc(db, 'transactions', tx.id));
      });

      await batch.commit();
      setSelectedCustomerId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `customers/${id}`);
    }
  };

  const addTransaction = async (customerId: string, amount: number, type: TransactionType, note?: string, date?: string, time?: string) => {
    if (!user) return;
    const now = new Date();
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      customerId,
      amount,
      type,
      note: note || '',
      date: date || now.toISOString().split('T')[0],
      time: time || now.toTimeString().split(' ')[0].substring(0, 5),
      createdAt: Date.now(),
      ownerUid: user.uid
    };
    
    try {
      await setDoc(doc(db, 'transactions', newTx.id), newTx);
      setIsTxModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `transactions/${newTx.id}`);
    }
  };

  const handleEditTx = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    const updated = { ...tx, ...updates };
    try {
      await setDoc(doc(db, 'transactions', id), updated);
      setIsEditModalOpen(false);
      setEditingTransaction(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `transactions/${id}`);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `transactions/${id}`);
    }
  };

  const clearAllData = async () => {
    if (!user) return;
    if (!confirm('আপনি কি নিশ্চিতভাবে সকল ডাটা মুছতে চান?')) return;

    try {
      const batch = writeBatch(db);
      state.customers.forEach(c => batch.delete(doc(db, 'customers', c.id)));
      state.transactions.forEach(t => batch.delete(doc(db, 'transactions', t.id)));
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'all');
    }
  };

  const restoreData = async (data: AppState) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      // Clear existing
      state.customers.forEach(c => batch.delete(doc(db, 'customers', c.id)));
      state.transactions.forEach(t => batch.delete(doc(db, 'transactions', t.id)));
      
      // Add new
      data.customers.forEach(c => {
        const newC = { ...c, ownerUid: user.uid };
        batch.set(doc(db, 'customers', c.id), newC);
      });
      data.transactions.forEach(t => {
        const newT = { ...t, ownerUid: user.uid };
        batch.set(doc(db, 'transactions', t.id), newT);
      });

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'restore');
    }
  };

  const resetPin = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { pin: null }, { merge: true });
      setUserPin(null);
      setIsPinVerified(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsEditModalOpen(true);
  };

  const selectedCustomer = useMemo(() => 
    state.customers.find(c => c.id === selectedCustomerId) || null,
  [selectedCustomerId, state.customers]);

  const renderContent = () => {
    if (!isAuthReady || (user && (isPinLoading || isDataLoading))) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006A4E]"></div>
          <p className="mt-4 text-sm text-gray-500">ডাটা লোড হচ্ছে...</p>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center space-y-6">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#006A4E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">লগইন করুন</h2>
          <p className="text-gray-500">আপনার ডাটা সুরক্ষিত রাখতে এবং অটো-সিঙ্ক করতে গুগল দিয়ে লগইন করুন।</p>
          <button 
            onClick={login}
            className="w-full py-4 bg-white border-2 border-gray-100 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            গুগল দিয়ে লগইন
          </button>
        </div>
      );
    }

    if (!isPinVerified) {
      return (
        <PinEntry 
          correctPin={userPin} 
          onSuccess={handlePinSuccess} 
          onLogout={logout}
        />
      );
    }

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
      case 'settings':
        return (
          <SettingsView 
            state={state}
            onRestore={restoreData}
            onClear={clearAllData}
            user={user}
            onLogout={logout}
            onResetPin={resetPin}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-gray-50 shadow-xl overflow-hidden relative">
      {/* Sync Status Bar */}
      {user && isPinVerified && (
        <div className={`px-4 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${isOnline ? (isSyncing ? 'bg-blue-500 text-white' : 'bg-green-600 text-white') : 'bg-gray-400 text-white'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-white opacity-50'}`} />
            {isOnline ? (isSyncing ? 'সিঙ্ক হচ্ছে...' : 'অনলাইন') : 'অফলাইন'}
          </div>
          <div>সবার খাতা</div>
        </div>
      )}

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
