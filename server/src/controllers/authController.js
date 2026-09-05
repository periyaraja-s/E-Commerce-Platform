import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

const memoryUsers = [
  {
    _id: 'user_admin_001',
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: '$2b$10$h6GfDJum3XslUK2CokiAoeVixDLWxWOWipUDNzrscIMt7O8G5KOAS', // admin@123
    role: 'admin',
    isActive: true,
  },
  {
    _id: 'user_customer_001',
    name: 'Demo Customer',
    email: 'customer@gmail.com',
    password: '$2b$10$h6GfDJum3XslUK2CokiAoeVixDLWxWOWipUDNzrscIMt7O8G5KOAS', // admin@123
    role: 'customer',
    isActive: true,
  },
];

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(422).json({ success: false, message: 'Name, email and password are required' });
  }

  if (password.length < 8) {
    return res.status(422).json({ success: false, message: 'Password must be at least 8 characters' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (mongoose.connection.readyState === 1) {
    try {
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
    } catch {
      // Fall through to memory fallback
    }
  }

  const existingMemory = memoryUsers.find((u) => u.email === normalizedEmail);
  if (existingMemory) {
    return res.status(409).json({ success: false, message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    _id: 'user_' + Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    password: passwordHash,
    role: 'customer',
    isActive: true,
  };
  memoryUsers.push(newUser);

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
    token: generateToken(newUser._id.toString()),
    data: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(422).json({ success: false, message: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (user && user.isActive && (await bcrypt.compare(password, user.password))) {
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
    } catch {
      // Fall through to memory fallback
    }
  }

  const memoryUser = memoryUsers.find((u) => u.email === normalizedEmail);
  if (memoryUser && memoryUser.isActive && (await bcrypt.compare(password, memoryUser.password))) {
    return res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(memoryUser._id.toString()),
      data: {
        id: memoryUser._id,
        name: memoryUser.name,
        email: memoryUser.email,
        role: memoryUser.role,
      },
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid email or password' });
}

export async function me(req, res) {
  return res.json({ success: true, data: req.user });
}

export function getMemoryUserById(id) {
  const found = memoryUsers.find((u) => u._id === id || u.id === id);
  if (found) {
    const { password: _, ...rest } = found;
    return rest;
  }
  return null;
}

