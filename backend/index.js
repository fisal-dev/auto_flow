require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const router = require('./routes');
const stripeController = require('./controllers/stripeController');

const app = express();

// Trust the first hop of reverse proxy (e.g. Render, Cloudflare) safely
app.set('trust proxy', 1);

// Apply Helmet Security Headers and allow cross-origin resource sharing for static files
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Apply Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 mins for development/testing flexibility
  message: { message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Connect to Database
connectDB();

// CORS Settings
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true
}));

// Stripe Webhook Endpoint (Must be registered before body parser)
app.post('/api/v1/stripe/webhook', express.raw({ type: 'application/json' }), stripeController.webhook);

// JSON and urlencoded parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Main API Route
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/v1', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT);
