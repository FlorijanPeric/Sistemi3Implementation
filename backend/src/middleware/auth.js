const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, message: 'missing_token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'flower-secret');
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, message: 'invalid_token' });
  }
}

module.exports = { authRequired };