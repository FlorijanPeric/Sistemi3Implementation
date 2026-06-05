const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const flowerRoutes = require('./routes/flowers');
const orderRoutes = require('./routes/orders');
const recommendationRoutes = require('./routes/recommendations');
const supplierRoutes = require('./routes/suppliers');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const statsRoutes = require('./routes/stats');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, service: 'flower-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/flowers', flowerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal_server_error' });
});

module.exports = app;
