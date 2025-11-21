import React, { useState } from 'react';
import { X, User, Mail, Lock, ArrowRight, AlertCircle, Check, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from './Button';
import { AuthMode, User as UserType } from '../types';
import { authService } from '../services/auth';
import { delay } from '../services/db';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: AuthMode;
  onLogin: (user: UserType) => void;
}

type ViewMode = 'login' | 'register' | 'forgot_password';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode, onLogin }) => {
  const [view, setView] = useState<ViewMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Şifre Sıfırlama Senaryosu
      if (view === 'forgot_password') {
        if (!formData.email) throw new Error('Lütfen e-posta adresinizi girin.');
        
        // Simülasyon
        await delay(1500);
        setSuccessMsg('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
        setIsLoading(false);
        return;
      }

      let user: UserType;

      if (view === 'register') {
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error('Lütfen tüm alanları doldurun.');
        }
        user = await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      } else {
        // Login
        if (!formData.email || !formData.password) {
          throw new Error('Lütfen e-posta ve şifrenizi girin.');
        }
        user = await authService.login(formData.email, formData.password, rememberMe);
      }

      onLogin(user);
      onClose();
      // Formu temizle
      setFormData({ name: '', email: '', password: '' });
      setRememberMe(false);
      setView('login');
      
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      if (view !== 'forgot_password') setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const renderHeader = () => {
    if (view === 'forgot_password') {
      return (
        <div className="flex items-center border-b border-gray-800 p-4">
           <button onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }} className="text-gray-400 hover:text-white mr-4">
              <ArrowLeft className="w-5 h-5" />
           </button>
           <h3 className="text-white font-bold">Şifremi Unuttum</h3>
           <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
           </button>
        </div>
      );
    }

    return (
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => { setView('login'); setError(null); }}
          className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
            view === 'login' 
              ? 'bg-gray-900 text-moto-accent border-b-2 border-moto-accent' 
              : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Giriş Yap
        </button>
        <button
          onClick={() => { setView('register'); setError(null); }}
          className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
            view === 'register' 
              ? 'bg-gray-900 text-moto-accent border-b-2 border-moto-accent' 
              : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Kayıt Ol
        </button>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        </div>

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>
        
        <div className="inline-block align-bottom bg-gray-900 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full border border-gray-800">
          
          {renderHeader()}

          {/* Form Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              {view === 'forgot_password' ? (
                <>
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                     <KeyRound className="w-8 h-8 text-moto-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Şifre Yenileme</h3>
                  <p className="text-gray-400 text-sm">
                    Hesabınıza ait e-posta adresini girin, size sıfırlama bağlantısı gönderelim.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {view === 'login' ? 'Tekrar Hoşgeldin!' : 'Aramıza Katıl'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {view === 'login' 
                      ? 'Sürüş keyfine kaldığın yerden devam et.' 
                      : 'MotoVibe dünyasının avantajlarını keşfet.'}
                  </p>
                </>
              )}
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-900/30 border border-red-900 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-3 bg-green-900/30 border border-green-900 rounded-lg flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-200">{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'register' && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    required={view === 'register'}
                    placeholder="Adın Soyadın"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl leading-5 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-moto-accent focus:border-moto-accent transition-all sm:text-sm"
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  required
                  placeholder="E-posta Adresin"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl leading-5 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-moto-accent focus:border-moto-accent transition-all sm:text-sm"
                  onChange={handleChange}
                />
              </div>

              {view !== 'forgot_password' && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    required
                    placeholder="Şifren"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl leading-5 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-moto-accent focus:border-moto-accent transition-all sm:text-sm"
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Remember Me & Forgot Password Links */}
              {view === 'login' && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-moto-accent border-moto-accent' : 'border-gray-600 bg-gray-800 group-hover:border-gray-500'}`}>
                       {rememberMe && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                    />
                    <span className="text-gray-400 group-hover:text-white transition-colors">Beni Hatırla</span>
                  </label>
                  
                  <button type="button" onClick={() => setView('forgot_password')} className="text-gray-500 hover:text-moto-accent transition-colors">
                    Şifremi Unuttum
                  </button>
                </div>
              )}

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full justify-center" 
                  size="lg"
                  isLoading={isLoading}
                >
                  {isLoading ? 'İşleniyor...' : (
                    <span className="flex items-center gap-2">
                      {view === 'login' ? 'Giriş Yap' : view === 'register' ? 'Hesap Oluştur' : 'Bağlantı Gönder'}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
            
            {view !== 'forgot_password' && (
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Devam ederek <a href="#" className="text-moto-accent hover:underline">Kullanım Koşullarını</a> ve <a href="#" className="text-moto-accent hover:underline">Gizlilik Politikasını</a> kabul etmiş olursunuz.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};