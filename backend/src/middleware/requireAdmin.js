const { authRequired } = require('./auth');

function adminRequired(req, res, next) {
  authRequired(req, res, next);
}

module.exports = { adminRequired };
