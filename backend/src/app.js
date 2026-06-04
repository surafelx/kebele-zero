require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const pointsRoutes = require('./routes/points');
const forumRoutes = require('./routes/forum');
const contentRoutes = require('./routes/content');
const paymentRequestRoutes = require('./routes/paymentRequests');
const settingsRoutes = require('./routes/settings');
const socialLinksRoutes = require('./routes/socialLinks');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Security & parsing ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api', contentRoutes);
app.use('/api/payment-requests', paymentRequestRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/social-links', socialLinksRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Error handler ──────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server (skip when imported by tests) ─────────────────────────────
if (require.main === module) {
  const { connectDB } = require('./config/db');
  const { port } = require('./config/env');

  connectDB().then(() => {
    app.listen(port, () => {
      console.log(`Kebele Zero API running on port ${port}`);
    });
  });
}

module.exports = app;
