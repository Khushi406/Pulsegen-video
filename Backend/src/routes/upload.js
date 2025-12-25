const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const Video = require('../models/video');
const analyzeSensitivity = require('../utils/sensitivityStub');

// Export a function that accepts `io` to avoid circular dependency with `index.js`.
module.exports = function (io) {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  });

  const upload = multer({ storage }).single('video');

  router.post('/', async (req, res) => {
    upload(req, res, async (err) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      try {
        const record = await Video.create({
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: req.file.path,
          size: req.file.size,
          status: 'uploaded',
        });

        // Emit immediate upload event
        if (io && io.emit) io.emit('video:uploaded', { id: record._id, filename: record.filename });

        // Kick off sensitivity analysis (stub)
        const analysis = await analyzeSensitivity(record.path);
        record.sensitivity = analysis.result || 'unknown';
        record.status = 'processed';
        await record.save();

        // Emit processed event
        if (io && io.emit) io.emit('video:processed', { id: record._id, sensitivity: record.sensitivity });

        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ message: 'Uploaded', file: fileUrl, id: record._id });
      } catch (e) {
        console.error('Upload processing error', e);
        res.status(500).json({ error: 'Processing failed' });
      }
    });
  });

  return router;
};
