import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, Zap, Search, Sparkles, X, User as UserIcon, LogOut, Heart } from 'lucide-react';
import { ViewState, User } from '../types';

interface NavbarProps {
  cartCount: number;
  favoritesCount: number;
  onCartClick: () => void;
  onFavoritesClick: () => void;
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
  onSearch: (query: string) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  favoritesCount,
  onCartClick, 
  onFavoritesClick,
  onNavigate, 
  currentView, 
  onSearch,
  user,
  onOpenAuth,
  onLogout
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Cart Animation State
  const [animateCart, setAnimateCart] = useState(false);
  const prevCartCountRef = useRef(cartCount);

  // Favorites Animation State
  const [animateFav, setAnimateFav] = useState(false);
  const prevFavCountRef = useRef(favoritesCount);

  useEffect(() => {
    const handleScroll = () => {
      // 50px'i geçince daha yumuşak bir geçiş başlasın
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger animation when cart count increases
  useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
        setAnimateCart(true);
        const timer = setTimeout(() => setAnimateCart(false), 400);
        return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  // Trigger animation when favorites count increases
  useEffect(() => {
    if (favoritesCount > prevFavCountRef.current) {
        setAnimateFav(true);
        const timer = setTimeout(() => setAnimateFav(false), 400);
        return () => clearTimeout(timer);
    }
    prevFavCountRef.current = favoritesCount;
  }, [favoritesCount]);

  if (currentView === 'admin_panel') return null;

  return (
    <nav 
      className={`fixed z-50 left-0 right-0 flex justify-center transition-all duration-1000 ease-in-out ${
        isScrolled ? 'top-4' : 'top-0'
      }`}
    >
      <div 
        className={`
          relative flex items-center justify-between
          transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
          ${isScrolled 
            ? 'w-[85%] max-w-6xl bg-[#050505]/60 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] py-3 px-8' 
            : 'w-full bg-transparent border-transparent py-8 px-8 sm:px-12 bg-gradient-to-b from-black/90 to-transparent'
          }
        `}
      >
          
          {/* Logo Section */}
          <div className={`flex items-center gap-3 cursor-pointer group transition-all duration-1000 origin-left ${isScrolled ? 'scale-90' : 'scale-100'}`} onClick={() => onNavigate('home')}>
            <div className={`p-1.5 rounded-lg bg-moto-accent group-hover:shadow-[0_0_20px_#ff1f1f] transition-all duration-500 transform group-hover:scale-105`}>
               <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold tracking-tighter text-white leading-none transition-all duration-500">
                MOTO<span className="text-moto-accent">VIBE</span>
              </span>
              <div className={`overflow-hidden transition-all duration-700 ${isScrolled ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
                <span className="text-[8px] text-gray-400 font-mono tracking-[0.3em] uppercase hidden sm:block">
                  Premium Gear
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className={`hidden md:flex items-center bg-black/20 rounded-full p-1 border border-white/5 backdrop-blur-sm transition-all duration-1000 ${isScrolled ? 'scale-90 opacity-100' : 'scale-100 opacity-100'}`}>
              <button 
                onClick={() => onNavigate('home')} 
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-500 ${currentView === 'home' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                ANA SAYFA
              </button>
              <button 
                onClick={() => onNavigate('shop')} 
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-500 ${currentView === 'shop' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                MAĞAZA
              </button>
              <button 
                onClick={() => onNavigate('forum')} 
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-500 ${currentView === 'forum' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                FORUM
              </button>
              <button 
                onClick={() => onNavigate('ai_assistant')} 
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-500 flex items-center gap-2 ${currentView === 'ai_assistant' ? 'bg-moto-accent text-white shadow-[0_0_15px_rgba(255,31,31,0.4)]' : 'text-gray-400 hover:text-moto-accent hover:bg-white/5'}`}
              >
                <Sparkles className="w-3 h-3" />
                AI ASİSTAN
              </button>
          </div>

          {/* Right Icons */}
          <div className={`flex items-center gap-3 sm:gap-5 transition-all duration-1000 origin-right ${isScrolled ? 'scale-90' : 'scale-100'}`}>
            {/* Search */}
            <div 
              className={`flex items-center transition-all duration-500 ease-out focus-within:border-moto-accent focus-within:shadow-[0_0_15px_rgba(255,31,31,0.4)] ${
                isSearchOpen 
                  ? 'bg-black/80 border border-moto-accent shadow-[0_0_15px_rgba(255,31,31,0.3)] w-48 sm:w-64 px-3 py-1.5 rounded-xl' 
                  : 'w-10 h-10 justify-center cursor-pointer hover:bg-white/10 rounded-full transition-colors'
              }`}
            >
              {isSearchOpen ? (
                <>
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0 mr-2" />
                  <input 
                    type="text"
                    placeholder="Ürün ara..."
                    autoFocus
                    className="bg-transparent border-none focus:ring-0 text-white text-sm w-full placeholder-gray-600 outline-none font-medium"
                    onChange={(e) => onSearch(e.target.value)}
                  />
                  <button onClick={() => {setIsSearchOpen(false); onSearch('')}} className="ml-1 text-gray-400 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <button onClick={() => setIsSearchOpen(true)} className="text-gray-400 hover:text-white w-full h-full flex items-center justify-center">
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {/* Favorites */}
            <button 
              onClick={onFavoritesClick}
              className={`relative w-10 h-10 flex items-center justify-center transition-all duration-300 rounded-full hover:bg-white/10 group ${
                animateFav ? 'scale-110 bg-white/5' : ''
              } ${currentView === 'favorites' ? 'text-moto-accent bg-white/10' : 'text-gray-400'}`}
            >
              <Heart className={`h-5 w-5 transition-colors ${currentView === 'favorites' || animateFav ? 'fill-moto-accent text-moto-accent' : 'group-hover:text-white'}`} />
              {favoritesCount > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-gray-700 rounded-full border border-black transition-all duration-300 ${
                    animateFav ? 'scale-125 bg-moto-accent' : 'scale-100'
                }`}>
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button 
              onClick={onCartClick}
              className={`relative w-10 h-10 flex items-center justify-center transition-all duration-300 rounded-full hover:bg-white/10 group ${
                animateCart ? 'scale-110 rotate-12 bg-moto-accent/10' : ''
              }`}
            >
              <ShoppingCart className={`h-5 w-5 transition-colors ${animateCart ? 'text-moto-accent' : 'text-gray-400 group-hover:text-white'}`} />
              {cartCount > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-moto-accent rounded-full shadow-[0_0_10px_#ff1f1f] transition-all duration-300 ${
                    animateCart ? 'scale-125' : 'scale-100'
                }`}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Section */}
            <div className="hidden md:block border-l border-white/10 pl-5 transition-all duration-500">
               {user ? (
                 <div className="flex items-center gap-2 group cursor-pointer" onClick={() => onNavigate('profile')}>
                   <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center group-hover:border-moto-accent transition-all shadow-lg overflow-hidden relative">
                      {user.isAdmin && (
                          <div className="absolute top-0 right-0 w-2 h-2 bg-moto-accent rounded-full border border-black"></div>
                      )}
                      <span className="font-display font-bold text-sm text-white group-hover:scale-110 transition-transform">{user.name.charAt(0)}</span>
                   </div>
                   {user.isAdmin && !isScrolled && (
                       <div className="absolute -bottom-4 right-0 text-[8px] text-moto-accent font-bold uppercase tracking-wider hidden group-hover:block animate-in fade-in">
                           Admin
                       </div>
                   )}
                 </div>
               ) : (
                 <button 
                    onClick={onOpenAuth}
                    className="text-xs font-bold text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-lg transition-all border border-white/5 hover:border-white/20 tracking-wide"
                 >
                    GİRİŞ
                 </button>
               )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 w-full mt-4 px-2 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col space-y-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                  <button onClick={() => {onNavigate('home'); setIsMobileMenuOpen(false)}} className="text-left p-3 hover:bg-white/5 rounded-xl text-white font-display text-sm tracking-wider">ANA SAYFA</button>
                  <button onClick={() => {onNavigate('shop'); setIsMobileMenuOpen(false)}} className="text-left p-3 hover:bg-white/5 rounded-xl text-white font-display text-sm tracking-wider">MAĞAZA</button>
                  <button onClick={() => {onNavigate('favorites'); setIsMobileMenuOpen(false)}} className="text-left p-3 hover:bg-white/5 rounded-xl text-white font-display text-sm tracking-wider flex items-center gap-2"><Heart className="w-4 h-4 text-moto-accent"/> FAVORİLERİM ({favoritesCount})</button>
                  <button onClick={() => {onNavigate('forum'); setIsMobileMenuOpen(false)}} className="text-left p-3 hover:bg-white/5 rounded-xl text-white font-display text-sm tracking-wider">FORUM</button>
                  <button onClick={() => {onNavigate('ai_assistant'); setIsMobileMenuOpen(false)}} className="text-left p-3 hover:bg-moto-accent/10 rounded-xl text-moto-accent font-display text-sm tracking-wider font-bold">AI ASİSTAN</button>
                  <div className="h-px bg-white/10 my-2"></div>
                  {user ? (
                      <>
                        <button onClick={() => {onNavigate('profile'); setIsMobileMenuOpen(false)}} className="text-left p-3 hover:bg-white/5 rounded-xl text-gray-300 text-sm flex items-center gap-2"><UserIcon className="w-4 h-4" /> Profilim</button>
                        {user.isAdmin && (
                           <button onClick={() => {onNavigate('admin_panel'); setIsMobileMenuOpen(false)}} className="text-left p-3 hover:bg-white/5 rounded-xl text-moto-accent font-bold text-sm flex items-center gap-2"><Zap className="w-4 h-4" /> Yönetici Paneli</button>
                        )}
                        <button onClick={onLogout} className="text-left p-3 hover:bg-red-900/20 rounded-xl text-red-400 text-sm flex items-center gap-2"><LogOut className="w-4 h-4" /> Çıkış Yap</button>
                      </>
                  ) : (
                      <button onClick={() => {onOpenAuth(); setIsMobileMenuOpen(false)}} className="text-left p-3 bg-moto-accent rounded-xl text-white font-bold text-center shadow-lg shadow-moto-accent/20">GİRİŞ YAP</button>
                  )}
              </div>
            </div>
          )}
      </div>
    </nav>
  );
};