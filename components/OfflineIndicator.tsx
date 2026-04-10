
import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {(showStatus || !isOnline) && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[110] px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold ${
            isOnline ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>আপনি এখন অনলাইনে আছেন</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>আপনি অফলাইনে আছেন (ডাটা সেভ হচ্ছে)</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
