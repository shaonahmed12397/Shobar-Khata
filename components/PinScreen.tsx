
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Delete, ChevronLeft } from 'lucide-react';
import { COLORS, TRANSLATIONS } from '../constants';

interface PinScreenProps {
  onUnlock: () => void;
}

const PinScreen: React.FC<PinScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState<string>('');
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [mode, setMode] = useState<'enter' | 'set' | 'confirm'>('enter');
  const [tempPin, setTempPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const t = TRANSLATIONS.bn;

  useEffect(() => {
    const savedPin = localStorage.getItem('sobar_khata_pin');
    if (savedPin) {
      setStoredPin(savedPin);
      setMode('enter');
    } else {
      setMode('set');
    }
  }, []);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(null);

      if (newPin.length === 4) {
        // Auto-submit when 4 digits are entered
        setTimeout(() => processPin(newPin), 300);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const processPin = (enteredPin: string) => {
    if (mode === 'enter') {
      if (enteredPin === storedPin) {
        onUnlock();
      } else {
        triggerError('ভুল পিন, আবার চেষ্টা করুন');
      }
    } else if (mode === 'set') {
      setTempPin(enteredPin);
      setPin('');
      setMode('confirm');
    } else if (mode === 'confirm') {
      if (enteredPin === tempPin) {
        localStorage.setItem('sobar_khata_pin', enteredPin);
        setStoredPin(enteredPin);
        onUnlock();
      } else {
        triggerError('পিন মেলেনি, আবার চেষ্টা করুন');
        setMode('set');
        setTempPin('');
      }
    }
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setIsShaking(true);
    setPin('');
    setTimeout(() => setIsShaking(false), 500);
  };

  const getTitle = () => {
    if (mode === 'enter') return 'পিন কোড দিন';
    if (mode === 'set') return 'নতুন পিন সেট করুন';
    return 'পিন নিশ্চিত করুন';
  };

  const getSubtitle = () => {
    if (mode === 'enter') return 'অ্যাপে প্রবেশ করতে ৪ ডিজিটের পিন দিন';
    if (mode === 'set') return 'নিরাপত্তার জন্য ৪ ডিজিটের পিন সেট করুন';
    return 'আবারও একই পিন দিন';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs flex flex-col items-center"
      >
        <div className="mb-8 p-4 bg-green-50 rounded-full">
          {mode === 'enter' ? (
            <Lock className="w-10 h-10 text-[#006A4E]" />
          ) : (
            <Unlock className="w-10 h-10 text-[#006A4E]" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">{getTitle()}</h1>
        <p className="text-gray-500 text-center mb-10">{getSubtitle()}</p>

        {/* PIN Dots */}
        <motion.div 
          animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-4 mb-12"
        >
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                pin.length > i 
                  ? 'bg-[#006A4E] border-[#006A4E] scale-110' 
                  : 'border-gray-300'
              }`}
            />
          ))}
        </motion.div>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm mb-6 font-medium"
          >
            {error}
          </motion.p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="w-full aspect-square rounded-full flex items-center justify-center text-2xl font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              {num}
            </button>
          ))}
          <div className="w-full aspect-square" />
          <button
            onClick={() => handleNumberClick('0')}
            className="w-full aspect-square rounded-full flex items-center justify-center text-2xl font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-full aspect-square rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PinScreen;
