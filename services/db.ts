// Bu dosya gerçek bir veritabanını simüle eder.
// Verileri LocalStorage'da tutar.

const DB_KEYS = {
  USERS: 'mv_users',
  ORDERS: 'mv_orders',
  SESSION: 'mv_session',
  FORUM_TOPICS: 'mv_forum_topics',
  PRODUCTS: 'mv_products', // Yeni: Dinamik ürün yönetimi için
  SLIDES: 'mv_slides', // Yeni: Slider yönetimi için
  LOGS: 'mv_system_logs', // Yeni: Sistem aktiviteleri için
  VISITOR_STATS: 'mv_visitor_stats', // Yeni: Ziyaretçi istatistikleri
  ANALYTICS: 'mv_analytics_events' // Yeni: Detaylı analiz verileri
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Storage read error', e);
    return defaultValue;
  }
};

export const setStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error', e);
  }
};

export const DB = {
  USERS: DB_KEYS.USERS,
  ORDERS: DB_KEYS.ORDERS,
  SESSION: DB_KEYS.SESSION,
  FORUM_TOPICS: DB_KEYS.FORUM_TOPICS,
  PRODUCTS: DB_KEYS.PRODUCTS,
  SLIDES: DB_KEYS.SLIDES,
  LOGS: DB_KEYS.LOGS,
  VISITOR_STATS: DB_KEYS.VISITOR_STATS,
  ANALYTICS: DB_KEYS.ANALYTICS
};