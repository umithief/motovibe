import React, { useEffect, useState } from 'react';
import { ArrowLeft, Star, Shield, Zap, Check, Truck, Share2 } from 'lucide-react';
import { Product } from '../types';
import { Button } from './Button';
import { statsService } from '../services/statsService';
import { authService } from '../services/auth';
import { ProductCard } from './ProductCard';

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, allProducts, onBack, onAddToCart, onProductClick }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    // Ürün değiştiğinde seçili resmi sıfırla
    setActiveImageIndex(0);

    // Component mount olduğunda görüntülemeyi kaydet
    const trackView = async () => {
        const user = await authService.getCurrentUser();
        statsService.trackEvent('view_product', {
            productId: product.id,
            productName: product.name,
            userId: user?.id,
            userName: user?.name
        });
    };
    trackView();
  }, [product.id]);

  // Benzer Ürünleri Bul (Aynı kategori, kendisi hariç)
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Galeri (Gerçek resimler yoksa veya boşsa ana resmi kullan)
  const galleryImages = (product.images && product.images.length > 0) 
      ? product.images 
      : [product.image, product.image, product.image, product.image];

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <Button variant="ghost" onClick={onBack} className="mb-8 pl-0 hover:bg-transparent hover:text-moto-accent group">
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        MAĞAZAYA DÖN
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
        {/* Left Column: Image & Gallery */}
        <div className="relative">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a] group">
            <img 
              src={galleryImages[activeImageIndex]} 
              alt={product.name} 
              className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
            
            {/* Cyber Overlay Elements */}
            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded flex items-center gap-2">
                <Zap className="w-4 h-4 text-moto-accent" />
                <span className="text-xs font-mono text-white tracking-widest">AI_VERIFIED</span>
            </div>
          </div>
          
          {/* Interactive Thumbnails */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            {galleryImages.map((img, i) => (
              <div 
                key={i} 
                onClick={() => setActiveImageIndex(i)}
                className={`aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-300 ${
                    activeImageIndex === i 
                    ? 'border-moto-accent ring-2 ring-moto-accent/20 shadow-[0_0_15px_rgba(255,31,31,0.3)]' 
                    : 'border-white/10 hover:border-white/40 opacity-60 hover:opacity-100'
                } bg-gray-900`}
              >
                <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-moto-accent/10 border border-moto-accent/20 text-moto-accent text-xs font-bold uppercase tracking-widest rounded-full">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-white font-bold text-sm">{product.rating}</span>
              <span className="text-gray-500 text-xs ml-1">(124 Değerlendirme)</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
            {product.name}
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed mb-8 border-l-2 border-moto-accent pl-6">
            {product.description}
          </p>

          <div className="flex items-end gap-4 mb-8">
            <div className="text-4xl font-mono font-bold text-white">
              ₺{product.price.toLocaleString('tr-TR')}
            </div>
            <div className="text-gray-500 line-through mb-2 text-lg">
              ₺{(product.price * 1.2).toLocaleString('tr-TR')}
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
              <Shield className="w-6 h-6 text-gray-400" />
              <div>
                <h4 className="text-white text-sm font-bold">Orijinal Ürün Garantisi</h4>
                <p className="text-gray-500 text-xs">Resmi distribütör garantili</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4 text-moto-accent" /> Teknik Özellikler
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300 text-sm">
                    <div className="w-1.5 h-1.5 bg-moto-accent rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" size="lg" className="flex-1" onClick={() => onAddToCart(product)}>
              SEPETE EKLE
            </Button>
            <Button variant="outline" size="lg" className="sm:w-auto border-gray-700 text-gray-400 hover:text-white hover:border-white">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-mono">
            <Truck className="w-4 h-4" />
            <span>24 Saatte Kargoda</span>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-white/10 pt-16">
            <h3 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-2">
                BUNLARI DA <span className="text-moto-accent">BEĞENEBİLİRSİN</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(rp => (
                    <ProductCard 
                        key={rp.id} 
                        product={rp} 
                        onAddToCart={onAddToCart} 
                        onClick={onProductClick} 
                    />
                ))}
            </div>
        </div>
      )}
    </div>
  );
};