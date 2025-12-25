const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const ffmpeg = require('fluent-ffmpeg');
const Video = require('../models/video');
const analyzeSensitivity = require('../utils/sensitivityStub');
const { authenticate, authorize } = require('../middleware/auth');

// Export a function that accepts `io` to avoid circular dependency with `index.js`.
module.exports = function (io) {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  });

  const upload = multer({ storage }).single('video');

  // Apply authentication to the entire router
  router.use(authenticate);

  // Restrict POST to Editors and Admins
  router.post('/', authorize(['Editor', 'Admin']), async (req, res) => {
    // Now you can access req.user.tenantId to enforce isolation
    upload(req, res, async (err) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      try {
        const record = await Video.create({
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: req.file.path,
          size: req.file.size,
          status: 'processing',
          owner: req.user._id,
          tenantId: req.user.tenantId
        });

        // 1. Start real processing with FFmpeg
        ffmpeg(record.path)
          .on('progress', (progress) => {
            // Emit granular real-time progress (e.g., 25%, 50%)
            if (io) io.to(req.user.tenantId).emit('video:progress', { 
              id: record._id, 
              percent: Math.floor(progress.percent) 
            });
          })
          .on('end', async () => {
            // 2. Automated Sensitivity Check (Trigger after processing)
            const analysis = await analyzeSensitivity(record.path);
            record.sensitivity = analysis.result;
            record.status = 'processed';
            await record.save();

            if (io) io.to(req.user.tenantId).emit('video:processed', { 
              id: record._id, 
              sensitivity: record.sensitivity 
            });
          })
          .on('error', (err) => {
            console.error('FFmpeg Error:', err);
            record.status = 'failed';
            record.save();
          })
          .save(path.join(uploadDir, `processed-${record.filename}`));

        res.json({ message: 'Upload started', id: record._id });
      } catch (e) {
        res.status(500).json({ error: 'Upload failed' });
      }
    });
  });

  router.get('/', async (req, res) => {
    // Only fetch videos belonging to the user's tenant
    const videos = await Video.find({ tenantId: req.user.tenantId });
    res.json(videos);
  });

  return router;
};
