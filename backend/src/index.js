require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const bookingRoutes = require('./routes/bookings');
const analyticsRoutes = require('./routes/analytics');
const auditRoutes = require('./routes/audit');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
