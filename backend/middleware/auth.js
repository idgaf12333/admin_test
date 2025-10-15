const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: '未提供認證令牌' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.adminId;
    req.adminEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: '無效的認證令牌' });
  }
};

module.exports = authMiddleware;