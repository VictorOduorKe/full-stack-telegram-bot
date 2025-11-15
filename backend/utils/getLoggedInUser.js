// utils/getLoggedInUser.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const getLoggedInUser = async (req) => {
  const token = req.cookies.token;
  if (!token) return null;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');
  return user;
};
