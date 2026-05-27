const express = require('express');
const router = express.Router();

// GET /api/health → { "ok": true }
router.get('/', (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
