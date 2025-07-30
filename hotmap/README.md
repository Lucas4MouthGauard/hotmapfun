# 🚀 Meme 热词排行网站

一个基于 Solana 区块链的社区共创 meme 热词排行网站。用户连接 Solana 钱包，免费投票支持自己喜欢的词条，参与热门话题塑造。

## ✨ 核心功能

### 🔗 钱包连接
- 支持 Phantom、OKX Wallet（Solana 网络）
- 检测当前钱包地址（用于身份 & 防止刷票）

### 📝 词条系统
- 词库总量：300个（可自定义）
- 每个词条有唯一编号与展示字段
- 支持分类和表情符号

### 🗳️ 投票系统
- **免费投票**：每个钱包每天免费投票3次
- **付费投票**：每次投票 = 0.02 SOL
- **防刷机制**：每个钱包每天限投50票
- **实时更新**：投票后热力图立即更新

### 🔥 热力图展示
- 前100个词以"meme 热力图"形式展示
- 颜色和大小随热度变动
- 支持搜索和列表视图切换
- 像素化、表情包风格设计

### 💰 支付机制
- 所有付费投票通过 Solana 交易完成
- 可设置收款地址（项目方钱包）
- 支持排行榜打赏机制

## 🛠️ 技术栈

- **前端框架**: Next.js 14 + React 18
- **后端框架**: Express.js + Node.js
- **样式**: Tailwind CSS + Framer Motion
- **区块链**: Solana Web3.js
- **钱包**: Solana Wallet Adapter
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **语言**: TypeScript

## 🚀 快速开始

### 方式一：本地开发

#### 1. 克隆项目

```bash
git clone https://github.com/your-username/meme-hotmap.git
cd meme-hotmap
```

#### 2. 初始化项目

```bash
chmod +x setup.sh
./setup.sh
```

#### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 方式二：Docker 部署

#### 1. 构建和运行

```bash
# 构建镜像
npm run docker:build

# 运行容器
npm run docker:compose
```

#### 2. 访问应用

- 前端: http://localhost:3000
- 后端: http://localhost:3001
- 健康检查: http://localhost/health

### 方式三：Vercel 部署

#### 1. 快速部署

```bash
# 使用部署脚本
./deploy-vercel.sh

# 或手动部署
npm run vercel:deploy
```

#### 2. 手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel --prod
```

#### 3. 访问应用

部署完成后，Vercel 会提供访问地址，如：
- 生产环境: https://your-project.vercel.app
- 预览环境: https://your-project-git-branch.vercel.app

### 方式四：服务器部署

#### 1. 准备服务器

确保服务器已安装：
- Docker
- Docker Compose
- Git

#### 2. 部署到服务器

```bash
# 克隆项目
git clone https://github.com/your-username/meme-hotmap.git
cd meme-hotmap

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

#### 3. 配置域名和SSL

编辑 `nginx.conf` 文件，将 `server_name _;` 替换为你的域名，并配置真实的SSL证书。

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── backend/               # Express.js 后端
│   ├── controllers/       # 控制器
│   ├── routes/           # 路由
│   ├── middleware/       # 中间件
│   └── server-simple.js  # 简化服务器
├── components/            # React 组件
│   ├── Header.tsx         # 页面头部
│   ├── Stats.tsx          # 统计信息
│   ├── HeatmapView.tsx    # 热力图视图
│   ├── WordList.tsx       # 词条列表
│   ├── VoteModal.tsx      # 投票模态框
│   └── WalletProvider.tsx # 钱包提供者
├── lib/                   # 工具库
│   ├── types.ts           # TypeScript 类型
│   ├── data.ts            # 词库数据
│   ├── utils.ts           # 工具函数
│   └── solana.ts          # Solana 交易处理
├── database/              # 数据库
│   └── schema.sql         # 数据库架构
├── Dockerfile             # Docker 镜像配置
├── docker-compose.yml     # Docker Compose 配置
├── nginx.conf             # Nginx 配置
├── deploy.sh              # 部署脚本
└── setup.sh               # 初始化脚本
```

## 🔧 配置说明

### 环境变量

#### 前端配置 (.env.local)

```env
# Solana 网络配置
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# 项目方钱包地址
NEXT_PUBLIC_PROJECT_WALLET=YOUR_PROJECT_WALLET_ADDRESS

