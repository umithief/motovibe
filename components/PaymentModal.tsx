import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock, Check, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { delay } from '../services/db';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onPaymentComplete: () => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onPaymentComplete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cardData, setCardData] = useState({
    holderName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsLoading(false);
      setCardData({ holderName: '', cardNumber: '', expiry: '', cvv: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    } else if (name === 'holderName') {
        formattedValue = value.toUpperCase();
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Ödeme işlemi simülasyonu
    await delay(2000);
    
    setIsSuccess(true);
    
    // Biraz bekle ve işlemi tamamla
    await delay(2000);
    await onPaymentComplete();
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm"></div>
        </div>

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>

        <div className="inline-block align-bottom bg-gray-900 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-800 relative">
          
          {!isSuccess && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white z-10"
            >
              <X className="w-6 h-6" />
            </button>
          )}

          {isSuccess ? (
            <div className="p-10 flex flex-col items-center justify-center text-center min-h-[450px] relative overflow-hidden">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>

              {/* Animation Container */}
              <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                 {/* Ripple Effect */}
                 <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 duration-1000"></div>
                 <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 duration-1000 delay-300"></div>
                 
                 {/* Main Circle */}
                 <div className="relative w-full h-full bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-[0_0_30px_rgba(34,197,94,0.6)]">
                    <Check className="w-12 h-12 text-white animate-in fade-in duration-500 delay-150" strokeWidth={4} />
                 </div>

                 {/* Sparkles */}
                 <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce delay-100" />
                 <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-white animate-bounce delay-300" />
              </div>

              <h3 className="text-3xl font-display font-bold text-white mb-2 animate-in slide-in-from-bottom-4 duration-500 delay-200">Ödeme Başarılı!</h3>
              <p className="text-gray-400 animate-in slide-in-from-bottom-4 duration-500 delay-300">Siparişiniz alındı. Yönlendiriliyorsunuz...</p>
              
              <div className="mt-8 w-full bg-gray-800 rounded-full h-1 overflow-hidden max-w-[200px]">
                 <div className="h-full bg-green-500 animate-[progress_2s_ease-in-out]"></div>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-moto-accent" />
                Ödeme Bilgileri
              </h2>

              {/* Visual Card Preview */}
              <div className="mb-8 relative w-full h-56 bg-gradient-to-br from-gray-800 to-black rounded-xl border border-gray-700 shadow-2xl overflow-hidden p-6 flex flex-col justify-between select-none transform transition-transform hover:scale-[1.02]">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-moto-accent/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                
                <div className="flex justify-between items-start z-10">
                    <div className="w-12 h-8 bg-yellow-600/80 rounded flex items-center justify-center overflow-hidden relative">
                        <div className="absolute inset-0 border-[0.5px] border-black/20 grid grid-cols-2"></div>
                    </div>
                    <div className="text-white/80 font-bold italic text-lg">BANK</div>
                </div>

                <div className="z-10">
                    <div className="text-gray-400 text-xs mb-1 uppercase tracking-widest">Card Number</div>
                    <div className="text-white text-2xl font-mono tracking-widest shadow-black drop-shadow-md">
                        {cardData.cardNumber || '•••• •••• •••• ••••'}
                    </div>
                </div>

                <div className="flex justify-between items-end z-10">
                    <div>
                        <div className="text-gray-400 text-xs mb-1 uppercase tracking-widest">Card Holder</div>
                        <div className="text-white font-medium uppercase tracking-wide truncate max-w-[180px]">
                            {cardData.holderName || 'AD SOYAD'}
                        </div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-xs mb-1 uppercase tracking-widest">Expires</div>
                        <div className="text-white font-mono font-bold">
                            {cardData.expiry || 'AA/YY'}
                        </div>
                    </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Kart Üzerindeki İsim</label>
                  <input
                    type="text"
                    name="holderName"
                    value={cardData.holderName}
                    onChange={handleChange}
                    placeholder="Ad Soyad"
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-moto-accent focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Kart Numarası</label>
                  <div className="relative">
                    <input
                        type="text"
                        name="cardNumber"
                        value={cardData.cardNumber}
                        onChange={handleChange}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        required
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-moto-accent focus:border-transparent outline-none transition-all font-mono"
                    />
                    <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Son Kullanma (AA/YY)</label>
                    <input
                        type="text"
                        name="expiry"
                        value={cardData.expiry}
                        onChange={handleChange}
                        placeholder="AA/YY"
                        maxLength={5}
                        required
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-moto-accent focus:border-transparent outline-none transition-all font-mono text-center"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-400 uppercase mb-1">CVV / CVC</label>
                    <div className="relative">
                        <input
                            type="password"
                            name="cvv"
                            value={cardData.cvv}
                            onChange={handleChange}
                            placeholder="***"
                            maxLength={3}
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-moto-accent focus:border-transparent outline-none transition-all font-mono text-center"
                        />
                        <Lock className="absolute right-3 top-3.5 w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                    <div className="flex justify-between items-center mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-800">
                        <span className="text-gray-400">Toplam Tutar</span>
                        <span className="text-2xl font-bold text-white">₺{totalAmount.toLocaleString('tr-TR')}</span>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full py-4 text-lg shadow-lg shadow-moto-accent/20"
                        isLoading={isLoading}
                    >
                        {isLoading ? 'Ödeme İşleniyor...' : `₺${totalAmount.toLocaleString('tr-TR')} Öde`}
                    </Button>
                    
                    <p className="text-center text-[10px] text-gray-500 mt-4 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        Ödemeniz 256-bit SSL sertifikası ile korunmaktadır.
                    </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};