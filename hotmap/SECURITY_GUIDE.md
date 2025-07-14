# 🔒 安全指南

## 🚨 已修复的安全漏洞

### 1. 管理员权限缺失 (已修复)
- **问题**: 管理员路由没有任何身份验证
- **修复**: 添加了JWT身份验证和授权中间件
- **影响**: 防止未授权访问管理员功能

### 2. 数据库凭据硬编码 (已修复)
- **问题**: 数据库密码在代码中硬编码
- **修复**: 强制使用环境变量，启动时验证必需配置
- **影响**: 防止数据库凭据泄露

### 3. SQL注入风险 (已修复)
- **问题**: 某些地方可能存在SQL注入风险
- **修复**: 使用参数化查询和输入验证
- **影响**: 防止SQL注入攻击

### 4. CORS配置过于宽松 (已修复)
- **问题**: CORS允许所有来源
- **修复**: 严格的白名单配置
- **影响**: 防止CSRF攻击

### 5. 错误信息泄露 (已修复)
- **问题**: 开发模式下错误堆栈信息暴露
- **修复**: 生产环境隐藏敏感信息
- **影响**: 防止系统信息泄露

### 6. 输入验证不完整 (已修复)
- **问题**: 某些API端点缺少完整验证
- **修复**: 添加全面的输入验证和清理
- **影响**: 防止恶意输入攻击

### 7. 速率限制配置不当 (已修复)
- **问题**: 速率限制不够严格
- **修复**: 分层速率限制和慢速限制
- **影响**: 防止暴力攻击和DoS

## 🛡️ 新增安全功能

### 1. 身份验证系统
```javascript
// JWT令牌生成和验证
const token = generateToken(user);
const decoded = jwt.verify(token, secret);
```

### 2. 输入验证和清理
```javascript
// XSS防护
const sanitizedInput = sanitizeObject(input);

// 参数验证
const { error, value } = schema.validate(input);
```

### 3. 安全头部
```javascript
// 安全响应头
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### 4. 分层速率限制
```javascript
// 全局限制: 1000次/15分钟
// 严格限制: 100次/15分钟 (敏感操作)
// 慢速限制: 50次后开始延迟
```

### 5. 数据库安全
```javascript
// 连接池管理
// 重试机制
// 健康检查
// SSL连接 (生产环境)
```

## 🔧 安全配置

### 环境变量配置
```bash
# 必需的安全配置
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here_minimum_32_characters
DB_PASSWORD=your_secure_password_here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# 可选的安全配置
MAX_PAYLOAD_SIZE=1mb
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=production
```

### 生产环境检查清单
- [ ] 设置强密码的JWT_SECRET
- [ ] 配置安全的数据库密码
- [ ] 设置正确的ALLOWED_ORIGINS
- [ ] 启用HTTPS
- [ ] 配置防火墙规则
- [ ] 设置日志监控
- [ ] 定期备份数据库
- [ ] 更新依赖包

## 🚀 部署安全建议

### 1. 服务器安全
```bash
# 更新系统
sudo apt update && sudo apt upgrade

# 配置防火墙
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3002  # API端口
```

### 2. 数据库安全
```sql
-- 创建专用数据库用户
CREATE USER meme_hotmap_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE meme_hotmap TO meme_hotmap_user;
GRANT USAGE ON SCHEMA public TO meme_hotmap_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO meme_hotmap_user;
```

### 3. SSL/TLS配置
```javascript
// 使用HTTPS
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem')
};

https.createServer(options, app).listen(443);
```

### 4. 监控和日志
```javascript
// 使用Winston进行日志记录
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🔍 安全测试

### 1. 依赖安全检查
```bash
# 检查安全漏洞
npm audit

# 自动修复
npm audit fix

# 手动修复
npm audit fix --force
```

### 2. 代码质量检查
```bash
# ESLint检查
npm run lint

# 自动修复
npm run lint:fix
```

### 3. API安全测试
```bash
# 使用Postman或curl测试
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"wallet_address": "test"}'

# 测试速率限制
for i in {1..200}; do
  curl http://localhost:3002/api/words
done
```

## 📋 安全维护

### 定期任务
- [ ] 每周检查依赖包更新
- [ ] 每月进行安全审计
- [ ] 每季度更新SSL证书
- [ ] 每年进行渗透测试

### 监控指标
- [ ] API响应时间
- [ ] 错误率
- [ ] 速率限制触发次数
- [ ] 数据库连接数
- [ ] 内存使用情况

### 应急响应
1. **发现漏洞**: 立即评估影响范围
2. **临时修复**: 快速部署安全补丁
3. **根本修复**: 彻底解决安全问题
4. **事后分析**: 总结经验教训

## 📞 安全联系方式

- **安全漏洞报告**: security@yourdomain.com
- **紧急联系**: +1-xxx-xxx-xxxx
- **技术支持**: support@yourdomain.com

---

**最后更新**: 2025-01-10
**版本**: 1.0.0 