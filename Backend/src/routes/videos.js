const express = require('express');
const Video = require('../models/video');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// List videos scoped to the authenticated user's tenant
// Supports query filters: status, sensitivity, search (originalName), page, limit
router.get('/', authenticate, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { status, sensitivity, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const filter = { tenantId };
    if (status) filter.status = status;
    if (sensitivity) filter.sensitivity = sensitivity;
    if (search) filter.originalName = { $regex: search, $options: 'i' };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(200, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * lim;

    const [total, videos] = await Promise.all([
      Video.countDocuments(filter),
      Video.find(filter).sort(sort).skip(skip).limit(lim),
    ]);

    res.json({ data: videos, page: pageNum, limit: lim, total, totalPages: Math.ceil(total / lim) });
  } catch (e) {
    console.error('Failed to list videos', e);
    res.status(500).json({ error: 'Failed to list videos' });
  }
});

module.exports = router;
