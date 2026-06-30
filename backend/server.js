const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const db = require('./config/db');
const securityHeaders = require('./middlewares/securityHeaders');
const { generalLimiter } = require('./middlewares/rateLimitMiddleware');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const sessionsRoutes = require('./routes/sessions');
const adminRoutes = require('./routes/admin');
const securityRoutes = require('./routes/security');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(securityHeaders);
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/security', securityRoutes);

async function initializeDatabase() {
  try {
    console.log('Starting DB migration checks...');
    const schemaSqlPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaSqlPath)) {
      const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
      await db.query(schemaSql);
      console.log('✅ PostgreSQL Schema and Seed migration executed successfully.');
    }
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server initialized. Listening on http://localhost:${PORT}`);
  await initializeDatabase();
});
