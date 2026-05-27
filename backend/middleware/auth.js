const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-event-key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({ success: false, error: 'Vui lòng đăng nhập để thực hiện tác vụ này' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Phiên làm việc hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền truy cập chức năng này (Yêu cầu quyền Admin)' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, JWT_SECRET };
