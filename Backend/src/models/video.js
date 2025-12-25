const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: String,
  path: String,
  size: Number,
  status: { type: String, default: 'uploaded' }, // uploaded, processing, processed 
  sensitivity: { type: String, default: 'unknown' }, // safe, flagged
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User Isolation 
  tenantId: { type: String, required: true }, // Multi-tenant architecture 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Video', videoSchema);