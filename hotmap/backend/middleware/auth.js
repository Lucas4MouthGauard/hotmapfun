const jwt = require('jsonwebtoken');

// 验证JWT令牌
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: '访问被拒绝',
      message: '需要提供有效的访问令牌'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: '令牌无效',
      message: '访问令牌已过期或无效'
    });
  }
};

// 验证管理员权限
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: '权限不足',
      message: '需要管理员权限才能访问此功能'
    });
  }
  next();
};

// 生成JWT令牌
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
  return jwt.sign(
    { 
      id: user.id, 
      wallet_address: user.wallet_address,
      role: user.role || 'user'
    },
    secret,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken
}; 