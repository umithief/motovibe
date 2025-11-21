export enum ProductCategory {
  HELMET = 'Kask',
  JACKET = 'Mont',
  GLOVES = 'Eldiven',
  BOOTS = 'Bot',
  ACCESSORY = 'Aksesuar'
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string; // Ana resim (Geriye dönük uyumluluk için)
  images: string[]; // Galeri resimleri (Yeni)
  rating: number;
  features: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  joinDate: string;
  isAdmin?: boolean; // Admin yetkisi
}

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  status: 'Hazırlanıyor' | 'Kargoda' | 'Teslim Edildi' | 'İptal';
  total: number;
  items: OrderItem[];
}

export interface ForumComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  date: string;
  likes: number;
}

export interface ForumTopic {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: 'Genel' | 'Teknik' | 'Gezi' | 'Ekipman' | 'Etkinlik';
  date: string;
  likes: number;
  views: number;
  comments: ForumComment[];
  tags: string[];
}

export interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  action: ViewState;
}

export interface ActivityLog {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  event: string;
  details: string;
  time: string;
  timestamp: number;
}

export interface VisitorStats {
  totalVisits: number;
  todayVisits: number;
}

export interface AnalyticsEvent {
  id: string;
  type: 'view_product' | 'add_to_cart' | 'checkout_start' | 'session_duration';
  userId?: string; // 'guest' or user id
  userName?: string;
  productId?: number;
  productName?: string;
  duration?: number; // seconds (for session_duration)
  timestamp: number;
  date: string;
}

export type TimeRange = '24h' | '7d' | '30d';

export interface AnalyticsDashboardData {
  totalProductViews: number;
  totalAddToCart: number;
  totalCheckouts: number;
  avgSessionDuration: number; // seconds
  topViewedProducts: { name: string; count: number }[];
  topAddedProducts: { name: string; count: number }[];
  // Timeline data for charts
  activityTimeline: { label: string; value: number }[]; 
}

export type ViewState = 'home' | 'shop' | 'favorites' | 'product_detail' | 'cart' | 'ai_assistant' | 'profile' | 'about' | 'forum' | 'admin_panel';
export type AuthMode = 'login' | 'register';