import React from 'react';
import { Zap, Shield, Cpu, Users, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { ViewState } from '../types';

interface AboutProps {
  onNavigate: (view: ViewState) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      
      {/* Hero Text */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-moto-accent/30 bg-moto-accent/10 text-moto-accent text-xs font-bold uppercase tracking-widest mb-6 rounded-full">
            <Cpu className="w-3 h-3" /> MotoVibe Corp.
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tight leading-none">
          GELECEĞİN <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">SÜRÜŞ DENEYİMİ</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Sadece aksesuar satmıyoruz; motosiklet kültürünü yapay zeka ve modern teknolojiyle yeniden tanımlıyoruz.
        </p>
      </div>

      {/* Visual Section */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a] mb-20 group">
        <div className="aspect-video md:aspect-[21/9]">
          <img 
            src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2000&auto=format&fit=crop" 
            alt="MotoVibe Workshop" 
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-2">
             <div className="h-[1px] w-12 bg-moto-accent"></div>
             <span className="text-white font-mono text-xs uppercase tracking-widest">Est. 2024</span>
          </div>
          <h3 className="text-3xl font-display font-bold text-white">TUTKU VE TEKNOLOJİ</h3>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-moto-accent/50 transition-colors group">
          <div className="w-12 h-12 bg-black border border-white/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-moto-accent group-hover:text-white transition-colors">
            <Zap className="w-6 h-6 text-moto-accent group-hover:text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3 font-display">AI Destekli Seçim</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Gelişmiş algoritmalarımız, sürüş tarzınızı analiz ederek size en uygun ekipmanı saniyeler içinde önerir. Hata payını sıfıra indiriyoruz.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-moto-accent/50 transition-colors group">
          <div className="w-12 h-12 bg-black border border-white/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-moto-accent group-hover:text-white transition-colors">
            <Shield className="w-6 h-6 text-moto-accent group-hover:text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3 font-display">Premium Güvenlik</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Kataloğumuzdaki her ürün, uluslararası güvenlik standartlarını (ECE, DOT, Snell) karşılayan markalardan özenle seçilmiştir.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-moto-accent/50 transition-colors group">
          <div className="w-12 h-12 bg-black border border-white/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-moto-accent group-hover:text-white transition-colors">
            <Users className="w-6 h-6 text-moto-accent group-hover:text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3 font-display">Global Topluluk</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Sadece bir mağaza değil, motosiklet tutkunlarının buluşma noktasıyız. Deneyimlerinizi paylaşıyor ve birlikte büyüyoruz.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="border-y border-white/10 py-12 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-display font-bold text-white mb-2">15K+</div>
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Mutlu Sürücü</div>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-white mb-2">1.2K</div>
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Premium Ürün</div>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-white mb-2">24/7</div>
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">AI Desteği</div>
          </div>
          <div>
            <div className="text-4xl font-display font-bold text-white mb-2">%100</div>
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Güvenli</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-white mb-6">YOLCULUĞA KATILMAYA HAZIR MISIN?</h2>
        <Button variant="primary" size="lg" onClick={() => onNavigate('shop')}>
          EKİPMANLARI KEŞFET <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};