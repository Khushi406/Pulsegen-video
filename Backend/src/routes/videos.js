const express = require('express');
const Video = require('../models/video');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// List videos scoped to the authenticated user's tenant
router.get('/', authenticate, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const videos = await Video.find({ tenantId }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (e) {
    console.error('Failed to list videos', e);
    res.status(500).json({ error: 'Failed to list videos' });
  }
});

module.exports = router;
