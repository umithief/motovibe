
import React from 'react';
import { X, Star, Shield, Check, ArrowRight, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { Button } from './Button';

interface ProductQuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  onViewDetail
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop */}
        <div 
            className="fixed inset-0 transition-opacity cursor-pointer" 
            onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm"></div>
        </div>

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>

        {/* Modal Panel */}
        <div className="inline-block align-bottom bg-[#0f0f0f] border border-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full relative animate-in fade-in zoom-in-95 duration-300">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/50 backdrop-blur rounded-full text-gray-400 hover:text-white hover:bg-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
            {/* Image Section */}
            <div className="w-full md:w-1/2 relative bg-black flex-shrink-0">
                <div className="aspect-[4/3] md:aspect-auto md:h-full relative group h-full">
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0f0f0f]"></div>
                    
                    <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 bg-moto-accent text-white text-xs font-bold uppercase tracking-widest rounded-sm shadow-lg">
                            {product.category}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
                <div className="mb-auto">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="ml-1 text-sm font-bold text-white">{product.rating}</span>
                        </div>
                        <span className="text-gray-500 text-xs">• Stokta Var</span>
                        <span className="text-gray-500 text-xs">• Hızlı Kargo</span>
                    </div>

                    <h2 className="text-3xl font-display font-bold text-white mb-4 leading-tight">
                        {product.name}
                    </h2>

                    <p className="text-gray-400 text-sm leading-relaxed mb-6 border-l-2 border-gray-700 pl-4">
                        {product.description}
                    </p>
                    
                    <div className="space-y-3 mb-8">
                        {product.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                                <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-moto-accent border border-white/10">
                                    <Check className="w-3 h-3" />
                                </div>
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="flex items-end gap-3 mb-6">
                        <span className="text-3xl font-mono font-bold text-white">₺{product.price.toLocaleString('tr-TR')}</span>
                        {/* Fake discount for visual appeal */}
                        <span className="text-gray-500 line-through mb-1 text-sm">₺{(product.price * 1.15).toLocaleString('tr-TR', {maximumFractionDigits: 0})}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                            variant="primary" 
                            className="flex-1 py-3 justify-center"
                            onClick={() => {
                                onAddToCart(product);
                                onClose();
                            }}
                        >
                            <ShoppingBag className="w-4 h-4 mr-2" /> SEPETE EKLE
                        </Button>
                        <Button 
                            variant="outline" 
                            className="flex-1 py-3 border-gray-700 hover:border-white justify-center"
                            onClick={() => {
                                onViewDetail(product);
                                onClose();
                            }}
                        >
                            DETAYLAR <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest">
                        <Shield className="w-3 h-3" />
                        <span>Güvenli Alışveriş</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
