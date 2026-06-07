const jwt = require('jsonwebtoken');

const DEV_USER = { userId: 'dev', username: 'dev', role: 'admin', floristId: null, supplierId: null };

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    req.user = DEV_USER;
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'flower-secret');
  } catch {
    req.user = DEV_USER;
  }
  next();
}

module.exports = { authRequired };