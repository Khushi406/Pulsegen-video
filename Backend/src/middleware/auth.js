const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // Extract token from 'Authorization: Bearer <token>' header 
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify token using secret from .env [cite: 87, 139]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Attach user data (id, role, tenantId) to the request object [cite: 74, 76]
    req.user = decoded; 
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// RBAC Middleware to restrict access based on user role [cite: 76, 163]
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };