const { Pool } = require('pg');

// 验证必需的环境变量
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('缺少必需的环境变量:', missingVars.join(', '));
  console.error('请检查 .env 文件配置');
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20, // 连接池最大连接数
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000, // 连接空闲超时
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000, // 连接超时
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 测试连接
pool.on('connect', () => {
  console.log('数据库连接已建立');
});

pool.on('error', (err) => {
  console.error('数据库连接错误:', err);
  // 在生产环境中，可能需要重启应用或发送告警
  if (process.env.NODE_ENV === 'production') {
    console.error('生产环境数据库连接错误，请检查数据库状态');
  }
});

// 查询包装函数 - 添加重试机制
const query = async (text, params) => {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`数据库查询失败 (尝试 ${attempt}/${maxRetries}):`, error.message);
      
      // 如果是连接错误且不是最后一次尝试，等待后重试
      if (attempt < maxRetries && (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
};

// 事务包装函数
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// 健康检查
const healthCheck = async () => {
  try {
    const result = await query('SELECT NOW() as current_time');
    return {
      status: 'healthy',
      timestamp: result.rows[0].current_time,
      connections: pool.totalCount,
      idleConnections: pool.idleCount
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  query,
  transaction,
  pool,
  healthCheck,
  end: () => pool.end()
}; 