import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, college: user.college, course: user.course, role: user.role };
}
function tokenFor(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(req, res, next) {
  try {
    const { name, email, password, college, course = '' } = req.body;
    if (!name || !email || !password || !college) return res.status(400).json({ message: 'Name, email, password and college are required.' });
    if (String(password).length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({
      name: String(name).trim(), email: normalizedEmail, college: String(college).trim(),
      course: String(course).trim(), passwordHash: await bcrypt.hash(password, 12)
    });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').trim().toLowerCase() }).select('+passwordHash');
    if (!user || !password || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

export async function me(req, res) {
  const u = req.user;
  res.json({ user: { id: u._id, name: u.name, email: u.email, college: u.college, course: u.course, role: u.role } });
}
