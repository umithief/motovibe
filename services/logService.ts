
import { ActivityLog } from '../types';
import { DB, getStorage, setStorage } from './db';

export const logService = {
  async addLog(type: ActivityLog['type'], event: string, details: string): Promise<void> {
    // Mevcut logları al
    const logs = getStorage<ActivityLog[]>(DB.LOGS, []);
    
    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      event,
      details,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };

    // En başa ekle
    logs.unshift(newLog);

    // Sadece son 50 logu tut (Hafıza şişmesin)
    const trimmedLogs = logs.slice(0, 50);
    
    setStorage(DB.LOGS, trimmedLogs);
  },

  async getLogs(): Promise<ActivityLog[]> {
    // Mock ortamında localStorage'dan çek
    const logs = getStorage<ActivityLog[]>(DB.LOGS, []);
    
    // Eğer hiç log yoksa başlangıç için birkaç tane ekle (Panel boş görünmesin)
    if (logs.length === 0) {
        const initialLogs: ActivityLog[] = [
            { id: 'SYS-INIT', type: 'info', event: 'Sistem Başlatıldı', details: 'MotoVibe v1.0 Online', time: '09:00', timestamp: Date.now() - 100000 },
            { id: 'SYS-CHK', type: 'success', event: 'Veritabanı Bağlantısı', details: 'Bağlantı stabil', time: '09:01', timestamp: Date.now() - 90000 }
        ];
        setStorage(DB.LOGS, initialLogs);
        return initialLogs;
    }
    
    return logs;
  },
  
  async clearLogs(): Promise<void> {
      setStorage(DB.LOGS, []);
  }
};
