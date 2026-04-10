
import React, { useState, useEffect } from 'react';

interface PinEntryProps {
  correctPin: string | null;
  onSuccess: (pin: string) => void;
  onLogout: () => void;
}

const PinEntry: React.FC<PinEntryProps> = ({ correctPin, onSuccess, onLogout }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(!correctPin);
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'setup' | 'confirm'>('enter');

  useEffect(() => {
    if (!correctPin) {
      setStep('setup');
    }
  }, [correctPin]);

  const handleNumberClick = (num: string) => {
    if (error) setError(false);
    
    if (step === 'enter' || step === 'setup') {
      if (pin.length < 4) {
        const newPin = pin + num;
        setPin(newPin);
        
        if (newPin.length === 4) {
          if (step === 'enter') {
            if (newPin === correctPin) {
              onSuccess(newPin);
            } else {
              setError(true);
              setTimeout(() => setPin(''), 500);
            }
          } else {
            // Setup step
            setTimeout(() => {
              setStep('confirm');
            }, 300);
          }
        }
      }
    } else if (step === 'confirm') {
      if (confirmPin.length < 4) {
        const newConfirm = confirmPin + num;
        setConfirmPin(newConfirm);
        
        if (newConfirm.length === 4) {
          if (newConfirm === pin) {
            onSuccess(newConfirm);
          } else {
            setError(true);
            setTimeout(() => {
              setConfirmPin('');
              setPin('');
              setStep('setup');
              setError(false);
            }, 1000);
          }
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 'confirm') {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const getTitle = () => {
    if (step === 'enter') return 'পিন কোড দিন';
    if (step === 'setup') return 'নতুন পিন সেট করুন';
    if (step === 'confirm') return 'পিনটি পুনরায় দিন';
    return '';
  };

  const getSubtitle = () => {
    if (step === 'enter') return 'অ্যাপে প্রবেশ করতে ৪ ডিজিটের পিন দিন';
    if (step === 'setup') return 'নিরাপত্তার জন্য ৪ ডিজিটের একটি পিন দিন';
    if (step === 'confirm') return 'নিশ্চিত করতে পিনটি আবার টাইপ করুন';
    return '';
  };

  const currentDisplayPin = step === 'confirm' ? confirmPin : pin;

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-xs flex flex-col items-center space-y-8">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#006A4E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{getTitle()}</h2>
          <p className="text-gray-500 text-sm">{getSubtitle()}</p>
        </div>

        {/* PIN Dots */}
        <div className={`flex gap-4 justify-center py-4 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                currentDisplayPin.length > i 
                  ? 'bg-[#006A4E] border-[#006A4E] scale-110' 
                  : 'border-gray-200'
              } ${error ? 'bg-red-500 border-red-500' : ''}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-xs font-bold animate-in fade-in">
            {step === 'confirm' ? 'পিন মেলেনি! আবার চেষ্টা করুন' : 'ভুল পিন! আবার চেষ্টা করুন'}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full pt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="h-16 w-16 rounded-full bg-gray-50 text-2xl font-bold text-gray-700 active:bg-gray-200 active:scale-95 transition-all flex items-center justify-center mx-auto"
            >
              {num}
            </button>
          ))}
          <button 
            onClick={onLogout}
            className="h-16 w-16 rounded-full text-xs font-bold text-red-500 active:bg-red-50 transition-all flex items-center justify-center mx-auto"
          >
            লগআউট
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            className="h-16 w-16 rounded-full bg-gray-50 text-2xl font-bold text-gray-700 active:bg-gray-200 active:scale-95 transition-all flex items-center justify-center mx-auto"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 w-16 rounded-full text-gray-400 active:text-gray-600 transition-all flex items-center justify-center mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default PinEntry;
