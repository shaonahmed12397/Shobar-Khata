
import React, { useRef } from 'react';
import { AppState } from '../types';
import { TRANSLATIONS } from '../constants';

interface SettingsViewProps {
  state: AppState;
  onRestore: (data: AppState) => void;
  onClear: () => void;
  onLock: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ state, onRestore, onClear, onLock }) => {
  const t = TRANSLATIONS.bn;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `sobar_khata_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as AppState;
        
        // Basic validation
        if (data.customers && data.transactions) {
          if (confirm('আপনি কি নিশ্চিতভাবে এই ব্যাকআপ ফাইলটি রিস্টোর করতে চান? বর্তমান সকল তথ্য মুছে যাবে।')) {
            onRestore(data);
            alert('সফলভাবে রিস্টোর করা হয়েছে!');
          }
        } else {
          alert('ভুল ফাইল ফরম্যাট! দয়া করে সঠিক ব্যাকআপ ফাইল সিলেক্ট করুন।');
        }
      } catch (err) {
        alert('ফাইলটি পড়তে সমস্যা হয়েছে।');
      }
    };
    fileReader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold text-gray-800">সেটিংস ও ব্যাকআপ</h2>

      <div className="space-y-4">
        {/* Backup Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3 text-[#006A4E]">
            <div className="p-2 bg-green-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </div>
            <h3 className="font-bold text-lg">ডাটা ব্যাকআপ</h3>
          </div>
          <p className="text-sm text-gray-500">আপনার সকল কাস্টমার এবং লেনদেনের তথ্য একটি ফাইল হিসেবে সেভ করে রাখুন। ফোন হারিয়ে গেলে বা ব্রাউজার ডাটা মুছে গেলে এটি কাজে লাগবে।</p>
          <button 
            onClick={handleBackup}
            className="w-full py-4 bg-[#006A4E] text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            ব্যাকআপ ফাইল ডাউনলোড করুন
          </button>
        </div>

        {/* Restore Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="p-2 bg-blue-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 className="font-bold text-lg">ডাটা রিস্টোর</h3>
          </div>
          <p className="text-sm text-gray-500">আগে সেভ করা ব্যাকআপ ফাইল থেকে ডাটা ফিরিয়ে আনুন। মনে রাখবেন, এটি করলে বর্তমান তথ্যগুলো মুছে যাবে।</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleRestore} 
            className="hidden" 
            accept=".json"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            ব্যাকআপ ফাইল আপলোড করুন
          </button>
        </div>

        {/* PIN Security Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3 text-purple-600">
            <div className="p-2 bg-purple-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg">নিরাপত্তা (PIN)</h3>
          </div>
          <p className="text-sm text-gray-500">অ্যাপের নিরাপত্তা নিশ্চিত করতে পিন কোড পরিবর্তন করুন অথবা অ্যাপটি এখনই লক করুন।</p>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                if (confirm('আপনি কি পিন কোড পরিবর্তন করতে চান?')) {
                  localStorage.removeItem('sobar_khata_pin');
                  onLock();
                }
              }}
              className="py-3 bg-purple-50 text-purple-700 rounded-2xl font-bold border border-purple-100 active:scale-95 transition-all"
            >
              পিন পরিবর্তন
            </button>
            <button 
              onClick={onLock}
              className="py-3 bg-gray-50 text-gray-700 rounded-2xl font-bold border border-gray-100 active:scale-95 transition-all"
            >
              এখনই লক করুন
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <div className="p-2 bg-red-100 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="font-bold text-lg">সব ডাটা মুছুন</h3>
          </div>
          <p className="text-sm text-red-700/70">সতর্কবার্তা: এটি করলে আপনার সকল কাস্টমার এবং লেনদেনের তথ্য চিরতরে মুছে যাবে। এটি আর ফিরিয়ে আনা সম্ভব নয়।</p>
          <button 
            onClick={() => {
              if (confirm('আপনি কি নিশ্চিতভাবে সকল ডাটা মুছতে চান? এটি আর ফিরিয়ে আনা সম্ভব নয়!')) {
                onClear();
                alert('সকল ডাটা মুছে ফেলা হয়েছে।');
              }
            }}
            className="w-full py-4 bg-white text-red-600 border-2 border-red-200 rounded-2xl font-bold active:scale-95 transition-all"
          >
            সব তথ্য মুছে ফেলুন
          </button>
        </div>
      </div>

      <div className="pt-10 text-center space-y-2">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">সবার খাতা v1.0.0</p>
        <p className="text-[10px] text-gray-300">সম্পূর্ণ অফলাইন এবং নিরাপদ</p>
      </div>
    </div>
  );
};

export default SettingsView;
