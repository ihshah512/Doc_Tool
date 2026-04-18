require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const conversionRoutes = require('./routes/conversion');
const mergeRoutes = require('./routes/merge');
const imageRoutes = require('./routes/image');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Stripe webhook needs raw body — must come before express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/convert', conversionRoutes);
app.use('/api/merge', mergeRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`DocTools backend running on http://localhost:${PORT}`);
});
