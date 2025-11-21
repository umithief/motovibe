import { Product, ProductCategory, Slide, ViewState } from './types';

export const APP_NAME = "MotoVibe";

export const DEFAULT_SLIDES: Slide[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=1920&auto=format&fit=crop",
    title: "RIDE THE FUTURE",
    subtitle: "YAPAY ZEKA DESTEKLİ EKİPMAN SEÇİMİ İLE TANIŞIN.",
    cta: "ALIŞVERİŞE BAŞLA",
    action: 'shop' as ViewState
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?q=80&w=1920&auto=format&fit=crop",
    title: "CARBON & SPEED",
    subtitle: "PROFESYONELLER İÇİN GELİŞTİRİLMİŞ KASK KOLEKSİYONU.",
    cta: "KASKLARI GÖR",
    action: 'shop' as ViewState
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1547053265-a0c602077e65?q=80&w=1920&auto=format&fit=crop",
    title: "OFFROAD SPIRIT",
    subtitle: "SINIRLARI ZORLAYAN MACERALAR İÇİN HAZIR OL.",
    cta: "KEŞFET",
    action: 'shop' as ViewState
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "AeroSpeed Carbon Pro Kask",
    description: "Yüksek hız aerodinamiği için tasarlanmış ultra hafif karbon fiber kask. Maksimum görüş açısı ve gelişmiş havalandırma sistemi.",
    price: 8500,
    category: ProductCategory.HELMET,
    // AI Aesthetic: Dark, sleek, studio lighting, carbon fiber texture
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop"],
    rating: 4.8,
    features: ["Karbon Fiber Kabuk", "Pinlock Dahil", "Acil Durum Ped Çıkarma", "ECE 22.06 Sertifikalı"]
  },
  {
    id: 2,
    name: "Urban Rider Deri Mont",
    description: "Şehir içi sürüşler için şık ve korumalı deri mont. D3O korumalar ile maksimum güvenlik, vintage görünüm.",
    price: 5200,
    category: ProductCategory.JACKET,
    // AI Aesthetic: Moody lighting, leather texture, neon reflection
    image: "https://images.unsplash.com/photo-1559582930-bb01987cf4dd?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1559582930-bb01987cf4dd?q=80&w=800&auto=format&fit=crop"],
    rating: 4.6,
    features: ["%100 Gerçek Deri", "D3O Omuz ve Dirsek Koruma", "Termal İçlik", "Havalandırma Fermuarları"]
  },
  {
    id: 3,
    name: "StormChaser Su Geçirmez Eldiven",
    description: "Her türlü hava koşulunda ellerinizi kuru ve sıcak tutan Gore-Tex teknolojili touring eldiveni.",
    price: 1800,
    category: ProductCategory.GLOVES,
    // AI Aesthetic: Macro shot, water droplets, high contrast
    image: "https://images.unsplash.com/photo-1555481771-16417c6f656c?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1555481771-16417c6f656c?q=80&w=800&auto=format&fit=crop"], 
    rating: 4.5,
    features: ["Gore-Tex Membran", "Dokunmatik Ekran Uyumlu", "Avuç İçi Slider", "Uzun Bilek Yapısı"]
  },
  {
    id: 4,
    name: "Enduro Tech Adventure Bot",
    description: "Zorlu arazi koşulları ve uzun yolculuklar için tasarlanmış, dayanıklı ve konforlu adventure botu.",
    price: 6750,
    category: ProductCategory.BOOTS,
    // AI Aesthetic: Low angle, mud/dust particles, dramatic light
    image: "https://images.unsplash.com/photo-1555813456-96e25216239e?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1555813456-96e25216239e?q=80&w=800&auto=format&fit=crop"], 
    rating: 4.9,
    features: ["Su Geçirmez", "Kaymaz Taban", "TPU Kaval Kemiği Koruma", "Hızlı Bağlama Sistemi"]
  },
  {
    id: 5,
    name: "StreetFighter Tekstil Mont",
    description: "Sıcak havalar için file ağırlıklı, sürtünmeye dayanıklı tekstil mont. Sportif kesim.",
    price: 3400,
    category: ProductCategory.JACKET,
    // AI Aesthetic: Studio shot, armor details, red accents
    image: "https://images.unsplash.com/photo-1626847037657-fd3622613ce3?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1626847037657-fd3622613ce3?q=80&w=800&auto=format&fit=crop"],
    rating: 4.3,
    features: ["Mesh Paneller", "Reflektif Detaylar", "Sırt Koruma Cebi", "Ayarlanabilir Bel"]
  },
  {
    id: 6,
    name: "ProVision İnterkom Sistemi",
    description: "Grup sürüşleri için kristal netliğinde ses sağlayan, uzun menzilli Bluetooth interkom.",
    price: 2900,
    category: ProductCategory.ACCESSORY,
    // AI Aesthetic: High tech gadget, bokeh, neon light
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop"],
    rating: 4.7,
    features: ["1.2km Menzil", "4 Kişilik Konferans", "Gürültü Önleme", "Suya Dayanıklı"]
  },
  {
    id: 7,
    name: "Titanium Dizlik Koruması",
    description: "Ekstra güvenlik isteyenler için mafsallı ve titanyum destekli diz koruması.",
    price: 1200,
    category: ProductCategory.ACCESSORY,
    // AI Aesthetic: Metallic texture, robotic look
    image: "https://images.unsplash.com/photo-1584556966052-c229e215e03f?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1584556966052-c229e215e03f?q=80&w=800&auto=format&fit=crop"],
    rating: 4.4,
    features: ["Mafsallı Yapı", "Titanyum Plaka", "Rahat İç Ped", "Ayarlanabilir Bantlar"]
  },
  {
    id: 8,
    name: "Viper Sport Kask",
    description: "Agresif tasarımı ve rüzgar tüneli testi ile geliştirilmiş aerodinamik yapısı ile pist günleri için ideal.",
    price: 7200,
    category: ProductCategory.HELMET,
    // AI Aesthetic: Red helmet, speed motion blur or studio sharp
    image: "https://images.unsplash.com/photo-1614103121591-80d3012ce71d?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1614103121591-80d3012ce71d?q=80&w=800&auto=format&fit=crop"],
    rating: 4.7,
    features: ["Fiberglass Kompozit", "Double-D Bağlantı", "Geniş Görüş", "Anti-Bakteriyel İçlik"]
  },
  {
    id: 9,
    name: "ProMoto Seramik Zincir Yağı",
    description: "Yüksek hız ve zorlu hava koşullarına dayanıklı, sıçrama yapmayan özel formüllü seramik zincir yağı.",
    price: 450,
    category: ProductCategory.ACCESSORY,
    // AI Aesthetic: Macro mechanic shot, detailed metal textures, oily/slick look
    image: "https://images.unsplash.com/photo-1589210094065-a19f47447548?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1589210094065-a19f47447548?q=80&w=800&auto=format&fit=crop"],
    rating: 4.9,
    features: ["Seramik Kaplama", "Suya Dayanıklı", "O-Ring/X-Ring Uyumlu", "Uzun Ömürlü Koruma"]
  },
  {
    id: 10,
    name: "ThermoGrip Akıllı Elcik Isıtma",
    description: "Soğuk kış sürüşlerinde ellerinizi sıcak tutan, 5 kademeli ayarlanabilir, akü korumalı ısıtma sistemi.",
    price: 1650,
    category: ProductCategory.ACCESSORY,
    // AI Aesthetic: Cockpit view, warm tones contrast with dark background
    image: "https://images.unsplash.com/photo-1622185135505-2d795043ec63?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1622185135505-2d795043ec63?q=80&w=800&auto=format&fit=crop"],
    rating: 4.6,
    features: ["5 Isı Kademesi", "Hızlı Isınma Modu", "Su Geçirmez Kumanda", "Akü Voltaj Koruması"]
  },
  {
    id: 11,
    name: "MotoRescue Lastik Tamir Seti",
    description: "Yolda kalmamanız için tasarlanmış, CO2 tüplü ve fitilli kompakt tubeless lastik tamir kiti.",
    price: 780,
    category: ProductCategory.ACCESSORY,
    // AI Aesthetic: Tools on dark surface, tactical gear look, high contrast
    image: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?q=80&w=800&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?q=80&w=800&auto=format&fit=crop"],
    rating: 4.8,
    features: ["Tubeless Uyumlu", "3x CO2 Tüpü", "Kompakt Çanta", "Profesyonel Aletler"]
  }
];