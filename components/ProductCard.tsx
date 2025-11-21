import React, { useState } from 'react';
import { Star, Heart, ImageOff, Check, Eye, ShoppingBag, Zap } from 'lucide-react';
import { Product } from '../types';
import { Button } from './Button';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick, onQuickView, isFavorite = false, onToggleFavorite }) => {
  const [imgError, setImgError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdded) return;

    setIsAdded(true);
    onAddToCart(product);

    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
        onQuickView(product);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onToggleFavorite) {
          onToggleFavorite(product);
      }
  };

  return (
    <div 
      onClick={() => onClick(product)}
      className="group relative bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden transition-all duration-500 hover:border-moto-accent/50 hover:shadow-[0_0_30px_rgba(255,31,31,0.15)] hover:-translate-y-1 cursor-pointer flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="relative aspect-[4/5] overflow-hidden bg-black">
        {!imgError ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-50"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-gray-600">
            <ImageOff className="w-12 h-12 mb-2" />
            <span className="text-xs uppercase tracking-widest">Görsel Yok</span>
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2 z-20">
           <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-moto-accent fill-moto-accent" />
              {product.category}
           </div>
        </div>

        {/* Wishlist Button */}
        <button 
            onClick={handleLike}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-moto-accent hover:border-moto-accent transition-all duration-300 group/heart"
        >
            <Heart className={`w-4 h-4 transition-transform group-active/heart:scale-75 ${isFavorite ? 'fill-moto-accent text-moto-accent' : 'group-hover/heart:text-white'}`} />
        </button>

        {/* Quick View Button (Centered on Hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-none">
            <button 
                onClick={handleQuickView}
                className="pointer-events-auto transform translate-y-4 group-hover:translate-y-0 group-hover:scale-105 transition-all duration-300 bg-white/90 backdrop-blur-md text-black font-display font-bold py-3 px-8 rounded-full flex items-center gap-2 hover:bg-moto-accent hover:text-white shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/20"
            >
                <Eye className="w-4 h-4" /> HIZLI BAKIŞ
            </button>
        </div>

        {/* Rating Badge (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1 border border-white/10">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-white font-mono">{product.rating}</span>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-4 flex flex-col flex-1 relative bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
        <div className="flex-1">
            <h3 className="text-lg font-display font-bold text-white leading-tight mb-1 line-clamp-2 group-hover:text-moto-accent transition-colors">
                {product.name}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1 mb-3">{product.features[0]}</p>
        </div>
        
        <div className="flex items-end justify-between mt-2 border-t border-white/5 pt-3">
           <div>
               <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">FİYAT</p>
               <span className="text-xl font-mono font-bold text-white">₺{product.price.toLocaleString('tr-TR')}</span>
           </div>
           
           <Button 
                variant={isAdded ? "secondary" : "cyber"} 
                size="sm"
                className={`transition-all duration-300 ${
                  isAdded 
                    ? '!bg-green-600 !text-white !border-green-600 shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                    : ''
                }`} 
                onClick={handleAddToCart}
                disabled={isAdded}
             >
                {isAdded ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                  </span>
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
             </Button>
        </div>
      </div>
    </div>
  );
};