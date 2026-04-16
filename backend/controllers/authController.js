const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { User, Session } = require('../models');
const { createSessionToken } = require('../utils/session');

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new AppError('Username and password are required.', 400);
  }

  const normalizedUsername = String(username).trim().toLowerCase();
  const user = await User.findOne({
    where: {
      username: normalizedUsername
    }
  });

  if (!user) {
    throw new AppError('Invalid username or password.', 401);
  }

  const passwordMatches = await bcrypt.compare(String(password), user.password);
  if (!passwordMatches) {
    throw new AppError('Invalid username or password.', 401);
  }

  const sessionId = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
  const token = createSessionToken(user, sessionId);

  await Session.create({
    userId: user.id,
    tokenId: sessionId,
    lastActivityAt: now,
    expiresAt
  });

  res.json({
    message: 'Login successful.',
    token,
    expiresIn: '15m',
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      department: user.department,
      designation: user.designation,
      role: user.role || 'employee',
      isActive: user.isActive
    }
  });
});

const register = asyncHandler(async (req, res) => {
  const {
    username,
    password,
    fullName,
    email,
    department,
    designation,
    isActive
  } = req.body;

  if (!username || !password || !fullName || !email || !department || !designation) {
    throw new AppError('All account fields are required.', 400);
  }

  const normalizedUsername = String(username).trim().toLowerCase();
  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await User.findOne({
    where: {
      username: normalizedUsername
    }
  });

  if (existingUser) {
    throw new AppError('Username already exists.', 409);
  }

  const existingEmail = await User.findOne({
    where: {
      email: normalizedEmail
    }
  });

  if (existingEmail) {
    throw new AppError('Email already exists.', 409);
  }

  const hashedPassword = await bcrypt.hash(String(password), 10);
  const user = await User.create({
    username: normalizedUsername,
    password: hashedPassword,
    fullName: String(fullName).trim(),
    email: normalizedEmail,
    department: String(department).trim(),
    designation: String(designation).trim(),
    role: 'employee',
    isActive: typeof isActive === 'boolean' ? isActive : true
  });

  const sessionId = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
  const token = createSessionToken(user, sessionId);

  await Session.create({
    userId: user.id,
    tokenId: sessionId,
    lastActivityAt: now,
    expiresAt
  });

  res.status(201).json({
    message: 'Account created successfully.',
    token,
    expiresIn: '15m',
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      department: user.department,
      designation: user.designation,
      role: user.role || 'employee',
      isActive: user.isActive
    }
  });
});

module.exports = {
  login,
  register
};
