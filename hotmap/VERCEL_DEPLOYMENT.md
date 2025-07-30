# 🚀 Vercel 部署指南

本指南详细说明如何将 Meme 热词排行网站部署到 Vercel 平台。

## 📋 部署前准备

### 1. 项目要求
- ✅ Next.js 14+ 项目
- ✅ TypeScript 支持
- ✅ 环境变量配置
- ✅ API 路由配置

### 2. 后端服务
由于 Vercel 主要部署前端，您需要：
- 部署后端到其他平台（如 Railway、Heroku、AWS 等）
- 或者使用 Vercel Serverless Functions

## 🚀 部署步骤

### 方法一：通过 Vercel CLI

#### 1. 安装 Vercel CLI
```bash
npm i -g vercel
```

#### 2. 登录 Vercel
```bash
vercel login
```

#### 3. 配置环境变量
```bash
# 设置环境变量
vercel env add NEXT_PUBLIC_SOLANA_NETWORK
vercel env add NEXT_PUBLIC_PROJECT_WALLET
vercel env add NEXT_PUBLIC_BACKEND_DOMAIN
```

#### 4. 部署项目
```bash
# 开发环境部署
vercel

# 生产环境部署
vercel --prod
```

### 方法二：通过 Vercel Dashboard

#### 1. 推送代码到 GitHub
```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

#### 2. 连接 GitHub 仓库
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择您的 GitHub 仓库
4. 配置项目设置

#### 3. 配置环境变量
在 Vercel Dashboard 中设置：
```
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_PROJECT_WALLET=your_wallet_address
NEXT_PUBLIC_BACKEND_DOMAIN=your_backend_domain.com
```

#### 4. 部署
点击 "Deploy" 按钮开始部署

## ⚙️ 配置说明

### vercel.json 配置
```json
{
  "version": 2,
  "name": "meme-hotmap",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-domain.com/api/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SOLANA_NETWORK": "mainnet-beta",
    "NEXT_PUBLIC_PROJECT_WALLET": "@project_wallet"
  }
}
```

### 环境变量配置
```env
# 前端环境变量
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_PROJECT_WALLET=your_wallet_address
NEXT_PUBLIC_BACKEND_DOMAIN=your_backend_domain.com

# 可选：自定义 RPC 端点
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## 🔧 后端集成

### 选项 1：外部后端服务
如果您有独立的后端服务：

1. **部署后端**到其他平台（Railway、Heroku、AWS 等）
2. **配置 CORS**允许 Vercel 域名访问
3. **更新 vercel.json**中的后端域名

### 选项 2：Vercel Serverless Functions
将后端 API 转换为 Vercel Functions：

```typescript
// app/api/words/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  // 您的 API 逻辑
  return NextResponse.json({ words: [] })
}
```

### 选项 3：混合部署
- 前端：Vercel
- 后端：其他平台
- 数据库：外部数据库服务

## 📊 性能优化

### 1. 图片优化
```typescript
import Image from 'next/image'

// 使用 Next.js Image 组件
<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority
/>
```

### 2. 静态生成
```typescript
// 在页面组件中
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
  ]
}
```

### 3. 缓存策略
```typescript
// API 路由缓存
export async function GET() {
  const data = await fetchData()
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
    },
  })
}
```

## 🔒 安全配置

### 1. 安全头配置
在 `vercel.json` 中：
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### 2. 环境变量安全
- 使用 Vercel 的环境变量功能
- 不要在代码中硬编码敏感信息
- 定期轮换密钥

## 📈 监控和分析

### 1. Vercel Analytics
```bash
# 安装 Vercel Analytics
npm install @vercel/analytics
```

```typescript
// 在 layout.tsx 中
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. 性能监控
- 使用 Vercel Dashboard 查看性能指标
- 监控 Core Web Vitals
- 分析用户行为

## 🚨 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 检查构建日志
vercel logs

# 本地测试构建
npm run build
```

#### 2. 环境变量问题
```bash
# 检查环境变量
vercel env ls

# 重新设置环境变量
vercel env add VARIABLE_NAME
```

#### 3. API 路由问题
- 检查 `app/api/` 目录结构
- 确保使用正确的 HTTP 方法
- 验证响应格式

#### 4. 跨域问题
在后端配置 CORS：
```javascript
app.use(cors({
  origin: ['https://your-vercel-domain.vercel.app'],
  credentials: true
}))
```

## 🔄 持续部署

### 1. 自动部署
- 推送到 `main` 分支自动触发部署
- 创建 Pull Request 进行预览部署

### 2. 部署钩子
```bash
# 手动触发部署
vercel --prod
```

### 3. 回滚部署
在 Vercel Dashboard 中：
1. 进入项目
2. 点击 "Deployments"
3. 选择要回滚的版本
4. 点击 "Redeploy"

## 📊 部署状态

### 部署检查清单
- [ ] 代码推送到 GitHub
- [ ] 环境变量配置完成
- [ ] 后端服务正常运行
- [ ] 域名配置正确
- [ ] SSL 证书有效
- [ ] 性能测试通过
- [ ] 功能测试完成

### 部署后验证
```bash
# 检查部署状态
vercel ls

# 查看部署日志
vercel logs

# 测试健康检查
curl https://your-domain.vercel.app/api/health
```

## 🎯 最佳实践

### 1. 开发流程
- 使用 Git 分支管理
- 本地测试后再部署
- 使用预览部署测试

### 2. 性能优化
- 启用静态生成
- 优化图片和资源
- 使用 CDN 缓存

### 3. 安全措施
- 定期更新依赖
- 使用环境变量
- 配置安全头

### 4. 监控维护
- 设置性能监控
- 配置错误追踪
- 定期备份数据

## 📞 支持

### Vercel 支持
- [Vercel 文档](https://vercel.com/docs)
- [Vercel 社区](https://github.com/vercel/vercel/discussions)
- [Vercel 支持](https://vercel.com/support)

### 项目支持
- 查看项目 README.md
- 提交 GitHub Issue
- 联系项目维护者

---

**部署完成时间**: 根据您的配置而定
**部署状态**: 准备就绪 ✅ 