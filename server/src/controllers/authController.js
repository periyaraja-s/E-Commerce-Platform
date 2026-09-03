import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(422).json({ success: false, message: 'Name, email and password are required' });
  }

  if (password.length < 8) {
    return res.status(422).json({ success: false, message: 'Password must be at least 8 characters' });
  }

  const normalizedEmail = email.trim().toLowerCase();
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

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(422).json({ success: false, message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

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

export async function me(req, res) {
  return res.json({ success: true, data: req.user });
}
