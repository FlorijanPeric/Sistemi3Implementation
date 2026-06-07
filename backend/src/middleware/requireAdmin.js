const { authRequired } = require('./auth');

// Runs authRequired first, then checks for admin role
function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ ok: false, message: 'admin_only' });
    }
    next();
  });
}

module.exports = { adminRequired };
