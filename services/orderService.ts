import { Order, CartItem, User } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';
import { logService } from './logService';

export const orderService = {
  async createOrder(user: User, items: CartItem[], total: number): Promise<Order> {
    if (CONFIG.USE_MOCK_API) {
        await delay(1000);
        const orders = getStorage<Order[]>(DB.ORDERS, []);
        const newOrder: Order = {
            id: `MV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            userId: user.id,
            date: new Date().toLocaleDateString('tr-TR'),
            status: 'Hazırlanıyor',
            total: total,
            items: items.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            }))
        };
        orders.unshift(newOrder);
        setStorage(DB.ORDERS, orders);

        // LOG: Yeni Sipariş
        await logService.addLog('success', 'Yeni Sipariş', `Sipariş No: ${newOrder.id} - Tutar: ₺${total}`);

        return newOrder;
    } else {
        // REAL BACKEND
        const orderData = {
            userId: user.id,
            total: total,
            items: items.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            }))
        };
        
        const response = await fetch(`${CONFIG.API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        // Backend kullanırken de frontend logunu güncelle (Mock mode ile uyumlu olması için)
        if(CONFIG.USE_MOCK_API) {
            await logService.addLog('success', 'Yeni Sipariş', `Tutar: ₺${total}`);
        }
        return result;
    }
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    if (CONFIG.USE_MOCK_API) {
        await delay(500);
        const allOrders = getStorage<Order[]>(DB.ORDERS, []);
        return allOrders.filter(order => order.userId === userId);
    } else {
        // REAL BACKEND
        const response = await fetch(`${CONFIG.API_URL}/orders?userId=${userId}`);
        if (!response.ok) return [];
        return await response.json();
    }
  }
};