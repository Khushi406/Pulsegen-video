const jwt = require('jsonwebtoken');

function parseTokenFromHeader(req) {
  const auth = req.headers.authorization || req.headers.Authorization || req.header && req.header('Authorization');
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return null;
  return token;
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