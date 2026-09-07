import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// In-memory user store fallback when MongoDB is offline
export const memoryUsers = new Map();

export function getMemoryUserById(id) {
  for (const user of memoryUsers.values()) {
    if (user._id === id || user.id === id) {
      return {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      };
    }
  }
  return null;
}

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(422).json({ success: false, message: 'Name, email and password are required' });
  }

  if (password.length < 8) {
    return res.status(422).json({ success: false, message: 'Password must be at least 8 characters' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // If MongoDB is connected
  if (mongoose.connection.readyState === 1) {
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
      role: 'customer',
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: generateToken(user._id.toString()),
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }

  // In-memory fallback
  if (memoryUsers.has(normalizedEmail)) {
    return res.status(409).json({ success: false, message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = 'mem_usr_' + Date.now();
  const user = {
    _id: userId,
    id: userId,
    name: name.trim(),
    email: normalizedEmail,
    password: passwordHash,
    role: 'customer',
    isActive: true,
  };
  memoryUsers.set(normalizedEmail, user);

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
    token: generateToken(userId),
    data: {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(422).json({ success: false, message: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // If MongoDB is connected
  if (mongoose.connection.readyState === 1) {
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id.toString()),
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }

  // In-memory fallback
  let user = memoryUsers.get(normalizedEmail);

  // Seed a demo user if memory is empty and requested demo
  if (!user && normalizedEmail === 'demo@example.com' && password === 'password123') {
    const passwordHash = await bcrypt.hash('password123', 10);
    user = {
      _id: 'demo_user_1',
      id: 'demo_user_1',
      name: 'Demo Customer',
      email: 'demo@example.com',
      password: passwordHash,
      role: 'customer',
      isActive: true,
    };
    memoryUsers.set(normalizedEmail, user);
  }

  if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  return res.json({
    success: true,
    message: 'Login successful',
    token: generateToken(user._id),
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

export async function me(req, res) {
  return res.json({ success: true, data: req.user });
}

