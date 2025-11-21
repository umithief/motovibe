import React from 'react';
import { X, Trash2, ShoppingBag, CreditCard, ChevronRight, Minus, Plus } from 'lucide-react';
import { CartItem } from '../types';
import { Button } from './Button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onCheckout: () => Promise<void>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem,
  onCheckout
}) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckoutClick = async () => {
    onCheckout();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500" 
        onClick={onClose}
      ></div>
      
      <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
        <div className="w-full h-full flex flex-col bg-[#050505]/95 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] transform transition-transform duration-500 border-l border-white/10">
          
          {/* Cyber Header */}
          <div className="relative px-6 py-8 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-moto-accent to-transparent opacity-50"></div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-white tracking-wider italic">
                  SEPET <span className="text-moto-accent">DETAYI</span>
                </h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono mt-1">
                  System Status: Ready
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-300 group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Items Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-6">
                <div className="w-24 h-24 rounded-full border border-gray-800 flex items-center justify-center bg-white/5">
                    <ShoppingBag className="w-10 h-10 opacity-30" />
                </div>
                <div className="text-center">
                    <p className="text-xl font-display font-bold text-gray-400">SEPET BOŞ</p>
                    <p className="text-xs font-mono text-gray-600 mt-2">NO_ITEMS_DETECTED</p>
                </div>
                <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-400">
                    MAĞAZAYA DÖN
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div 
                    key={item.id} 
                    className="group relative flex gap-4 bg-gradient-to-r from-white/5 to-transparent p-4 border border-white/5 hover:border-moto-accent/30 transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-black overflow-hidden border border-white/10 relative flex-shrink-0">
                    <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                          <h3 className="text-sm font-bold text-white line-clamp-1 font-display tracking-wide">{item.name}</h3>
                          <button 
                            onClick={() => onRemoveItem(item.id)}
                            className="text-gray-600 hover:text-red-500 transition-colors ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                      <p className="text-[10px] text-moto-accent uppercase tracking-wider mt-1">{item.category}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-white/10 bg-black/40">
                        <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-mono text-white">{item.quantity}</span>
                        <button 
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-base font-bold text-white font-mono">₺{item.price.toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 bg-[#0a0a0a] border-t border-white/10 relative">
              {/* Decorative glowing line */}
              <div className="absolute top-0 left-0 w-full h-[1px] shadow-[0_0_10px_rgba(255,31,31,0.3)]"></div>
              
              <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-mono text-xs">SUBTOTAL</span>
                    <span className="text-gray-400">₺{total.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-mono text-xs">SHIPPING</span>
                    <span className="text-moto-accent text-xs uppercase">Free Cargo</span>
                  </div>
                  <div className="h-[1px] bg-white/10 my-2"></div>
                  <div className="flex justify-between items-end">
                    <span className="text-white font-display text-lg tracking-wider">TOPLAM</span>
                    <span className="text-2xl font-bold text-white font-mono text-moto-accent text-shadow-sm">
                        ₺{total.toLocaleString('tr-TR')}
                    </span>
                  </div>
              </div>

              <Button 
                variant="primary" 
                className="w-full py-4 text-lg group" 
                onClick={handleCheckoutClick}
              >
                <span className="flex items-center gap-2">
                    SİPARİŞİ TAMAMLA 
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              
              <div className="mt-4 flex justify-center items-center gap-2 text-[10px] text-gray-600 font-mono uppercase">
                <CreditCard className="w-3 h-3" />
                Secure Encrypted Transaction
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};