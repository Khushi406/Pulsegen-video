const jwt = require('jsonwebtoken');

function parseTokenFromHeader(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.split(' ')[1];
}

function authenticate(req, res, next) {
  const token = parseTokenFromHeader(req);
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const secret = process.env.JWT_SECRET || 'change_this_secret';
    const payload = jwt.verify(token, secret);
    req.user = {
      _id: payload._id || payload.id || payload.userId,
      tenantId: payload.tenantId || payload.tenant || payload.org,
      role: payload.role || 'viewer',
    };
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function authorize(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedRoles || allowedRoles.length === 0) return next();
    if (allowedRoles.includes(req.user.role)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}

module.exports = { authenticate, authorize };
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