# 🚀 部署指南

本文档详细说明如何将 Meme 热词排行项目部署到各种环境。

## 📋 部署前准备

### 1. 系统要求

- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+
- **Node.js**: 18.0.0+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **内存**: 最少 2GB RAM
- **存储**: 最少 10GB 可用空间

### 2. 域名和SSL证书

- 准备一个域名（如：meme-hotmap.com）
- 获取SSL证书（推荐使用 Let's Encrypt）

### 3. 服务器配置

- 开放端口：22 (SSH), 80 (HTTP), 443 (HTTPS)
- 配置防火墙规则
- 设置服务器时区为 UTC

## 🐳 Docker 部署

### 本地 Docker 部署

```bash
# 1. 克隆项目
git clone https://github.com/your-username/meme-hotmap.git
cd meme-hotmap

# 2. 构建镜像
docker build -t meme-hotmap .

# 3. 运行容器
docker run -d \
  --name meme-hotmap \
  -p 3000:3000 \
  -p 3001:3001 \
  -e NODE_ENV=production \
  meme-hotmap
```

### Docker Compose 部署

```bash
# 1. 启动所有服务
docker-compose up -d

# 2. 查看服务状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f

# 4. 停止服务
docker-compose down
```

## 🖥️ 服务器部署

### 1. 准备服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y curl wget git unzip

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 重启系统
sudo reboot
```

### 2. 部署项目

```bash
# 1. 克隆项目
git clone https://github.com/your-username/meme-hotmap.git
cd meme-hotmap

# 2. 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 3. 配置域名

编辑 `nginx.conf` 文件：

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;  # 替换为你的域名
    
    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
}
```

### 4. 配置SSL证书

#### 使用 Let's Encrypt

```bash
# 安装 Certbot
sudo apt install -y certbot

# 获取证书
sudo certbot certonly --standalone -d yourdomain.com

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
```

#### 使用自签名证书（仅测试）

```bash
# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=CN/ST=State/L=City/O=Organization/CN=yourdomain.com"
```

### 5. 重启服务

```bash
# 重启 Docker 服务
docker-compose down
docker-compose up -d

# 验证部署
curl -f https://yourdomain.com/health
```

## ☁️ 云平台部署

### Vercel 部署（仅前端）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署
vercel --prod
```

### Railway 部署

```bash
# 1. 安装 Railway CLI
npm i -g @railway/cli

# 2. 登录 Railway
railway login

# 3. 初始化项目
railway init

# 4. 部署
railway up
```

### DigitalOcean App Platform

1. 登录 DigitalOcean 控制台
2. 创建新的 App
3. 连接 GitHub 仓库
4. 选择 Docker 部署方式
5. 配置环境变量
6. 部署

### AWS ECS 部署

```bash
# 1. 配置 AWS CLI
aws configure

# 2. 创建 ECR 仓库
aws ecr create-repository --repository-name meme-hotmap

# 3. 构建并推送镜像
docker build -t meme-hotmap .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker tag meme-hotmap:latest your-account.dkr.ecr.us-east-1.amazonaws.com/meme-hotmap:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/meme-hotmap:latest

# 4. 创建 ECS 服务
aws ecs create-service --cluster your-cluster --service-name meme-hotmap --task-definition meme-hotmap
```

## 🔧 环境配置

### 开发环境

```env
# .env.local
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROJECT_WALLET=5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1
```

### 生产环境

```env
# .env
NODE_ENV=production
SOLANA_NETWORK=mainnet-beta
PROJECT_WALLET=your_production_wallet_address
JWT_SECRET=your_very_long_and_secure_jwt_secret_key
ALLOWED_ORIGINS=https://yourdomain.com
```

## 📊 监控和维护

### 健康检查

```bash
# 检查服务状态
docker-compose ps

# 检查健康端点
curl -f http://localhost/health
curl -f http://localhost/api/health

# 检查日志
docker-compose logs -f
```

### 备份

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U postgres meme_hotmap > backup_$(date +%Y%m%d_%H%M%S).sql

# 备份配置文件
tar -czf config_backup_$(date +%Y%m%d_%H%M%S).tar.gz .env* nginx.conf ssl/
```

### 更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建和部署
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 验证更新
curl -f http://localhost/health
```

## 🔒 安全配置

### 防火墙设置

```bash
# 配置 UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### SSL/TLS 配置

确保在 `nginx.conf` 中配置了安全的SSL参数：

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

### 安全头配置

```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

## 🚨 故障排除

### 常见问题

#### 1. 端口被占用

```bash
# 检查端口占用
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# 停止占用进程
sudo kill -9 <PID>
```

#### 2. Docker 权限问题

```bash
# 添加用户到 docker 组
sudo usermod -aG docker $USER

# 重启 Docker 服务
sudo systemctl restart docker
```

#### 3. SSL 证书问题

```bash
# 检查证书有效性
openssl x509 -in ssl/cert.pem -text -noout

# 重新生成证书
./deploy.sh
```

#### 4. 数据库连接问题

```bash
# 检查数据库状态
docker-compose exec postgres psql -U postgres -c "SELECT version();"

# 重启数据库
docker-compose restart postgres
```

### 日志分析

```bash
# 查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f nginx

# 查看系统日志
sudo journalctl -u docker.service -f
```

## 📞 支持

如果遇到部署问题，请：

1. 检查日志文件
2. 查看健康检查端点
3. 确认环境变量配置
4. 提交 Issue 到 GitHub
5. 联系技术支持

---

**注意**: 生产环境部署前，请确保：
- 使用真实的SSL证书
- 配置强密码和密钥
- 设置适当的防火墙规则
- 定期备份数据
- 监控系统资源使用情况 