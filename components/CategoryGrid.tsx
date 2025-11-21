import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { ProductCategory } from '../types';

interface CategoryGridProps {
  onCategorySelect: (category: ProductCategory) => void;
}

const CATEGORIES = [
  {
    id: ProductCategory.HELMET,
    name: 'KASKLAR',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop',
    desc: 'Güvenlik ve Performans'
  },
  {
    id: ProductCategory.JACKET,
    name: 'MONTLAR',
    image: 'https://images.unsplash.com/photo-1559582930-bb01987cf4dd?q=80&w=800&auto=format&fit=crop',
    desc: 'Tarz ve Koruma'
  },
  {
    id: ProductCategory.GLOVES,
    name: 'ELDİVENLER',
    image: 'https://images.unsplash.com/photo-1555481771-16417c6f656c?q=80&w=800&auto=format&fit=crop',
    desc: 'Tam Kontrol'
  },
  {
    id: ProductCategory.ACCESSORY,
    name: 'AKSESUARLAR',
    image: 'https://images.unsplash.com/photo-1589210094065-a19f47447548?q=80&w=800&auto=format&fit=crop',
    desc: 'Bakım ve Donanım'
  }
];

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategorySelect }) => {
  return (
    <section className="py-10 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-moto-accent/50 transition-all duration-500"
            >
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-center gap-2 mb-1 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <Zap className="w-3 h-3 text-moto-accent" />
                  <span className="text-[10px] text-moto-accent font-bold uppercase tracking-widest">{cat.desc}</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-moto-accent transition-colors">{cat.name}</h3>
                <div className="h-0.5 w-0 bg-moto-accent group-hover:w-full transition-all duration-500"></div>
              </div>

              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rotate-45 group-hover:rotate-0">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};