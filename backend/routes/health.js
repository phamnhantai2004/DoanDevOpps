const express = require('express');
const router = express.Router();

// GET /api/health → { "ok": true }
router.get('/', (req, res) => {
  res.json({ ok: true });
});

// // Thêm route này vào TRƯỚC dòng module.exports = router;
// router.get('/error', (req, res) => {
//   throw new Error("🔥 Lỗi giả lập để test log stack trace!");
// });

module.exports = router;
