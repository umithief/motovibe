import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, Plus, Trash2, Edit2, CheckCircle, XCircle, Search, TrendingUp, DollarSign, Activity, Filter, ChevronDown, Bell, Shield, ShieldAlert, ShieldCheck, Upload, Image as ImageIcon, MonitorPlay, Globe, BarChart2, Clock, Eye, ShoppingBag, Calendar, Link } from 'lucide-react';
import { Order, Product, ProductCategory, User, Slide, ActivityLog, VisitorStats, AnalyticsDashboardData, TimeRange } from '../types';
import { Button } from './Button';
import { productService } from '../services/productService';
import { sliderService } from '../services/sliderService';
import { logService } from '../services/logService';
import { statsService } from '../services/statsService';
import { getStorage, setStorage, DB } from '../services/db';

interface AdminPanelProps {
  onLogout: () => void;
  onBackToSite: () => void;
}

type AdminTab = 'dashboard' | 'products' | 'orders' | 'users' | 'slider' | 'analytics';

// Form state'i için genişletilmiş Product
interface ProductFormState extends Partial<Product> {
    images: string[]; // Resimleri tutacak array
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onBackToSite }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({ totalVisits: 0, todayVisits: 0 });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsDashboardData | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Product Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>({
    name: '',
    description: '',
    price: 0,
    category: ProductCategory.ACCESSORY,
    image: '',
    images: ['', '', '', ''], // 4 Slot
    rating: 5.0,
    features: []
  });
  const [featuresInput, setFeaturesInput] = useState('');
  
  // Slider Form State
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [slideForm, setSlideForm] = useState<Partial<Slide>>({
    title: '',
    subtitle: '',
    image: '',
    cta: 'İNCELE'
  });

  // File Upload Ref
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const slideFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [activeTab, timeRange]);

  const loadData = async () => {
    const prod = await productService.getProducts();
    setProducts(prod);

    const ord = getStorage<Order[]>(DB.ORDERS, []);
    setOrders(ord);

    const usr = getStorage<User[]>(DB.USERS, []);
    setUsers(usr);

    const sld = await sliderService.getSlides();
    setSlides(sld);

    const sysLogs = await logService.getLogs();
    setLogs(sysLogs);

    const vStats = await statsService.getVisitorStats();
    setVisitorStats(vStats);

    if (activeTab === 'analytics' || activeTab === 'dashboard') {
        const anData = await statsService.getAnalyticsDashboard(timeRange);
        setAnalyticsData(anData);
    }
  };

  // --- Product Handlers ---

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      // Mevcut resimleri form state'ine aktar, eğer yoksa ana resmi koy
      const existingImages = product.images && product.images.length > 0 
          ? [...product.images] 
          : [product.image];
      
      // 4'e tamamla
      while(existingImages.length < 4) existingImages.push('');

      setProductForm({ ...product, images: existingImages });
      setFeaturesInput(product.features.join(', '));
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: 0,
        category: ProductCategory.ACCESSORY,
        image: '',
        images: ['', '', '', ''],
        rating: 5.0,
        features: []
      });
      setFeaturesInput('');
    }
    setIsProductModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...productForm.images];
        newImages[index] = reader.result as string;
        
        // İlk resim aynı zamanda ana resimdir
        let mainImage = productForm.image;
        if (index === 0) mainImage = reader.result as string;

        setProductForm({ ...productForm, images: newImages, image: mainImage });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string, index: number) => {
    const newImages = [...productForm.images];
    newImages[index] = url;
    
    let mainImage = productForm.image;
    if (index === 0) mainImage = url;

    setProductForm({ ...productForm, images: newImages, image: mainImage });
  };

  const handleRemoveImage = (index: number) => {
      const newImages = [...productForm.images];
      newImages[index] = '';
      // Eğer ana resim silindiyse ve başka resim varsa onu ana resim yap
      let mainImage = productForm.image;
      if (index === 0) {
          const nextAvailable = newImages.find(img => img !== '');
          mainImage = nextAvailable || '';
      }
      setProductForm({ ...productForm, images: newImages, image: mainImage });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;

    // Boş resimleri temizle
    const cleanImages = productForm.images.filter(img => img && img.trim() !== '');
    const mainImage = cleanImages.length > 0 ? cleanImages[0] : 'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?q=80&w=800&auto=format&fit=crop';

    const features = featuresInput.split(',').map(f => f.trim()).filter(f => f);
    const finalProductData = {
        ...productForm,
        price: Number(productForm.price),
        features: features,
        image: mainImage,
        images: cleanImages.length > 0 ? cleanImages : [mainImage]
    };

    if (editingProduct) {
        await productService.updateProduct({ ...editingProduct, ...finalProductData } as Product);
    } else {
        await productService.addProduct({
            name: finalProductData.name!,
            description: finalProductData.description || '',
            price: finalProductData.price,
            category: finalProductData.category as ProductCategory,
            image: finalProductData.image,
            images: finalProductData.images,
            rating: 5.0,
            features: finalProductData.features
        });
    }
    setIsProductModalOpen(false);
    loadData();
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      await productService.deleteProduct(id);
      loadData();
    }
  };

  // ... (Slider, Order, User handlers remain same) ...
  const openSlideModal = (slide?: Slide) => {
    if (slide) {
        setEditingSlide(slide);
        setSlideForm({ ...slide });
    } else {
        setEditingSlide(null);
        setSlideForm({
            title: '',
            subtitle: '',
            image: '',
            cta: 'İNCELE'
        });
    }
    setIsSlideModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.title || !slideForm.image) return;
    // Slider Logic ...
    const finalSlideData = { ...slideForm, action: 'shop' as any };
    if (editingSlide) {
        await sliderService.updateSlide({ ...editingSlide, ...finalSlideData } as Slide);
    } else {
        await sliderService.addSlide({
            title: finalSlideData.title!,
            subtitle: finalSlideData.subtitle || '',
            image: finalSlideData.image!,
            cta: finalSlideData.cta || 'İNCELE',
            action: 'shop'
        });
    }
    setIsSlideModalOpen(false);
    loadData();
  };

  const handleDeleteSlide = async (id: number) => {
    if (window.confirm('Bu slaytı silmek istediğinize emin misiniz?')) {
        await sliderService.deleteSlide(id);
        loadData();
    }
  };

  const handleSliderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setSlideForm({ ...slideForm, image: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleOrderStatusChange = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updatedOrders);
    setStorage(DB.ORDERS, updatedOrders);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Bu kullanıcıyı kalıcı olarak silmek istediğinize emin misiniz?')) {
        const updatedUsers = users.filter(u => u.id !== userId);
        setUsers(updatedUsers);
        setStorage(DB.USERS, updatedUsers);
    }
  };

  const handleToggleAdmin = (userId: string) => {
    const updatedUsers = users.map(u => {
        if (u.id === userId) {
            return { ...u, isAdmin: !u.isAdmin };
        }
        return u;
    });
    setUsers(updatedUsers);
    setStorage(DB.USERS, updatedUsers);
  };

  // --- RENDER FUNCTIONS ---

  const renderDashboard = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-900 border border-white/10 p-6 rounded-xl shadow-lg group hover:border-moto-accent/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Toplam Satış</p>
                            <h3 className="text-3xl font-bold text-white mt-2">₺{totalRevenue.toLocaleString('tr-TR')}</h3>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-green-500 font-bold">
                        <TrendingUp className="w-3 h-3 mr-1" /> %12 Artış (Geçen Hafta)
                    </div>
                </div>

                <div className="bg-gray-900 border border-white/10 p-6 rounded-xl shadow-lg group hover:border-moto-accent/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Siparişler</p>
                            <h3 className="text-3xl font-bold text-white mt-2">{orders.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-gray-500">
                         <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div> 2 Yeni Sipariş
                    </div>
                </div>

                <div className="bg-gray-900 border border-white/10 p-6 rounded-xl shadow-lg group hover:border-moto-accent/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Ziyaretçiler</p>
                            <div className="flex items-baseline gap-2 mt-2">
                                <h3 className="text-3xl font-bold text-white">{visitorStats.totalVisits}</h3>
                                <span className="text-xs text-green-500 font-bold">(+{visitorStats.todayVisits} Bugün)</span>
                            </div>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-lg text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <Globe className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                         <div className="h-full bg-purple-500 w-[65%]"></div>
                    </div>
                </div>

                <div className="bg-gray-900 border border-white/10 p-6 rounded-xl shadow-lg group hover:border-moto-accent/50 transition-colors">
                     <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Ürün Stoğu</p>
                            <h3 className="text-3xl font-bold text-white mt-2">{products.length}</h3>
                        </div>
                        <div className="p-3 bg-orange-500/20 rounded-lg text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            <Package className="w-6 h-6" />
                        </div>
                     </div>
                     {/* Kritik Stok Uyarısı */}
                     <div className="mt-4 p-2 bg-red-900/20 border border-red-900/50 rounded text-[10px] text-red-400 flex items-center gap-2 cursor-pointer hover:bg-red-900/30 transition-colors" onClick={() => {setActiveTab('products'); setSearchTerm('eldiven')}}>
                        <ShieldAlert className="w-3 h-3" />
                        <span>2 Ürün Kritik Stok Seviyesinde</span>
                     </div>
                </div>
            </div>

            {/* Activity Log */}
            <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gray-800/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-moto-accent" /> Sistem Aktiviteleri
                    </h3>
                    <span className="flex items-center gap-2 text-xs text-green-500 font-mono">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> LIVE
                    </span>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {logs.map((log) => (
                        <div key={log.id} className="flex items-center p-4 border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                            <div className="w-20 text-xs text-gray-500 font-mono">{log.time}</div>
                            <div className={`w-2 h-2 rounded-full mx-4 ${
                                log.type === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 
                                log.type === 'warning' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]' : 
                                log.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
                                'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                            }`}></div>
                            <div className="flex-1">
                                <span className="text-white font-bold mr-2">{log.event}</span>
                                <span className="text-gray-400 text-xs">{log.details}</span>
                            </div>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm">Henüz bir aktivite kaydı yok.</div>
                    )}
                </div>
            </div>
        </div>
    );
  };

  const renderAnalytics = () => {
      if (!analyticsData) return <div className="p-10 text-center text-gray-500">Veriler yükleniyor...</div>;

      const { totalProductViews, totalAddToCart, totalCheckouts, avgSessionDuration, topViewedProducts, topAddedProducts, activityTimeline } = analyticsData;

      const viewToCartRate = totalProductViews > 0 ? Math.round((totalAddToCart / totalProductViews) * 100) : 0;
      const cartToCheckoutRate = totalAddToCart > 0 ? Math.round((totalCheckouts / totalAddToCart) * 100) : 0;
      const maxActivity = Math.max(...activityTimeline.map(a => a.value), 1);

      return (
          <div className="space-y-8 animate-in fade-in">
              {/* Header & Time Controls */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-900/20 rounded-xl border border-blue-500/30">
                        <BarChart2 className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                          <h2 className="text-2xl font-bold text-white">Analiz & Raporlar</h2>
                          <p className="text-sm text-gray-400">Kullanıcı davranışları ve dönüşüm hunisi</p>
                      </div>
                  </div>
                  
                  <div className="flex bg-gray-900 p-1 rounded-lg border border-white/5">
                      {(['24h', '7d', '30d'] as TimeRange[]).map(range => (
                          <button
                              key={range}
                              onClick={() => setTimeRange(range)}
                              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                                  timeRange === range 
                                  ? 'bg-moto-accent text-white shadow-lg' 
                                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                              }`}
                          >
                              {range === '24h' ? 'Günlük' : range === '7d' ? 'Haftalık' : 'Aylık'}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Interactive Activity Chart */}
              <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-6">
                  <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" /> Site Etkileşimleri
                  </h4>
                  <div className="h-64 flex items-end gap-2 sm:gap-4">
                      {activityTimeline.map((item, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                              <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none border border-gray-700">
                                  {item.value} Etkileşim
                              </div>
                              <div 
                                  className={`w-full bg-gray-800 rounded-t transition-all duration-500 relative overflow-hidden group-hover:bg-moto-accent cursor-pointer`}
                                  style={{ height: `${(item.value / maxActivity) * 100}%`, minHeight: '4px' }}
                              >
                                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
                              </div>
                              <span className="text-[10px] text-gray-500 font-mono rotate-0 group-hover:text-white transition-colors truncate w-full text-center">
                                  {item.label}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Conversion Funnel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#0f0f0f] p-6 rounded-xl border border-white/5 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Ürün Görüntüleme</p>
                              <h3 className="text-3xl font-bold text-white mt-1">{totalProductViews}</h3>
                          </div>
                          <Eye className="w-8 h-8 text-gray-700" />
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-full"></div>
                      </div>
                  </div>

                  <div className="bg-[#0f0f0f] p-6 rounded-xl border border-white/5 relative overflow-hidden">
                       <div className="absolute top-1/2 -left-3 -translate-y-1/2 bg-gray-800 text-[10px] py-1 px-2 rounded-full border border-gray-700 z-10 text-gray-300">
                           %{viewToCartRate} Dönüşüm
                       </div>
                      <div className="flex justify-between items-start mb-4 pl-4">
                          <div>
                              <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Sepete Ekleme</p>
                              <h3 className="text-3xl font-bold text-white mt-1">{totalAddToCart}</h3>
                          </div>
                          <ShoppingBag className="w-8 h-8 text-gray-700" />
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${Math.min(viewToCartRate, 100)}%` }}></div>
                      </div>
                  </div>

                  <div className="bg-[#0f0f0f] p-6 rounded-xl border border-white/5 relative overflow-hidden">
                      <div className="absolute top-1/2 -left-3 -translate-y-1/2 bg-gray-800 text-[10px] py-1 px-2 rounded-full border border-gray-700 z-10 text-gray-300">
                           %{cartToCheckoutRate} Dönüşüm
                       </div>
                      <div className="flex justify-between items-start mb-4 pl-4">
                          <div>
                              <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Ödeme Başlatma</p>
                              <h3 className="text-3xl font-bold text-white mt-1">{totalCheckouts}</h3>
                          </div>
                          <CheckCircle className="w-8 h-8 text-gray-700" />
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${Math.min(cartToCheckoutRate, 100)}%` }}></div>
                      </div>
                  </div>
              </div>
              
              {/* Bottom Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Top Viewed Products */}
                  <div className="lg:col-span-1 bg-[#0f0f0f] border border-white/5 rounded-xl p-6">
                      <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-500" /> En Çok İncelenenler
                      </h4>
                      <div className="space-y-4">
                          {topViewedProducts.map((p, i) => (
                              <div key={i} className="flex justify-between items-center pb-3 border-b border-white/5 last:border-0">
                                  <span className="text-sm text-gray-300 truncate flex-1 pr-4">{p.name}</span>
                                  <span className="text-xs font-bold text-blue-400 bg-blue-900/20 px-2 py-1 rounded">{p.count}</span>
                              </div>
                          ))}
                          {topViewedProducts.length === 0 && <p className="text-gray-500 text-xs">Veri yok</p>}
                      </div>
                  </div>

                  {/* Top Added Products */}
                  <div className="lg:col-span-1 bg-[#0f0f0f] border border-white/5 rounded-xl p-6">
                      <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-purple-500" /> Sepet Yıldızları
                      </h4>
                      <div className="space-y-4">
                          {topAddedProducts.map((p, i) => (
                              <div key={i} className="flex justify-between items-center pb-3 border-b border-white/5 last:border-0">
                                  <span className="text-sm text-gray-300 truncate flex-1 pr-4">{p.name}</span>
                                  <span className="text-xs font-bold text-purple-400 bg-purple-900/20 px-2 py-1 rounded">{p.count}</span>
                              </div>
                          ))}
                          {topAddedProducts.length === 0 && <p className="text-gray-500 text-xs">Veri yok</p>}
                      </div>
                  </div>

                  {/* Session Duration */}
                  <div className="lg:col-span-1 bg-[#0f0f0f] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mb-4 border border-gray-800 shadow-lg">
                          <Clock className="w-8 h-8 text-moto-accent" />
                      </div>
                      <h4 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Ortalama Oturum Süresi</h4>
                      <div className="text-4xl font-bold text-white font-mono">
                          {Math.floor(avgSessionDuration / 60)}m {avgSessionDuration % 60}s
                      </div>
                      <p className="text-xs text-gray-600 mt-4 max-w-xs">
                          Kullanıcıların sitede geçirdiği ortalama aktif süre. (Yüksek süre = Yüksek ilgi)
                      </p>
                  </div>
              </div>
          </div>
      );
  };

  const renderProducts = () => {
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Ürünlerde ara..." 
                        className="w-full bg-gray-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-moto-accent focus:ring-1 focus:ring-moto-accent outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => openProductModal()}>
                    <Plus className="w-5 h-5 mr-2" /> YENİ ÜRÜN EKLE
                </Button>
            </div>

            <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-gray-800/50 text-xs uppercase text-gray-400 font-bold tracking-wider">
                            <th className="p-4">Ürün</th>
                            <th className="p-4">Kategori</th>
                            <th className="p-4">Fiyat</th>
                            <th className="p-4">Rating</th>
                            <th className="p-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-black border border-white/10">
                                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="font-medium text-white group-hover:text-moto-accent transition-colors">{product.name}</span>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-gray-300">{product.category}</span>
                                </td>
                                <td className="p-4 font-mono text-white">₺{product.price.toLocaleString('tr-TR')}</td>
                                <td className="p-4 text-yellow-500 font-bold text-xs">★ {product.rating}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openProductModal(product)} className="p-2 hover:bg-blue-500/20 text-gray-400 hover:text-blue-500 rounded transition-colors" title="Düzenle">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded transition-colors" title="Sil">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)}>
                    <div className="bg-[#0f0f0f] border border-gray-700 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-6">{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>
                        
                        <form onSubmit={handleSaveProduct} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ürün Adı</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent outline-none"
                                            value={productForm.name}
                                            onChange={e => setProductForm({...productForm, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Kategori</label>
                                            <select 
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent outline-none"
                                                value={productForm.category}
                                                onChange={e => setProductForm({...productForm, category: e.target.value as ProductCategory})}
                                            >
                                                {Object.values(ProductCategory).map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Fiyat (₺)</label>
                                            <input 
                                                type="number" 
                                                required
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent outline-none"
                                                value={productForm.price}
                                                onChange={e => setProductForm({...productForm, price: Number(e.target.value)})}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Açıklama</label>
                                        <textarea 
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent outline-none min-h-[120px]"
                                            value={productForm.description}
                                            onChange={e => setProductForm({...productForm, description: e.target.value})}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Özellikler (Virgülle ayırın)</label>
                                        <input 
                                            type="text" 
                                            placeholder="Su geçirmez, Garantili, ..."
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent outline-none"
                                            value={featuresInput}
                                            onChange={e => setFeaturesInput(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Image Upload Section */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Ürün Görselleri (Max 4)</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {productForm.images.map((img, index) => (
                                            <div key={index} className="relative group aspect-square bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 hover:border-moto-accent/50 transition-colors flex flex-col items-center justify-center overflow-hidden">
                                                {img ? (
                                                    <>
                                                        <img src={img} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <button type="button" onClick={() => handleRemoveImage(index)} className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700"><Trash2 className="w-4 h-4"/></button>
                                                        </div>
                                                        {index === 0 && (
                                                            <div className="absolute bottom-2 left-2 bg-moto-accent text-white text-[10px] font-bold px-2 py-1 rounded">ANA GÖRSEL</div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-2">
                                                        {/* Input for URL */}
                                                        <input
                                                            type="text"
                                                            placeholder="URL"
                                                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-[10px] text-white mb-2 outline-none focus:border-moto-accent"
                                                            onChange={(e) => handleImageUrlChange(e.target.value, index)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <div className="text-[9px] text-gray-500 font-bold uppercase mb-1">- VEYA -</div>
                                                        <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRefs.current[index]?.click()}>
                                                            <Upload className="w-5 h-5 text-gray-500 mb-1 hover:text-moto-accent transition-colors" />
                                                            <span className="text-[9px] text-gray-500 uppercase font-bold">Dosya Seç</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <input 
                                                    type="file" 
                                                    ref={(el) => { fileInputRefs.current[index] = el; }}
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, index)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                                <Button type="button" variant="outline" onClick={() => setIsProductModalOpen(false)}>İptal</Button>
                                <Button type="submit" variant="primary">{editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Ekle'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
  };

  const renderOrders = () => {
    const filteredOrders = orders.filter(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.status.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="text" placeholder="Sipariş ara..." className="w-full bg-gray-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-moto-accent outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-gray-800/50 text-xs uppercase text-gray-400 font-bold">
                            <th className="p-4">Sipariş No</th>
                            <th className="p-4">Tarih</th>
                            <th className="p-4">Müşteri</th>
                            <th className="p-4">Tutar</th>
                            <th className="p-4">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-white/5">
                                <td className="p-4 font-mono text-white">{order.id}</td>
                                <td className="p-4 text-gray-400 text-sm">{order.date}</td>
                                <td className="p-4 text-white">{users.find(u => u.id === order.userId)?.name || 'Misafir'}</td>
                                <td className="p-4 font-bold text-white">₺{order.total.toLocaleString('tr-TR')}</td>
                                <td className="p-4">
                                    <select 
                                        className={`bg-transparent border border-gray-700 rounded px-2 py-1 text-xs font-bold outline-none ${
                                            order.status === 'Teslim Edildi' ? 'text-green-500 border-green-900' :
                                            order.status === 'İptal' ? 'text-red-500 border-red-900' :
                                            'text-yellow-500 border-yellow-900'
                                        }`}
                                        value={order.status}
                                        onChange={(e) => handleOrderStatusChange(order.id, e.target.value as any)}
                                    >
                                        <option value="Hazırlanıyor">Hazırlanıyor</option>
                                        <option value="Kargoda">Kargoda</option>
                                        <option value="Teslim Edildi">Teslim Edildi</option>
                                        <option value="İptal">İptal</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  const renderUsers = () => {
      return (
          <div className="space-y-6 animate-in fade-in">
              <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="border-b border-white/10 bg-gray-800/50 text-xs uppercase text-gray-400 font-bold">
                              <th className="p-4">Kullanıcı</th>
                              <th className="p-4">Email</th>
                              <th className="p-4">Kayıt Tarihi</th>
                              <th className="p-4">Rol</th>
                              <th className="p-4 text-right">İşlem</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {users.map(u => (
                              <tr key={u.id} className="hover:bg-white/5">
                                  <td className="p-4 font-medium text-white">{u.name}</td>
                                  <td className="p-4 text-gray-400">{u.email}</td>
                                  <td className="p-4 text-gray-400 text-sm">{u.joinDate}</td>
                                  <td className="p-4">
                                      <button 
                                          onClick={() => handleToggleAdmin(u.id)}
                                          className={`px-2 py-1 rounded text-xs font-bold border ${u.isAdmin ? 'bg-purple-900/20 text-purple-400 border-purple-900' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                                      >
                                          {u.isAdmin ? 'ADMIN' : 'USER'}
                                      </button>
                                  </td>
                                  <td className="p-4 text-right">
                                      <button onClick={() => handleDeleteUser(u.id)} className="text-gray-500 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  };

  const renderSlider = () => {
      return (
          <div className="space-y-6 animate-in fade-in">
               <div className="flex justify-end">
                   <Button onClick={() => openSlideModal()}><Plus className="w-5 h-5 mr-2" /> YENİ SLAYT EKLE</Button>
               </div>
               <div className="grid grid-cols-1 gap-6">
                   {slides.map(slide => (
                       <div key={slide.id} className="group relative aspect-[21/9] bg-gray-900 rounded-xl overflow-hidden border border-white/10">
                           <img src={slide.image} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                           <div className="absolute bottom-0 left-0 p-8">
                               <h3 className="text-3xl font-bold text-white mb-2">{slide.title}</h3>
                               <p className="text-gray-300">{slide.subtitle}</p>
                           </div>
                           <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openSlideModal(slide)} className="p-2 bg-white/10 backdrop-blur rounded hover:bg-blue-500 hover:text-white text-white"><Edit2 className="w-4 h-4"/></button>
                                <button onClick={() => handleDeleteSlide(slide.id)} className="p-2 bg-white/10 backdrop-blur rounded hover:bg-red-500 hover:text-white text-white"><Trash2 className="w-4 h-4"/></button>
                           </div>
                       </div>
                   ))}
               </div>

               {isSlideModalOpen && (
                   <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsSlideModalOpen(false)}>
                       <div className="bg-[#0f0f0f] border border-gray-700 rounded-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                           <h3 className="text-xl font-bold text-white mb-6">{editingSlide ? 'Slaytı Düzenle' : 'Yeni Slayt Ekle'}</h3>
                           <form onSubmit={handleSaveSlide} className="space-y-4">
                               <div>
                                   <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Başlık</label>
                                   <input type="text" required value={slideForm.title} onChange={e => setSlideForm({...slideForm, title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent outline-none" />
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Alt Başlık</label>
                                   <input type="text" value={slideForm.subtitle} onChange={e => setSlideForm({...slideForm, subtitle: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent outline-none" />
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Görsel</label>
                                   <div className="flex items-center gap-2">
                                       <input type="text" required value={slideForm.image} onChange={e => setSlideForm({...slideForm, image: e.target.value})} className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent outline-none" placeholder="URL veya Yükle" />
                                       <div className="relative overflow-hidden">
                                           <Button type="button" variant="outline">
                                               <Upload className="w-4 h-4"/>
                                               <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleSliderImageUpload} />
                                           </Button>
                                       </div>
                                   </div>
                               </div>
                               <div className="pt-4 flex justify-end gap-2">
                                   <Button type="button" variant="outline" onClick={() => setIsSlideModalOpen(false)}>İptal</Button>
                                   <Button type="submit" variant="primary">Kaydet</Button>
                               </div>
                           </form>
                       </div>
                   </div>
               )}
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex">
       {/* Sidebar */}
       <aside className="w-64 bg-gray-900 border-r border-white/10 fixed h-full z-20 hidden lg:flex flex-col">
           <div className="p-6 border-b border-white/10">
               <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToSite}>
                  <div className="bg-moto-accent p-1.5 rounded-lg">
                      <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-display font-bold text-white">
                     ADMIN<span className="text-moto-accent">PANEL</span>
                  </span>
               </div>
           </div>

           <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
               {[
                   { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
                   { id: 'analytics', label: 'Analizler', icon: BarChart2 },
                   { id: 'products', label: 'Ürünler', icon: Package },
                   { id: 'orders', label: 'Siparişler', icon: ShoppingCart },
                   { id: 'users', label: 'Kullanıcılar', icon: Users },
                   { id: 'slider', label: 'Slider / Vitrin', icon: MonitorPlay }
               ].map(item => (
                   <button
                       key={item.id}
                       onClick={() => setActiveTab(item.id as AdminTab)}
                       className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-moto-accent text-white shadow-lg shadow-moto-accent/20 font-bold' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                   >
                       <item.icon className="w-5 h-5" />
                       {item.label}
                   </button>
               ))}
           </nav>
           
           <div className="p-4 border-t border-white/10 bg-gray-900">
               <div className="bg-gray-800 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                             <p className="text-xs text-gray-400 uppercase font-bold">Sistem Durumu</p>
                             <p className="text-xs text-green-500 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Operational</p>
                        </div>
                    </div>
               </div>
               <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-colors">
                   <div className="w-5 h-5"><Trash2 className="w-full h-full" /></div>
                   Çıkış Yap
               </button>
           </div>
       </aside>

       {/* Main Content */}
       <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
           {/* Top Bar */}
           <header className="h-16 bg-gray-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-10 flex items-center justify-between px-6 lg:px-8">
               <div className="lg:hidden flex items-center gap-2" onClick={onBackToSite}>
                   <ShieldAlert className="w-6 h-6 text-moto-accent" />
                   <span className="font-bold">ADMIN</span>
               </div>
               
               <div className="hidden lg:block text-sm text-gray-400">
                   Hoşgeldin, <span className="text-white font-bold">Admin</span>
               </div>

               <div className="flex items-center gap-4">
                   <Button variant="ghost" onClick={onBackToSite} className="text-xs">
                       <Globe className="w-4 h-4 mr-2" /> SİTEYE DÖN
                   </Button>
                   <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                       <Bell className="w-4 h-4 text-gray-400" />
                   </div>
               </div>
           </header>

           <div className="p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
               <div className="mb-8">
                   <h1 className="text-3xl font-display font-bold text-white capitalize">
                       {activeTab === 'dashboard' ? 'Genel Bakış' : 
                        activeTab === 'analytics' ? 'Detaylı Analiz' :
                        activeTab === 'products' ? 'Ürün Yönetimi' : 
                        activeTab === 'orders' ? 'Sipariş Takibi' : 
                        activeTab === 'users' ? 'Kullanıcılar' : 'Vitrin Ayarları'}
                   </h1>
               </div>

               {activeTab === 'dashboard' && renderDashboard()}
               {activeTab === 'analytics' && renderAnalytics()}
               {activeTab === 'products' && renderProducts()}
               {activeTab === 'orders' && renderOrders()}
               {activeTab === 'users' && renderUsers()}
               {activeTab === 'slider' && renderSlider()}
           </div>
       </main>
    </div>
  );
};