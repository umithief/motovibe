import React, { useState, useEffect } from 'react';
import { User, Package, Settings, Bike, MapPin, Phone, Mail, Shield, LogOut, Edit2, ShoppingBag, ShieldAlert, Plus, X, Trash2, Gauge, Calendar, Droplets } from 'lucide-react';
import { User as UserType, Order, ViewState } from '../types';
import { Button } from './Button';
import { orderService } from '../services/orderService';

interface UserProfileProps {
  user: UserType;
  onLogout: () => void;
  onNavigate: (view: ViewState) => void;
}

type Tab = 'profile' | 'orders' | 'garage' | 'settings';

interface UserBike {
  id: number;
  brand: string;
  model: string;
  year: string;
  km: string;
  color: string;
  image: string;
}

const POPULAR_BRANDS = [
    { name: 'Yamaha', image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop' },
    { name: 'Honda', image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?q=80&w=800&auto=format&fit=crop' },
    { name: 'Ducati', image: 'https://images.unsplash.com/photo-1614163830626-54c262997154?q=80&w=800&auto=format&fit=crop' },
    { name: 'Kawasaki', image: 'https://images.unsplash.com/photo-1558980394-a3099ed53abb?q=80&w=800&auto=format&fit=crop' },
    { name: 'BMW', image: 'https://images.unsplash.com/photo-1625043484555-2b3015b6445d?q=80&w=800&auto=format&fit=crop' },
    { name: 'Harley-Davidson', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c3d?q=80&w=800&auto=format&fit=crop' },
    { name: 'Diğer', image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=800&auto=format&fit=crop' }
];

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Garage State
  const [myBikes, setMyBikes] = useState<UserBike[]>([
    {
        id: 1,
        brand: 'Yamaha',
        model: 'MT-07',
        year: '2023',
        km: '12.450',
        color: 'Gece Siyahı',
        image: POPULAR_BRANDS[0].image
    }
  ]);
  const [isAddBikeModalOpen, setIsAddBikeModalOpen] = useState(false);
  const [newBike, setNewBike] = useState<Partial<UserBike>>({ brand: 'Yamaha', model: '', year: '', km: '', color: '' });

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const userOrders = await orderService.getUserOrders(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error("Siparişler alınamadı", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAddBike = (e: React.FormEvent) => {
      e.preventDefault();
      const brandImage = POPULAR_BRANDS.find(b => b.name === newBike.brand)?.image || POPULAR_BRANDS[6].image;
      
      const bikeToAdd: UserBike = {
          id: Date.now(),
          brand: newBike.brand || 'Diğer',
          model: newBike.model || 'Bilinmiyor',
          year: newBike.year || '2024',
          km: newBike.km || '0',
          color: newBike.color || 'Siyah',
          image: brandImage
      };

      setMyBikes([...myBikes, bikeToAdd]);
      setIsAddBikeModalOpen(false);
      setNewBike({ brand: 'Yamaha', model: '', year: '', km: '', color: '' });
  };

  const handleDeleteBike = (id: number) => {
      if (confirm('Bu motoru garajından çıkarmak istediğine emin misin?')) {
          setMyBikes(myBikes.filter(b => b.id !== id));
      }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Kişisel Bilgiler</h3>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit2 className="w-4 h-4" /> Düzenle
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3 mb-2 text-gray-400">
                  <User className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">Ad Soyad</span>
                </div>
                <div className="text-white text-lg font-medium">{user.name}</div>
              </div>

              <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3 mb-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">E-posta</span>
                </div>
                <div className="text-white text-lg font-medium">{user.email}</div>
              </div>

              <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3 mb-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">Telefon</span>
                </div>
                <div className="text-white text-lg font-medium">{user.phone || '+90 555 123 45 67'}</div>
              </div>

              <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3 mb-2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">Adres</span>
                </div>
                <div className="text-white text-lg font-medium">{user.address || 'Kadıköy, İstanbul'}</div>
              </div>
            </div>

            <div className="bg-moto-accent/10 p-6 rounded-xl border border-moto-accent/20 flex items-start gap-4 mt-6">
              <Shield className="w-8 h-8 text-moto-accent flex-shrink-0" />
              <div>
                <h4 className="text-white font-bold mb-1">MotoVibe Üye</h4>
                <p className="text-gray-400 text-sm">Üyeliğiniz aktiftir. Kayıt tarihi: {user.joinDate}</p>
              </div>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
             <h3 className="text-2xl font-bold text-white">Sipariş Geçmişi</h3>
             
             {loadingOrders ? (
               <div className="flex items-center justify-center py-12">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moto-accent"></div>
               </div>
             ) : orders.length === 0 ? (
               <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-800 border-dashed">
                 <ShoppingBag className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                 <h4 className="text-lg font-medium text-white mb-2">Henüz siparişiniz yok</h4>
                 <p className="text-gray-400 text-sm">Mağazadan ilk siparişinizi verin.</p>
               </div>
             ) : (
               <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors">
                      <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gray-800/50">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                           <div>
                              <div className="text-xs text-gray-400 uppercase">Sipariş No</div>
                              <div className="text-white font-mono">{order.id}</div>
                           </div>
                           <div>
                              <div className="text-xs text-gray-400 uppercase">Tarih</div>
                              <div className="text-white">{order.date}</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                             order.status === 'Teslim Edildi' ? 'bg-green-900/30 text-green-400 border border-green-900' : 
                             order.status === 'Kargoda' ? 'bg-blue-900/30 text-blue-400 border border-blue-900' : 
                             'bg-yellow-900/30 text-yellow-400 border border-yellow-900'
                           }`}>
                             {order.status}
                           </span>
                           <span className="text-lg font-bold text-white">₺{order.total.toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                      <div className="p-4">
                         {order.items.map((item, idx) => (
                           <div key={idx} className="flex items-center gap-3 text-gray-300 text-sm mb-2 last:mb-0">
                              <div className="w-8 h-8 rounded bg-gray-700 overflow-hidden">
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-moto-accent font-bold">{item.quantity}x</span>
                              <span>{item.name}</span>
                           </div>
                         ))}
                      </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        );

      case 'garage':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
               <h3 className="text-2xl font-bold text-white">Garajım</h3>
               <Button size="sm" onClick={() => setIsAddBikeModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Motor Ekle
               </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bike Cards */}
              {myBikes.map(bike => (
                  <div key={bike.id} className="group relative bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-moto-accent/50 transition-all shadow-lg hover:shadow-moto-accent/10">
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <button 
                            onClick={() => handleDeleteBike(bike.id)}
                            className="p-1.5 bg-black/50 rounded-full text-gray-400 hover:text-red-500 hover:bg-black transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="absolute top-4 left-4 z-20">
                       <span className="bg-moto-accent text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg border border-moto-accent/50 backdrop-blur-sm">AKTİF</span>
                    </div>

                    <div className="h-48 overflow-hidden bg-gray-900 relative">
                        <img 
                            src={bike.image} 
                            alt={bike.model} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <h4 className="text-xl font-bold text-white">{bike.brand} {bike.model}</h4>
                                <p className="text-gray-400 text-sm">{bike.year} Model • {bike.color}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 my-4">
                            <div className="bg-gray-900/50 p-2.5 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase font-bold mb-1">
                                    <Gauge className="w-3 h-3" /> KM
                                </div>
                                <div className="text-sm text-white font-mono font-medium">{bike.km}</div>
                            </div>
                            <div className="bg-gray-900/50 p-2.5 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase font-bold mb-1">
                                    <Calendar className="w-3 h-3" /> Bakım
                                </div>
                                <div className="text-sm text-white font-mono font-medium">3 Ay Önce</div>
                            </div>
                            <div className="bg-gray-900/50 p-2.5 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase font-bold mb-1">
                                    <Droplets className="w-3 h-3" /> Yağ
                                </div>
                                <div className="text-sm text-green-400 font-medium">İyi</div>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full text-xs border-gray-600 hover:border-moto-accent hover:text-moto-accent">Bakım Kaydı Ekle</Button>
                    </div>
                  </div>
              ))}

              {/* Add New Placeholder */}
              <div 
                onClick={() => setIsAddBikeModalOpen(true)}
                className="border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center p-8 text-gray-500 hover:border-moto-accent hover:text-moto-accent hover:bg-moto-accent/5 transition-all cursor-pointer bg-gray-800/20 min-h-[350px]"
              >
                 <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 group-hover:border-moto-accent flex items-center justify-center mb-4 transition-colors">
                    <Plus className="w-8 h-8" />
                 </div>
                 <h4 className="font-bold mb-1">Yeni Motor Ekle</h4>
                 <p className="text-sm text-center max-w-xs text-gray-600">Garajına yeni bir canavar ekle ve ona uygun aksesuarları keşfet.</p>
              </div>
            </div>

            {/* Add Bike Modal */}
            {isAddBikeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddBikeModalOpen(false)}></div>
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md relative animate-in zoom-in-95 duration-200 shadow-2xl">
                        <button onClick={() => setIsAddBikeModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-moto-accent/10 rounded-lg">
                                <Bike className="w-6 h-6 text-moto-accent" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Garaja Motor Ekle</h3>
                        </div>

                        <form onSubmit={handleAddBike} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Marka</label>
                                <select 
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent outline-none"
                                    value={newBike.brand}
                                    onChange={(e) => setNewBike({...newBike, brand: e.target.value})}
                                >
                                    {POPULAR_BRANDS.map(b => (
                                        <option key={b.name} value={b.name}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Model</label>
                                <input 
                                    type="text" 
                                    placeholder="Örn: MT-07, CBR650R"
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent outline-none"
                                    value={newBike.model}
                                    onChange={(e) => setNewBike({...newBike, model: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Yıl</label>
                                    <input 
                                        type="number" 
                                        placeholder="2024"
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent outline-none"
                                        value={newBike.year}
                                        onChange={(e) => setNewBike({...newBike, year: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">KM</label>
                                    <input 
                                        type="text" 
                                        placeholder="15000"
                                        className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent outline-none"
                                        value={newBike.km}
                                        onChange={(e) => setNewBike({...newBike, km: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Renk</label>
                                <input 
                                    type="text" 
                                    placeholder="Örn: Kırmızı, Mat Siyah"
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-moto-accent outline-none"
                                    value={newBike.color}
                                    onChange={(e) => setNewBike({...newBike, color: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" variant="primary" className="w-full py-3">GARAJA EKLE</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-2xl font-bold text-white">Hesap Ayarları</h3>
            
            <div className="bg-gray-800 rounded-xl border border-gray-700 divide-y divide-gray-700">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Bildirimler</h4>
                  <p className="text-sm text-gray-400">Kampanya ve sipariş bildirimlerini al.</p>
                </div>
                <div className="w-11 h-6 bg-moto-accent rounded-full relative cursor-pointer">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
                </div>
              </div>
              
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Bülten Aboneliği</h4>
                  <p className="text-sm text-gray-400">Haftalık motosiklet bültenine abone ol.</p>
                </div>
                <div className="w-11 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                   <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
                </div>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">İki Adımlı Doğrulama</h4>
                  <p className="text-sm text-gray-400">Hesabını ekstra güvenli hale getir.</p>
                </div>
                 <Button variant="outline" size="sm">Aktifleştir</Button>
              </div>
            </div>

            <div className="pt-6">
               <h4 className="text-red-500 font-bold mb-4 text-sm uppercase tracking-wider">Tehlikeli Bölge</h4>
               <Button variant="outline" className="border-red-900 text-red-500 hover:bg-red-900/20 hover:border-red-800 hover:text-red-400 w-full sm:w-auto justify-start">
                  Hesabımı Sil
               </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 sticky top-24">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-moto-accent flex items-center justify-center text-4xl font-bold text-white mb-4 ring-4 ring-gray-800 shadow-xl">
                {user.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-white text-center">{user.name}</h2>
              <p className="text-sm text-gray-400">Motosiklet Tutkunu</p>
            </div>

            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-moto-accent text-white shadow-lg shadow-moto-accent/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <User className="w-5 h-5" />
                <span>Profilim</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-moto-accent text-white shadow-lg shadow-moto-accent/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <Package className="w-5 h-5" />
                <span>Siparişlerim</span>
              </button>

              <button 
                onClick={() => setActiveTab('garage')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'garage' ? 'bg-moto-accent text-white shadow-lg shadow-moto-accent/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <Bike className="w-5 h-5" />
                <span>Garajım</span>
              </button>

              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-moto-accent text-white shadow-lg shadow-moto-accent/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <Settings className="w-5 h-5" />
                <span>Ayarlar</span>
              </button>

              {/* Admin Link */}
              {user.isAdmin && (
                 <div className="pt-4 mt-4 border-t border-gray-800">
                    <button 
                        onClick={() => onNavigate('admin_panel')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-moto-accent border border-moto-accent/30 hover:bg-moto-accent hover:text-white transition-all font-bold shadow-lg shadow-moto-accent/10"
                    >
                        <ShieldAlert className="w-5 h-5" />
                        <span>Yönetici Paneli</span>
                    </button>
                 </div>
              )}

              <div className={`pt-2 ${!user.isAdmin && 'mt-4 border-t border-gray-800'}`}>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-900/20 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-gray-900 rounded-2xl p-6 sm:p-10 border border-gray-800 min-h-[600px]">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};