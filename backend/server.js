// <<<<<<< feature-qa-test1
// //file trung tâm định nghĩa Middleware xử lý lỗi toàn cục ở dòng 38-41
// =======
// >>>>>>> backend
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// <<<<<<< feature-qa-test1
// const allowedFrontend = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
// app.use(cors({
//   origin: function(origin, callback) {
//     if (!origin) return callback(null, true); // allow non-browser tools like curl
//     if (allowedFrontend.length === 0) return callback(null, true); // allow all when not configured
//     if (allowedFrontend.includes(origin)) return callback(null, true);
//     return callback(new Error('CORS policy: Origin not allowed'));
//   },
// =======
// app.use(cors({
//   origin: process.env.FRONTEND_URL || '*',
// >>>>>>> backend
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/users', require('./routes/users'));

// Production: serve React build if it exists, otherwise serve API status
const fs = require('fs');
const frontendDistPath = path.join(__dirname, '../frontend/dist');

if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ success: true, message: 'EventHub API Server is running' });
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;

