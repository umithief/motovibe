import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, ProductCategory, ViewState, User, AuthMode } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { CartDrawer } from './components/CartDrawer';
import { AIChat } from './components/AIChat';
import { Button } from './components/Button';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { UserProfile } from './components/UserProfile';
import { About } from './components/About';
import { Forum } from './components/Forum';
import { AdminPanel } from './components/AdminPanel';
import { SupportChatWidget } from './components/SupportChatWidget';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { CategoryGrid } from './components/CategoryGrid'; 
import { authService } from './services/auth';
import { orderService } from './services/orderService';
import { productService } from './services/productService';
import { statsService } from './services/statsService';
import { ArrowRight, Zap, Heart, Lock, ArrowUpDown, ArrowUp } from 'lucide-react';

export const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>('ALL');
  const [sortOption, setSortOption] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  
  // Scroll to Top State
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Loading State
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Payment States
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Session Tracking
  const sessionStartTime = useRef(Date.now());

  // Toast Helper
  const addToast = (type: ToastType, message: string) => {
    const newToast = { id: Date.now(), type, message };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoadingProgress(100), 100);

    const initSession = async () => {
      try {
        // Ziyaretçi kaydı
        statsService.recordVisit();

        await new Promise(resolve => setTimeout(resolve, 2000)); // Cinematic loading delay
        
        // Load Session
        const sessionUser = await authService.getCurrentUser();
        if (sessionUser) {
          setUser(sessionUser);
        }

        // Load Products
        const loadedProducts = await productService.getProducts();
        setProducts(loadedProducts);

        // Load Favorites
        const savedFavs = localStorage.getItem('mv_favorites');
        if (savedFavs) {
            setFavoriteIds(JSON.parse(savedFavs));
        }

      } catch (e) {
        console.error('Session/Product init failed', e);
      } finally {
        setIsAppLoading(false);
      }
    };
    initSession();

    // Session Duration & Scroll Listener
    const trackSession = () => {
        const duration = Math.round((Date.now() - sessionStartTime.current) / 1000);
        if (duration > 0) {
            statsService.trackEvent('session_duration', { 
                duration,
                userId: user?.id
            });
        }
    };

    const handleScroll = () => {
        if (window.scrollY > 400) {
            setShowScrollTop(true);
        } else {
            setShowScrollTop(false);
        }
    };

    window.addEventListener('beforeunload', trackSession);
    window.addEventListener('scroll', handleScroll);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeunload', trackSession);
        window.removeEventListener('scroll', handleScroll);
        // Cleanup sırasında da track edelim (SPA navigasyonu için)
        trackSession();
    };
  }, []); // Empty deps to run once on mount

  // Her view değişiminde ürünleri yenile (Admin tarafındaki güncellemeleri yakalamak için)
  useEffect(() => {
    if (view === 'home' || view === 'shop') {
      productService.getProducts().then(setProducts);
    }
    // Sayfa değiştiğinde en üste at
    window.scrollTo(0, 0);
  }, [view]);

  // Save favorites to local storage whenever they change
  useEffect(() => {
      localStorage.setItem('mv_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (category: ProductCategory) => {
      setSelectedCategory(category);
      setView('shop');
  };

  const handleAddToCart = (product: Product) => {
    // Analytics
    statsService.trackEvent('add_to_cart', {
        productId: product.id,
        productName: product.name,
        userId: user?.id,
        userName: user?.name
    });

    setCartItems(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        addToast('success', 'Sepet güncellendi.');
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      addToast('success', `${product.name} sepete eklendi.`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    addToast('info', 'Ürün sepetten kaldırıldı.');
  };

  const handleCheckoutStart = async () => {
    // Analytics
    statsService.trackEvent('checkout_start', {
        userId: user?.id,
        userName: user?.name
    });

    if (!user) {
      setIsCartOpen(false);
      setAuthMode('login');
      setIsAuthOpen(true);
      addToast('info', 'Ödeme yapmak için lütfen giriş yapın.');
      return;
    }
    if (cartItems.length === 0) return;
    setIsCartOpen(false);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!user) return;
    try {
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      await orderService.createOrder(user, cartItems, total);
      setCartItems([]);
      setIsPaymentOpen(false);
      setView('profile');
      addToast('success', 'Siparişiniz başarıyla oluşturuldu!');
    } catch (error) {
      console.error("Sipariş oluşturulamadı", error);
      addToast('error', 'Sipariş oluşturulurken bir hata oluştu.');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setView('home');
    addToast('info', 'Başarıyla çıkış yapıldı.');
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setView('product_detail');
    window.scrollTo(0, 0);
  };
  
  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const handleToggleFavorite = (product: Product) => {
      if (!user) {
          setAuthMode('login');
          setIsAuthOpen(true);
          return;
      }

      setFavoriteIds(prev => {
          if (prev.includes(product.id)) {
              addToast('info', 'Favorilerden çıkarıldı.');
              return prev.filter(id => id !== product.id);
          } else {
              addToast('success', 'Favorilere eklendi.');
              return [...prev, product.id];
          }
      });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && view !== 'shop') {
        setView('shop');
    }
  };

  // Sort Function Logic
  const getSortedProducts = (productList: Product[]) => {
      if (sortOption === 'price-asc') {
          return [...productList].sort((a, b) => a.price - b.price);
      } else if (sortOption === 'price-desc') {
          return [...productList].sort((a, b) => b.price - a.price);
      } else if (sortOption === 'rating') {
          return [...productList].sort((a, b) => b.rating - a.rating);
      }
      return productList;
  };

  const renderContent = () => {
    switch (view) {
      case 'admin_panel':
        return <AdminPanel onLogout={handleLogout} onBackToSite={() => setView('home')} />;
      
      case 'profile':
        if (!user) { setView('home'); return null; }
        return <UserProfile user={user} onLogout={handleLogout} onNavigate={setView} />;

      case 'about':
        return <About onNavigate={setView} />;

      case 'forum':
        return <Forum user={user} onOpenAuth={() => setIsAuthOpen(true)} />;

      case 'ai_assistant':
        return (
          <div className="pt-32 pb-20 max-w-4xl mx-auto px-4">
            <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">YAPAY ZEKA <span className="text-moto-accent">ASİSTAN</span></h1>
               <p className="text-gray-400">Sürüş tarzına en uygun ekipmanı bulmak için MotoVibe AI ile konuş.</p>
            </div>
            <AIChat />
          </div>
        );

      case 'product_detail':
        if (!selectedProduct) return null;
        return (
            <ProductDetail 
                product={selectedProduct} 
                allProducts={products}
                onBack={() => setView('shop')} 
                onAddToCart={handleAddToCart} 
                onProductClick={handleProductClick}
            />
        );

      case 'favorites':
        // KULLANICI GİRİŞ KONTROLÜ
        if (!user) {
            return (
                <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in">
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 bg-gray-900/50 border border-white/10 rounded-3xl p-10 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-moto-accent/5 to-transparent pointer-events-none"></div>
                        <div className="w-24 h-24 bg-gray-800/80 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-2xl relative">
                           <Heart className="w-10 h-10 text-gray-500" />
                           <div className="absolute -bottom-1 -right-1 bg-moto-accent p-2 rounded-full border-4 border-gray-900">
                               <Lock className="w-4 h-4 text-white" />
                           </div>
                        </div>
                        
                        <div>
                            <h2 className="text-3xl font-display font-bold text-white mb-3">FAVORİLERİNİ SAKLA</h2>
                            <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
                              Beğendiğin ürünleri listene eklemek, fiyat takibi yapmak ve her cihazdan erişebilmek için hesabına giriş yapmalısın.
                            </p>
                        </div>
                        
                        <Button 
                            variant="primary" 
                            size="lg" 
                            onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                            className="px-10 py-4 shadow-xl shadow-moto-accent/20"
                        >
                           GİRİŞ YAP / KAYIT OL
                        </Button>
                    </div>
                </div>
            );
        }

        const favoriteProducts = products.filter(p => favoriteIds.includes(p.id));
        return (
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-3 bg-moto-accent/20 rounded-full border border-moto-accent/50">
                        <Heart className="w-8 h-8 text-moto-accent fill-moto-accent" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold text-white">FAVORİLERİM</h2>
                        <p className="text-gray-400 text-sm">{favoriteProducts.length} ürün kaydedildi</p>
                    </div>
                </div>

                {favoriteProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                        <Heart className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 text-lg mb-6">Henüz favori ürününüz yok.</p>
                        <Button variant="cyber" onClick={() => setView('shop')}>
                            MAĞAZAYA GİT
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {favoriteProducts.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onAddToCart={handleAddToCart} 
                                onClick={handleProductClick}
                                onQuickView={handleQuickView}
                                isFavorite={true}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        ))}
                    </div>
                )}
            </div>
        );

      case 'shop':
        let filteredProducts = products.filter(p => {
           const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
           const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 p.description.toLowerCase().includes(searchQuery.toLowerCase());
           return matchesCategory && matchesSearch;
        });
        
        filteredProducts = getSortedProducts(filteredProducts);

        return (
          <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                <h2 className="text-4xl font-display font-bold text-white">Mağaza</h2>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Category Filter */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {['ALL', ...Object.values(ProductCategory)].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat as any)}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                            selectedCategory === cat 
                              ? 'bg-moto-accent text-white shadow-[0_0_15px_rgba(255,31,31,0.4)]' 
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          {cat === 'ALL' ? 'Tümü' : cat}
                        </button>
                      ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative group">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full text-sm text-gray-300 border border-gray-700 group-hover:border-moto-accent transition-colors cursor-pointer">
                            <ArrowUpDown className="w-4 h-4" />
                            <select 
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="bg-transparent outline-none appearance-none cursor-pointer text-white font-bold"
                            >
                                <option value="default">Önerilen</option>
                                <option value="price-asc">Fiyat (Artan)</option>
                                <option value="price-desc">Fiyat (Azalan)</option>
                                <option value="rating">En Çok Oy Alan</option>
                            </select>
                        </div>
                    </div>
                </div>
             </div>

             {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                   <p className="text-gray-500 text-lg">Aradığınız kriterlere uygun ürün bulunamadı.</p>
                   <Button variant="outline" className="mt-4" onClick={() => {setSelectedCategory('ALL'); setSearchQuery('')}}>Filtreleri Temizle</Button>
                </div>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={handleAddToCart} 
                      onClick={handleProductClick}
                      onQuickView={handleQuickView}
                      isFavorite={favoriteIds.includes(product.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
             )}
          </div>
        );

      case 'home':
      default:
        const featuredProducts = products.slice(0, 4);
        return (
          <>
            <Hero onNavigate={setView} />

            {/* Category Grid (NEW) */}
            <CategoryGrid onCategorySelect={handleCategorySelect} />
            
            {/* Featured Section */}
            <div className="py-20 bg-[#050505] relative">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-end justify-between mb-12">
                     <div>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                           ÖNE ÇIKAN <span className="text-moto-accent">EKİPMANLAR</span>
                        </h2>
                        <div className="h-1 w-20 bg-moto-accent"></div>
                     </div>
                     <Button variant="cyber" onClick={() => setView('shop')} className="hidden sm:flex">
                        TÜMÜNÜ GÖR <ArrowRight className="w-4 h-4 ml-2" />
                     </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     {featuredProducts.map(product => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          onAddToCart={handleAddToCart} 
                          onClick={handleProductClick}
                          onQuickView={handleQuickView}
                          isFavorite={favoriteIds.includes(product.id)}
                          onToggleFavorite={handleToggleFavorite}
                        />
                     ))}
                  </div>
                  
                  <div className="mt-12 text-center sm:hidden">
                     <Button variant="cyber" onClick={() => setView('shop')} className="w-full">
                        TÜMÜNÜ GÖR <ArrowRight className="w-4 h-4 ml-2" />
                     </Button>
                  </div>
               </div>
            </div>
          </>
        );
    }
  };

  if (isAppLoading) {
    return (
      <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col items-center justify-center">
        <div className="relative mb-8">
           <Zap className="w-16 h-16 text-moto-accent animate-pulse" />
           <div className="absolute inset-0 bg-moto-accent/20 blur-xl rounded-full animate-pulse"></div>
        </div>
        <h1 className="text-3xl font-display font-bold text-white tracking-[0.2em] mb-2">SİSTEM BAŞLATILIYOR</h1>
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden relative">
           <div 
             className="absolute top-0 left-0 h-full bg-moto-accent transition-all duration-1000 ease-out"
             style={{ width: `${loadingProgress}%` }}
           ></div>
        </div>
        <div className="mt-4 font-mono text-xs text-gray-500">
           {loadingProgress < 30 ? 'YAPILANDIRMA YÜKLENİYOR...' : 
            loadingProgress < 60 ? 'GÜVENLİK PROTOKOLLERİ AKTİF...' : 
            loadingProgress < 90 ? 'VERİTABANI BAĞLANTISI...' : 'HAZIR'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-moto-accent selection:text-white font-sans">
      {/* Global Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Navbar (Admin panelinde gizli) */}
      {view !== 'admin_panel' && (
          <Navbar 
            cartCount={cartItems.reduce((a, b) => a + b.quantity, 0)}
            favoritesCount={favoriteIds.length}
            onCartClick={() => setIsCartOpen(true)}
            onFavoritesClick={() => setView('favorites')}
            onNavigate={setView}
            currentView={view}
            onSearch={handleSearch}
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
          />
      )}

      {/* Main Content with Transition Effect */}
      <main className="relative min-h-screen">
         <div key={view} className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
            {renderContent()}
         </div>
      </main>

      {/* Scroll To Top Button */}
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-24 right-6 z-40 p-3 bg-black border border-moto-accent/50 rounded-full text-moto-accent shadow-[0_0_20px_rgba(255,31,31,0.3)] transition-all duration-500 hover:bg-moto-accent hover:text-white ${
            showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-6 h-6" />
      </button>

      {/* Global Components (Modals, Chat Widget) */}
      {/* Support Widget - Show on all pages EXCEPT Admin Panel and the main AI Assistant Page */}
      {view !== 'admin_panel' && view !== 'ai_assistant' && (
         <SupportChatWidget />
      )}

      {/* Footer */}
      {view !== 'admin_panel' && (
          <footer className="bg-black border-t border-white/10 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                  <div>
                     <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-5 w-5 text-moto-accent" />
                        <span className="text-xl font-display font-bold text-white tracking-tighter">
                          MOTO<span className="text-moto-accent">VIBE</span>
                        </span>
                     </div>
                     <p className="text-gray-500 text-sm leading-relaxed">
                        Motosiklet tutkunları için en ileri teknoloji, en güvenli ekipman ve en iyi deneyim.
                     </p>
                  </div>
                  <div>
                     <h4 className="text-white font-bold mb-4">Mağaza</h4>
                     <ul className="space-y-2 text-sm text-gray-500">
                        <li onClick={() => {setView('shop'); setSelectedCategory(ProductCategory.HELMET)}} className="cursor-pointer hover:text-moto-accent">Kasklar</li>
                        <li onClick={() => {setView('shop'); setSelectedCategory(ProductCategory.JACKET)}} className="cursor-pointer hover:text-moto-accent">Montlar</li>
                        <li onClick={() => {setView('shop'); setSelectedCategory(ProductCategory.GLOVES)}} className="cursor-pointer hover:text-moto-accent">Eldivenler</li>
                        <li onClick={() => {setView('shop'); setSelectedCategory(ProductCategory.ACCESSORY)}} className="cursor-pointer hover:text-moto-accent">Aksesuarlar</li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="text-white font-bold mb-4">Kurumsal</h4>
                     <ul className="space-y-2 text-sm text-gray-500">
                        <li onClick={() => setView('about')} className="cursor-pointer hover:text-moto-accent">Hakkımızda</li>
                        <li className="cursor-pointer hover:text-moto-accent">Gizlilik Politikası</li>
                        <li className="cursor-pointer hover:text-moto-accent">İade Koşulları</li>
                        <li className="cursor-pointer hover:text-moto-accent">İletişim</li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="text-white font-bold mb-4">Bülten</h4>
                     <p className="text-xs text-gray-500 mb-4">Yeni ürünlerden ve indirimlerden haberdar ol.</p>
                     <div className="flex">
                        <input type="email" placeholder="E-posta" className="bg-gray-900 border border-gray-800 text-white px-3 py-2 text-sm rounded-l outline-none focus:border-moto-accent w-full" />
                        <button className="bg-moto-accent px-3 py-2 rounded-r hover:bg-red-600 transition-colors"><ArrowRight className="w-4 h-4 text-white" /></button>
                     </div>
                  </div>
               </div>
               <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-xs text-gray-600">© 2024 MotoVibe Inc. Tüm hakları saklıdır.</p>
                  <div className="flex gap-4 text-gray-600">
                     {/* Social Icons Mockup */}
                     <div className="w-5 h-5 bg-gray-800 rounded-full cursor-pointer hover:bg-moto-accent hover:text-white transition-colors"></div>
                     <div className="w-5 h-5 bg-gray-800 rounded-full cursor-pointer hover:bg-moto-accent hover:text-white transition-colors"></div>
                     <div className="w-5 h-5 bg-gray-800 rounded-full cursor-pointer hover:bg-moto-accent hover:text-white transition-colors"></div>
                  </div>
               </div>
            </div>
          </footer>
      )}

      {/* Modals & Drawers */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckoutStart}
      />

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialMode={authMode}
        onLogin={(loggedInUser) => {
           setUser(loggedInUser);
           setIsAuthOpen(false);
           addToast('success', `Hoşgeldin, ${loggedInUser.name}!`);
        }}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        totalAmount={cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
        onPaymentComplete={handlePaymentSuccess}
      />

      <ProductQuickViewModal 
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
        onAddToCart={handleAddToCart}
        onViewDetail={handleProductClick}
      />
    </div>
  );
};