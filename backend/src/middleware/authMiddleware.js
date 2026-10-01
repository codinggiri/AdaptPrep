import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access Denied: No Token Provided' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or Expired Token' });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role && req.user?.role !== 'admin') {
    return res.status(403).json({ error: `Forbidden: Requires ${role} role` });
  }
  next();
};