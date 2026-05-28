const express = require('express');
const router = express.Router();

// GET /api/health → { "ok": true }
router.get('/', (req, res) => {
  res.json({ ok: true });
});

// <<<<<<< feature-qa-test1
// // // Thêm route này vào TRƯỚC dòng module.exports = router;
// // router.get('/error', (req, res) => {
// //   throw new Error("🔥 Lỗi giả lập để test log stack trace!");
// // });

// =======
// >>>>>>> backend
module.exports = router;
