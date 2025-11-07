// ✅ Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./database/db');

const app = express();

// ✅ Middleware
const allowedOrigins = [
  'https://managerport2.netlify.app', // ✅ your live Vercel domain
  'http://localhost:5173',                     // ✅ for local React dev
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
;
app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Use PORT from .env (fallback 5000)
const PORT = process.env.PORT;
// ✅ Routes
const authRoutes = require('./routes/authenticationRoute');
const userRoutes = require('./routes/userRoutes');

// ✅ Temporary report endpoint for testing
app.post('/api/report', (req, res) => {
  console.log('📩 Report received:', req.body);
  res.status(200).json({
    data: {
      message: {
        actions: {
          coin: req.body.chain || 'N/A',
          calculationMethod: 'simple',
          totalActions: 10,
          tradingVolume: 5000,
          totalCommissionPaid: 25,
        },
        profitAndLoss: {
          Gain: 200,
          Loss: 50,
          Fees: 25,
          Sum: 125,
        },
        insights: `Report for wallet ${req.body.walletAddress} on ${req.body.chain}`,
      },
    },
  });
});

// ✅ Prefix other backend APIs with /api
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// ✅ Default route for testing server status
app.get('/', (req, res) => {
  res.status(200).send('🚀 FutureBanking backend is running successfully!');
});

// ✅ Handle unknown routes (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});
// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running on: http://localhost:${PORT}`);
});
