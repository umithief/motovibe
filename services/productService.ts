
import { Product } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import { CONFIG } from './config';

export const productService = {
  async getProducts(): Promise<Product[]> {
    if (CONFIG.USE_MOCK_API) {
        const storedProducts = getStorage<Product[]>(DB.PRODUCTS, []);
        if (storedProducts.length === 0) {
            setStorage(DB.PRODUCTS, INITIAL_PRODUCTS);
            return INITIAL_PRODUCTS;
        }
        return storedProducts;
    } else {
        // REAL BACKEND
        try {
            const response = await fetch(`${CONFIG.API_URL}/products`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch products:", error);
            // Hata durumunda uygulamanın çökmesini engellemek için boş dizi veya varsayılan ürünleri dön
            return INITIAL_PRODUCTS;
        }
    }
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    if (CONFIG.USE_MOCK_API) {
        await delay(500);
        const products = getStorage<Product[]>(DB.PRODUCTS, []);
        const newProduct: Product = {
            ...product,
            id: Date.now(),
        };
        products.unshift(newProduct);
        setStorage(DB.PRODUCTS, products);
        return newProduct;
    } else {
        // REAL BACKEND
        const response = await fetch(`${CONFIG.API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        return await response.json();
    }
  },

  async deleteProduct(id: number): Promise<void> {
    if (CONFIG.USE_MOCK_API) {
        await delay(300);
        const products = getStorage<Product[]>(DB.PRODUCTS, []);
        const filtered = products.filter(p => p.id !== id);
        setStorage(DB.PRODUCTS, filtered);
    } else {
        // REAL BACKEND
        await fetch(`${CONFIG.API_URL}/products/${id}`, {
            method: 'DELETE'
        });
    }
  },

  async updateProduct(product: Product): Promise<void> {
    if (CONFIG.USE_MOCK_API) {
        await delay(300);
        const products = getStorage<Product[]>(DB.PRODUCTS, []);
        const index = products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            products[index] = product;
            setStorage(DB.PRODUCTS, products);
        }
    } else {
        // REAL BACKEND
        await fetch(`${CONFIG.API_URL}/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
    }
  }
};
