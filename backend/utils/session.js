const jwt = require('jsonwebtoken');

function createSessionToken(user, sessionId) {
  return jwt.sign(
    {
      sub: String(user.id),
      username: user.username,
      role: user.role || 'employee'
    },
    process.env.JWT_SECRET,
    {
      jwtid: sessionId,
      expiresIn: '15m'
    }
  );
}

module.exports = {
  createSessionToken
};
