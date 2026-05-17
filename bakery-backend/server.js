const express = require('express');
const cors = require('cors');
require('dotenv').config();
const validateEnv = require('./utils/validateEnv');
validateEnv();

const { getJwtSecret } = require('./utils/jwtSecret');

const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const pool = require('./config/db');

const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security Middleware
// app.use(helmet());
app.set('etag', false);
app.use(apiLimiter);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));


// CORS config
const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'https://hxh-bakery.vercel.app',
    'https://hxh-bakery-pahaous-projects.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.some(o => origin.startsWith(o));
        if (isAllowed) {
            return callback(null, true);
        } else {
            console.error(`[CORS Error] Origin ${origin} not allowed`);
            return callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());

app.get('/health', async (req, res) => {
    const result = await pool.checkDbHealth();
    if (!result.ok) {
        return res.status(503).json({
            success: false,
            message: 'Không kết nối được cơ sở dữ liệu',
            ...(process.env.NODE_ENV === 'development' && result.error && { detail: result.error })
        });
    }
    res.json({ success: true, message: 'OK' });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rewards', rewardRoutes);

// Route test
app.get('/', (req, res) => {
    res.json({ success: true, message: 'API Tiệm Bánh đang hoạt động! 🎂' });
});

// Error handling (PHẢI đặt sau tất cả routes)
app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
}

module.exports = app;
