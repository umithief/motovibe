import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Button } from './Button';
import { ViewState, Slide } from '../types';
import { sliderService } from '../services/sliderService';
import { DEFAULT_SLIDES } from '../constants';

interface HeroProps {
  onNavigate: (view: ViewState) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    const loadSlides = async () => {
        try {
            const data = await sliderService.getSlides();
            if (data && data.length > 0) {
                setSlides(data);
            }
        } catch (error) {
            console.error("Slider error", error);
        }
    };
    loadSlides();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setIsAutoPlay(false);
  };

  const handleNextClick = () => {
    nextSlide();
    setIsAutoPlay(false);
  };

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide, isAutoPlay]);

  return (
    <div className="relative h-[90vh] md:h-screen w-full overflow-hidden bg-black group">
      
      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>

      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-[-1]'
          }`}
        >
          {/* Background Image with Ken Burns Effect */}
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src={slide.image} 
              alt={slide.title}
              className={`w-full h-full object-cover object-center transition-transform duration-[10000ms] ease-linear ${
                  index === currentSlide ? 'scale-110' : 'scale-100'
              }`} 
            />
            {/* Advanced Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Content Container */}
          <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex items-center">
            <div className="max-w-4xl relative">
              
              {/* Ghost Typography (Background Text) */}
              <div className={`absolute -top-20 -left-10 md:-left-20 text-[120px] md:text-[200px] font-display font-bold text-transparent opacity-10 pointer-events-none select-none leading-none tracking-tighter transform transition-all duration-1000 delay-100 ${
                  index === currentSlide ? 'translate-x-0 opacity-10' : '-translate-x-20 opacity-0'
              }`}
              style={{ WebkitTextStroke: '2px rgba(255,255,255,0.5)' }}>
                {slide.title.split(' ')[0]}
              </div>

              {/* Main Content */}
              <div className="relative">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 transform transition-all duration-700 delay-300 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <span className="w-2 h-2 rounded-full bg-moto-accent animate-pulse"></span>
                    <span className="text-moto-accent font-bold tracking-[0.2em] text-xs">MOTOVIBE COLLECTION</span>
                  </div>
                  
                  <h1 className={`text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white tracking-tighter leading-[0.9] mb-6 transform transition-all duration-1000 delay-100 ${
                    index === currentSlide ? 'translate-x-0 opacity-100 blur-0' : '-translate-x-10 opacity-0 blur-sm'
                  }`}>
                    {slide.title}
                    <span className="text-moto-accent">.</span>
                  </h1>

                  <div className={`max-w-xl p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md transform transition-all duration-1000 delay-500 ${
                     index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                    <p className="text-gray-300 text-lg font-light leading-relaxed border-l-2 border-moto-accent pl-4">
                        {slide.subtitle}
                    </p>
                  </div>

                  <div className={`mt-8 flex items-center gap-4 transform transition-all duration-1000 delay-700 ${
                     index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}>
                    <Button variant="primary" size="lg" onClick={() => onNavigate(slide.action)} className="shadow-[0_0_30px_rgba(255,31,31,0.4)]">
                      {slide.cta} <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    
                    <button onClick={() => onNavigate('about')} className="hidden sm:flex items-center justify-center w-14 h-14 rounded-full border border-white/20 hover:bg-white/10 hover:border-white text-white transition-all">
                         <Zap className="w-6 h-6" />
                    </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons (Visible on Hover) */}
      <div className="absolute inset-y-0 left-0 z-30 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
         <button 
            onClick={prevSlide}
            className="w-12 h-12 rounded-full bg-black/50 border border-white/10 text-white backdrop-blur-sm flex items-center justify-center hover:bg-moto-accent hover:border-moto-accent hover:scale-110 transition-all"
         >
            <ChevronLeft className="w-6 h-6" />
         </button>
      </div>
      <div className="absolute inset-y-0 right-0 z-30 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
         <button 
            onClick={handleNextClick}
            className="w-12 h-12 rounded-full bg-black/50 border border-white/10 text-white backdrop-blur-sm flex items-center justify-center hover:bg-moto-accent hover:border-moto-accent hover:scale-110 transition-all"
         >
            <ChevronRight className="w-6 h-6" />
         </button>
      </div>

      {/* Modern Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full z-30 border-t border-white/5 bg-black/40 backdrop-blur-md h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
            
            {/* Slide Indicators */}
            <div className="flex gap-0.5 h-1 w-full max-w-md relative bg-gray-800 rounded-full overflow-hidden">
                 {slides.map((_, index) => (
                    <div 
                        key={index} 
                        className={`h-full flex-1 transition-all duration-500 ${index < currentSlide ? 'bg-white' : 'bg-transparent'}`}
                    ></div>
                 ))}
                 <div 
                    className="absolute top-0 h-full bg-moto-accent transition-all duration-500 ease-out"
                    style={{ 
                        left: `${(currentSlide / slides.length) * 100}%`, 
                        width: `${100 / slides.length}%` 
                    }}
                 >
                    {/* Animated Glow */}
                    <div className="absolute inset-0 bg-white/50 animate-pulse"></div>
                 </div>
            </div>

            {/* Counter */}
            <div className="flex items-center gap-4 font-mono text-sm ml-8">
                <span className="text-moto-accent font-bold text-xl">0{currentSlide + 1}</span>
                <span className="h-px w-8 bg-gray-600"></span>
                <span className="text-gray-500">0{slides.length}</span>
            </div>
        </div>
      </div>
      
    </div>
  );
};