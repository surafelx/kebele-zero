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
const cloudinaryRoutes = require('./routes/cloudinary');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Security & parsing ─────────────────────────────────────────────────────
app.use(helmet());

// CORS — restrict to comma-separated origins in CORS_ORIGIN, else allow all.
// e.g. CORS_ORIGIN=https://kebele-zero.vercel.app,https://kebelezero.com
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors(
    corsOrigins.length > 0
      ? {
          origin(origin, cb) {
            // allow same-origin / curl / server-to-server (no origin header)
            if (!origin || corsOrigins.includes(origin)) return cb(null, true);
            cb(new Error('Not allowed by CORS'));
          },
        }
      : undefined // no CORS_ORIGIN set → allow all (dev default)
  )
);

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
app.use('/api/cloudinary', cloudinaryRoutes);

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
