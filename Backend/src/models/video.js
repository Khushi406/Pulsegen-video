const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: String,
  path: String,
  size: Number,
  status: { type: String, default: 'uploaded' },
  sensitivity: { type: String, default: 'unknown' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Video', videoSchema);
