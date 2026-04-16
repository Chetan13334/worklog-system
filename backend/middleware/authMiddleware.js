const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { User, Session } = require('../models');
const { createSessionToken } = require('../utils/session');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      throw new AppError('Authentication token missing.', 401);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true
    });

    if (!payload?.jti || !payload?.sub) {
      throw new AppError('Invalid authentication token.', 401);
    }

    const session = await Session.findOne({
      where: {
        tokenId: payload.jti,
        userId: Number(payload.sub)
      }
    });

    if (!session || session.revokedAt) {
      throw new AppError('Session expired. Please login again.', 401);
    }

    const now = new Date();
    if (new Date(session.expiresAt).getTime() <= now.getTime()) {
      await session.update({
        revokedAt: now
      });
      throw new AppError('Session expired due to inactivity. Please login again.', 401);
    }

    const user = await User.findByPk(Number(payload.sub));
    if (!user) {
      throw new AppError('User account not found.', 401);
    }

    const refreshedExpiry = new Date(now.getTime() + 15 * 60 * 1000);
    await session.update({
      lastActivityAt: now,
      expiresAt: refreshedExpiry
    });

    const refreshedToken = createSessionToken(user, session.tokenId);
    res.setHeader('x-session-token', refreshedToken);

    req.user = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      department: user.department,
      designation: user.designation,
      role: user.role || 'employee',
      isActive: user.isActive
    };
    req.session = session;
    req.sessionToken = refreshedToken;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      next(new AppError('Invalid authentication token.', 401));
      return;
    }

    if (error.name === 'TokenExpiredError') {
      next(new AppError('Session expired. Please login again.', 401));
      return;
    }

    next(error);
  }
};

module.exports = authMiddleware;
