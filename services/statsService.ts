import { VisitorStats, AnalyticsEvent, AnalyticsDashboardData, TimeRange } from '../types';
import { DB, getStorage, setStorage } from './db';
import { CONFIG } from './config';

export const statsService = {
  async recordVisit(): Promise<void> {
    // Oturum süresince tekrar saymayı engellemek için sessionStorage kullanıyoruz
    if (sessionStorage.getItem('mv_visit_recorded')) {
      return;
    }

    if (CONFIG.USE_MOCK_API) {
      const stats = getStorage<{ date: string; count: number }[]>(DB.VISITOR_STATS, []);
      const today = new Date().toLocaleDateString('tr-TR');
      
      const todayEntryIndex = stats.findIndex(s => s.date === today);
      
      if (todayEntryIndex >= 0) {
        stats[todayEntryIndex].count += 1;
      } else {
        stats.push({ date: today, count: 1 });
      }
      
      setStorage(DB.VISITOR_STATS, stats);
      sessionStorage.setItem('mv_visit_recorded', 'true');
    } else {
      // REAL BACKEND
      try {
        await fetch(`${CONFIG.API_URL}/stats/visit`, { method: 'POST' });
        sessionStorage.setItem('mv_visit_recorded', 'true');
      } catch (e) {
        console.error('Visit record failed', e);
      }
    }
  },

  async getVisitorStats(): Promise<VisitorStats> {
    if (CONFIG.USE_MOCK_API) {
      const stats = getStorage<{ date: string; count: number }[]>(DB.VISITOR_STATS, []);
      const today = new Date().toLocaleDateString('tr-TR');
      
      const totalVisits = stats.reduce((sum, item) => sum + item.count, 0);
      const todayEntry = stats.find(s => s.date === today);
      
      return {
        totalVisits: totalVisits,
        todayVisits: todayEntry ? todayEntry.count : 0
      };
    } else {
      // REAL BACKEND
      try {
        const response = await fetch(`${CONFIG.API_URL}/stats`);
        if (!response.ok) return { totalVisits: 0, todayVisits: 0 };
        return await response.json();
      } catch (e) {
        return { totalVisits: 0, todayVisits: 0 };
      }
    }
  },

  // --- ADVANCED ANALYTICS ---

  async trackEvent(type: AnalyticsEvent['type'], data: { productId?: number; productName?: string; userId?: string; userName?: string; duration?: number }): Promise<void> {
      const event: AnalyticsEvent = {
          id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type,
          timestamp: Date.now(),
          date: new Date().toLocaleDateString('tr-TR'),
          ...data,
          userId: data.userId || 'guest'
      };

      if (CONFIG.USE_MOCK_API) {
          const events = getStorage<AnalyticsEvent[]>(DB.ANALYTICS, []);
          events.push(event);
          // Son 2000 eventi tut
          if (events.length > 2000) events.shift();
          setStorage(DB.ANALYTICS, events);
      } else {
          // REAL BACKEND
          try {
              await fetch(`${CONFIG.API_URL}/analytics/event`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(event)
              });
          } catch (e) {
              console.error('Tracking failed', e);
          }
      }
  },

  async getAnalyticsDashboard(range: TimeRange = '7d'): Promise<AnalyticsDashboardData> {
      if (CONFIG.USE_MOCK_API) {
          const allEvents = getStorage<AnalyticsEvent[]>(DB.ANALYTICS, []);
          
          // 1. Filter by Time Range
          const now = Date.now();
          let startTime = 0;
          
          if (range === '24h') startTime = now - (24 * 60 * 60 * 1000);
          else if (range === '7d') startTime = now - (7 * 24 * 60 * 60 * 1000);
          else if (range === '30d') startTime = now - (30 * 24 * 60 * 60 * 1000);

          const events = allEvents.filter(e => e.timestamp >= startTime);

          // 2. Aggregate Totals
          const productViews: Record<string, number> = {};
          const productAdds: Record<string, number> = {};
          let totalProductViews = 0;
          let totalAddToCart = 0;
          let totalCheckouts = 0;
          let totalDuration = 0;
          let durationCount = 0;

          events.forEach(e => {
              if (e.type === 'view_product') {
                  totalProductViews++;
                  if (e.productName) {
                      productViews[e.productName] = (productViews[e.productName] || 0) + 1;
                  }
              } else if (e.type === 'add_to_cart') {
                  totalAddToCart++;
                  if (e.productName) {
                      productAdds[e.productName] = (productAdds[e.productName] || 0) + 1;
                  }
              } else if (e.type === 'checkout_start') {
                  totalCheckouts++;
              } else if (e.type === 'session_duration' && e.duration) {
                  totalDuration += e.duration;
                  durationCount++;
              }
          });

          // 3. Build Timeline Data
          let activityTimeline: { label: string; value: number }[] = [];

          if (range === '24h') {
             // Group by Hour
             const hours = new Array(24).fill(0);
             const currentHour = new Date().getHours();
             
             // Initialize with labels for last 24h
             activityTimeline = Array.from({length: 12}, (_, i) => {
                const h = (currentHour - 11 + i + 24) % 24;
                return { label: `${h}:00`, value: 0 };
             });

             events.forEach(e => {
                const date = new Date(e.timestamp);
                const hour = date.getHours();
                const label = `${hour}:00`;
                const bucket = activityTimeline.find(b => b.label === label);
                if (bucket) bucket.value++;
             });

          } else {
             // Group by Day (7d or 30d)
             const daysMap = new Map<string, number>();
             const daysCount = range === '7d' ? 7 : 30;
             
             // Init last X days
             for (let i = daysCount - 1; i >= 0; i--) {
                 const d = new Date(now - (i * 24 * 60 * 60 * 1000));
                 const label = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }); // 15 May
                 activityTimeline.push({ label, value: 0 });
             }

             events.forEach(e => {
                const d = new Date(e.timestamp);
                const label = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
                const bucket = activityTimeline.find(b => b.label === label);
                if (bucket) bucket.value++;
             });
          }

          const topViewedProducts = Object.entries(productViews)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);

          const topAddedProducts = Object.entries(productAdds)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);

          const avgSessionDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

          return {
              totalProductViews,
              totalAddToCart,
              totalCheckouts,
              avgSessionDuration,
              topViewedProducts,
              topAddedProducts,
              activityTimeline
          };

      } else {
          // REAL BACKEND
          try {
              const response = await fetch(`${CONFIG.API_URL}/analytics/dashboard?range=${range}`);
              if (!response.ok) throw new Error('Failed');
              return await response.json();
          } catch (e) {
              return {
                  totalProductViews: 0,
                  totalAddToCart: 0,
                  totalCheckouts: 0,
                  avgSessionDuration: 0,
                  topViewedProducts: [],
                  topAddedProducts: [],
                  activityTimeline: []
              };
          }
      }
  }
};