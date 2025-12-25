const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Editor', 'Viewer'], 
    default: 'Viewer' 
  }, // RBAC implementation 
  tenantId: { type: String, required: true } // Data segregation [cite: 75]
});

module.exports = mongoose.model('User', userSchema);