# 自定义 RPC 端点（可选）
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

#### 后端配置 (backend/.env)

```env
# 服务器配置
PORT=3001
NODE_ENV=production

# Solana 配置
SOLANA_NETWORK=mainnet-beta
PROJECT_WALLET=YOUR_PROJECT_WALLET_ADDRESS

# 安全配置
JWT_SECRET=your_very_long_and_secure_jwt_secret_key

# CORS 配置
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### 生产环境配置

#### 1. 域名配置

编辑 `nginx.conf`：

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;  # 替换为你的域名
    
    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
}
```

#### 2. SSL 证书

生产环境建议使用 Let's Encrypt 或商业SSL证书：

```bash
# 使用 Let's Encrypt
certbot certonly --nginx -d yourdomain.com
```

#### 3. 环境变量

创建生产环境配置文件：

```bash
# 生成安全的 JWT 密钥
JWT_SECRET=$(openssl rand -base64 32)

# 设置生产环境变量
export NODE_ENV=production
export SOLANA_NETWORK=mainnet-beta
export PROJECT_WALLET=your_production_wallet_address
```

## 🚀 部署选项

### 1. Vercel 部署（推荐）

```bash
# 快速部署
./deploy-vercel.sh

# 或手动部署
npm i -g vercel
vercel login
vercel --prod
```

**优势：**
- 自动 HTTPS
- 全球 CDN
- 自动部署
- 免费额度充足

### 2. Railway 部署

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录并部署
railway login
railway up
```

### 3. DigitalOcean App Platform

1. 连接 GitHub 仓库
2. 选择 Docker 部署方式
3. 配置环境变量
4. 部署

### 4. AWS ECS

### 5. 混合部署（推荐生产环境）
- **前端**: Vercel
- **后端**: Railway/Heroku/AWS
- **数据库**: PostgreSQL (Railway/Supabase)
- **缓存**: Redis (Upstash)

```bash
# 构建并推送镜像
docker build -t meme-hotmap .
docker tag meme-hotmap:latest your-registry/meme-hotmap:latest
docker push your-registry/meme-hotmap:latest

# 使用 AWS CLI 部署到 ECS
aws ecs create-service --cluster your-cluster --service-name meme-hotmap
```

## 🔧 管理命令

### 开发环境

```bash
# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 代码检查
npm run lint
```

### Docker 环境

```bash
# 启动服务
npm run docker:compose

# 查看日志
npm run docker:compose:logs

# 停止服务
npm run docker:compose:down

# 重新构建
docker-compose build --no-cache
```

### 服务器管理

```bash
# 部署到服务器
npm run deploy

# 查看服务状态
docker-compose ps

# 重启服务
docker-compose restart

# 更新服务
git pull && ./deploy.sh
```

## 📊 监控和维护

### 健康检查

- 前端健康检查: `http://yourdomain.com/health`
- 后端健康检查: `http://yourdomain.com/api/health`
- Docker 健康检查: `docker-compose ps`

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f nginx
```

### 备份和恢复

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U postgres meme_hotmap > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U postgres meme_hotmap < backup.sql
```

## 🔒 安全配置

### 1. 防火墙设置

```bash
# 只开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. SSL/TLS 配置

确保在 `nginx.conf` 中配置了安全的SSL参数：

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
```

### 3. 安全头配置

```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License

## 🆘 支持

- 📧 邮箱: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/meme-hotmap/issues)
- 📖 文档: [项目文档](https://github.com/your-username/meme-hotmap/wiki)

## 🔄 更新日志

### v1.0.0
- ✅ 基础功能实现
- ✅ 钱包连接
- ✅ 投票系统
- ✅ 热力图展示
- ✅ Docker 部署支持
- ✅ 服务器部署脚本
- ✅ GitHub Actions CI/CD 