const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
require('dotenv').config();

const db = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// 路由导入
const authRoutes = require('./routes/auth');
const wordRoutes = require('./routes/words');
const voteRoutes = require('./routes/votes');
const transactionRoutes = require('./routes/transactions');
const statsRoutes = require('./routes/stats');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3002;

// 安全中间件 - 增强配置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS配置 - 更严格的设置
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    // 允许没有origin的请求（如移动应用）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('不允许的来源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24小时
};

app.use(cors(corsOptions));

// 速率限制 - 分层限制
// 1. 全局限制
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 每个IP最多1000次请求
  message: {
    error: '请求过于频繁',
    message: '请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 2. 严格限制（用于敏感操作）
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100次请求
  message: {
    error: '请求过于频繁',
    message: '请稍后再试'
  }
});

// 3. 慢速限制
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15分钟
  delayAfter: 50, // 50次请求后开始延迟
  delayMs: 500 // 每次延迟500ms
});

app.use(globalLimiter);
app.use(speedLimiter);

// 日志中间件 - 生产环境使用更安全的配置
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400, // 只记录错误请求
    stream: {
      write: (message) => {
        // 在生产环境中，应该写入日志文件或日志服务
        console.log(message.trim());
      }
    }
  }));
} else {
  app.use(morgan('dev'));
}

// 请求体大小限制
app.use(express.json({ 
  limit: process.env.MAX_PAYLOAD_SIZE || '1mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: '无效的JSON格式' });
      throw new Error('无效的JSON格式');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_PAYLOAD_SIZE || '1mb' 
}));

// 安全头部
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// 健康检查
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    const status = dbHealth.status === 'healthy' ? 'OK' : 'ERROR';
    
    res.json({ 
      status,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: '健康检查失败',
      message: error.message
    });
  }
});

// API路由 - 应用不同的速率限制
app.use('/api/auth', strictLimiter, authRoutes);
app.use('/api/words', wordRoutes);
app.use('/api/votes', strictLimiter, voteRoutes);
app.use('/api/transactions', strictLimiter, transactionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', strictLimiter, adminRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: '接口不存在',
    message: '请求的资源不存在',
    path: req.originalUrl
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    const dbHealth = await db.healthCheck();
    if (dbHealth.status === 'healthy') {
      console.log('数据库连接成功');
    } else {
      throw new Error('数据库连接失败');
    }
    
    app.listen(PORT, () => {
      console.log(`服务器启动成功，端口: ${PORT}`);
console.log(`健康检查: http://localhost:${PORT}/health`);
console.log(`API文档: http://localhost:${PORT}/api`);
      console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error.message);
    process.exit(1);
  }
}

// 优雅关闭
const gracefulShutdown = (signal) => {
  console.log(`收到${signal}信号，正在关闭服务器...`);
  
  // 关闭数据库连接
  db.end().then(() => {
    console.log('数据库连接已关闭');
    process.exit(0);
  }).catch((error) => {
    console.error('关闭数据库连接时出错:', error);
    process.exit(1);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

startServer(); 