const errorHandler = (err, req, res, next) => {
  // 记录错误信息（生产环境中应该写入日志文件）
  const errorLog = {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };

  // 在生产环境中，不要记录请求体等敏感信息
  if (process.env.NODE_ENV === 'development') {
    errorLog.body = req.body;
    errorLog.params = req.params;
    errorLog.query = req.query;
  }

  console.error('错误详情:', errorLog);

  // 数据库错误处理
  if (err.code === '23505') { // 唯一约束违反
    return res.status(409).json({
      error: '数据已存在',
      message: '该记录已存在，请勿重复提交'
    });
  }

  if (err.code === '23503') { // 外键约束违反
    return res.status(400).json({
      error: '数据关联错误',
      message: '关联的数据不存在'
    });
  }

  if (err.code === '42P01') { // 表不存在
    return res.status(500).json({
      error: '数据库错误',
      message: '数据库表结构错误，请联系管理员'
    });
  }

  if (err.code === '23514') { // 检查约束违反
    return res.status(400).json({
      error: '数据验证失败',
      message: '输入数据不符合要求'
    });
  }

  if (err.code === '42703') { // 列不存在
    return res.status(500).json({
      error: '数据库错误',
      message: '数据库结构错误，请联系管理员'
    });
  }

  // Joi验证错误
  if (err.isJoi) {
    return res.status(400).json({
      error: '参数验证失败',
      message: err.details[0].message,
      field: err.details[0].path.join('.')
    });
  }

  // JWT相关错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: '令牌无效',
      message: '访问令牌格式错误'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: '令牌已过期',
      message: '访问令牌已过期，请重新登录'
    });
  }

  // Solana相关错误
  if (err.message.includes('Solana') || err.message.includes('blockchain')) {
    return res.status(503).json({
      error: '区块链服务异常',
      message: '区块链网络暂时不可用，请稍后重试'
    });
  }

  // 网络相关错误
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: '服务不可用',
      message: '外部服务暂时不可用，请稍后重试'
    });
  }

  // 文件系统错误
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      error: '资源不存在',
      message: '请求的资源不存在'
    });
  }

  // 权限错误
  if (err.code === 'EACCES' || err.code === 'EPERM') {
    return res.status(403).json({
      error: '权限不足',
      message: '没有足够的权限执行此操作'
    });
  }

  // 默认错误响应
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  // 生产环境中不暴露详细错误信息
  const responseMessage = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误，请稍后重试' 
    : message;

  const response = {
    error: '请求失败',
    message: responseMessage,
    timestamp: new Date().toISOString()
  };

  // 只在开发环境中返回错误堆栈
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = {
      name: err.name,
      code: err.code
    };
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler; 