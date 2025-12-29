import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/motovibe';

// Middleware
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// GÖRSEL YÜKLEME AYARI (ÖNEMLİ)
// Base64 formatındaki resimler büyük yer kaplar.
// Limiti 50MB'a çıkararak "Payload Too Large" hatasını engelliyoruz.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- MONGODB MODELS ---

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  joinDate: { type: String, default: () => new Date().toLocaleDateString('tr-TR') },
  phone: String,
  address: String
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  image: String, // Ana Resim
  images: [String], // Galeri Resimleri (Base64 stringleri burada tutulur)
  rating: { type: Number, default: 0 },
  features: [String]
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, default: () => new Date().toLocaleDateString('tr-TR') },
  status: { type: String, default: 'Hazırlanıyor' },
  total: Number,
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }]
});
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

const slideSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: String,
    cta: { type: String, default: 'İNCELE' },
    action: { type: String, default: 'shop' }
});
const Slide = mongoose.models.Slide || mongoose.model('Slide', slideSchema);

const visitorSchema = new mongoose.Schema({
  date: { type: String, required: true }, // 'DD.MM.YYYY'
  count: { type: Number, default: 0 }
});
const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);

const analyticsSchema = new mongoose.Schema({
  type: { type: String, required: true }, // view_product, add_to_cart, checkout_start, session_duration
  userId: String,
  userName: String,
  productId: Number,
  productName: String,
  duration: Number,
  timestamp: { type: Number, default: Date.now },
  date: { type: String, default: () => new Date().toLocaleDateString('tr-TR') }
});
const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@motovibe.tr';
    const adminPassword = 'admin123'; // In a real app, use environment variable

    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      console.log('⚠️ Admin kullanıcısı bulunamadı. Oluşturuluyor...');
      adminUser = new User({
        name: 'MotoVibe Admin',
        email: adminEmail,
        password: adminPassword,
        isAdmin: true,
        joinDate: '01.01.2024',
        address: 'HQ'
      });
      await adminUser.save();
      console.log('✅ Admin kullanıcısı oluşturuldu: admin@motovibe.tr');
    } else {
        if (!adminUser.isAdmin) {
            adminUser.isAdmin = true;
            await adminUser.save();
            console.log('✅ Mevcut admin kullanıcısının yetkisi güncellendi.');
        }
    }
  } catch (error) {
    console.error('Admin seed hatası:', error);
  }
};

// --- ROUTES ---

// 1. Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı.' });

    const newUser = new User({ name, email, password });
    await newUser.save();

    const userObj = newUser.toObject();
    delete userObj.password;
    
    res.status(201).json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası: Kayıt yapılamadı.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) return res.status(400).json({ message: 'Hatalı e-posta veya şifre.' });

    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası: Giriş yapılamadı.' });
  }
});

// 2. Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    console.log('Yeni ürün ekleniyor...');
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Ürün ekleme hatası:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ürün silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Order Routes
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    if (userId) query = { userId };
    
    const orders = await Order.find(query).sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Slide Routes
app.get('/api/slides', async (req, res) => {
    try {
        const slides = await Slide.find();
        res.json(slides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/slides', async (req, res) => {
    try {
        const newSlide = new Slide(req.body);
        await newSlide.save();
        res.status(201).json(newSlide);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/slides/:id', async (req, res) => {
    try {
        const updatedSlide = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSlide);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/slides/:id', async (req, res) => {
    try {
        await Slide.findByIdAndDelete(req.params.id);
        res.json({ message: 'Slide silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. Stats Routes
app.post('/api/stats/visit', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('tr-TR');
    let visitor = await Visitor.findOne({ date: today });
    
    if (visitor) {
      visitor.count += 1;
    } else {
      visitor = new Visitor({ date: today, count: 1 });
    }
    await visitor.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('tr-TR');
    const allVisits = await Visitor.find();
    
    const totalVisits = allVisits.reduce((sum, v) => sum + v.count, 0);
    const todayEntry = allVisits.find(v => v.date === today);
    const todayVisits = todayEntry ? todayEntry.count : 0;

    res.json({ totalVisits, todayVisits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. Analytics Routes
app.post('/api/analytics/event', async (req, res) => {
    try {
        const event = new Analytics(req.body);
        await event.save();
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/analytics/dashboard', async (req, res) => {
    try {
        const { range } = req.query;
        const now = Date.now();
        let startTime = 0;
        
        if (range === '24h') startTime = now - (24 * 60 * 60 * 1000);
        else if (range === '7d') startTime = now - (7 * 24 * 60 * 60 * 1000);
        else if (range === '30d') startTime = now - (30 * 24 * 60 * 60 * 1000);
        
        const events = await Analytics.find({ timestamp: { $gte: startTime } });
        
        // Aggregation Logic
        const productViews = {};
        const productAdds = {};
        let totalProductViews = 0;
        let totalAddToCart = 0;
        let totalCheckouts = 0;
        let totalDuration = 0;
        let durationCount = 0;

        // Timeline logic
        let activityTimeline = [];
        if (range === '24h') {
            const currentHour = new Date().getHours();
            activityTimeline = Array.from({length: 12}, (_, i) => {
                const h = (currentHour - 11 + i + 24) % 24;
                return { label: `${h}:00`, value: 0 };
            });
            events.forEach(e => {
                const h = new Date(e.timestamp).getHours();
                const label = `${h}:00`;
                const bucket = activityTimeline.find(b => b.label === label);
                if(bucket) bucket.value++;
            });
        } else {
             const daysCount = range === '7d' ? 7 : 30;
             for (let i = daysCount - 1; i >= 0; i--) {
                 const d = new Date(now - (i * 24 * 60 * 60 * 1000));
                 const label = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
                 activityTimeline.push({ label, value: 0 });
             }
             events.forEach(e => {
                 const d = new Date(e.timestamp);
                 const label = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
                 const bucket = activityTimeline.find(b => b.label === label);
                 if(bucket) bucket.value++;
             });
        }

        events.forEach(e => {
            if (e.type === 'view_product') {
                totalProductViews++;
                if (e.productName) productViews[e.productName] = (productViews[e.productName] || 0) + 1;
            } else if (e.type === 'add_to_cart') {
                totalAddToCart++;
                if (e.productName) productAdds[e.productName] = (productAdds[e.productName] || 0) + 1;
            } else if (e.type === 'checkout_start') {
                totalCheckouts++;
            } else if (e.type === 'session_duration' && e.duration) {
                totalDuration += e.duration;
                durationCount++;
            }
        });

        const topViewedProducts = Object.entries(productViews)
            .map(([name, count]) => ({ name, count: count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topAddedProducts = Object.entries(productAdds)
            .map(([name, count]) => ({ name, count: count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const avgSessionDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

        res.json({
            totalProductViews,
            totalAddToCart,
            totalCheckouts,
            avgSessionDuration,
            topViewedProducts,
            topAddedProducts,
            activityTimeline
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// --- START SERVER ---
console.log('Sunucu başlatılıyor...');

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB bağlantısı başarılı');
    await seedAdmin();
    app.listen(PORT, () => console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB bağlantı hatası:', err.message);
    console.log('⚠️  Lütfen MongoDB uygulamasının çalıştığından emin olun.');
  });