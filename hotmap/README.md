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
- **样式**: Tailwind CSS + Framer Motion
- **区块链**: Solana Web3.js
- **钱包**: Solana Wallet Adapter
- **语言**: TypeScript

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境

复制 `.env.example` 为 `.env.local` 并配置：

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROJECT_WALLET=YOUR_PROJECT_WALLET_ADDRESS
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
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
└── public/                # 静态资源
```

## 🎨 自定义配置

### 修改词库

编辑 `lib/data.ts` 文件中的 `MEME_WORDS` 数组：

```typescript
export const MEME_WORDS: MemeWord[] = [
  { 
    id: 1, 
    word: "你的词条", 
    votes: 0, 
    percentage: 0, 
    category: "分类", 
    emoji: "🔥" 
  },
  // ... 更多词条
]
```

### 修改投票规则

在 `lib/data.ts` 中修改 `CONFIG` 对象：

```typescript
export const CONFIG = {
  FREE_VOTES_PER_DAY: 3,        // 每日免费投票次数
  PAID_VOTE_COST: 0.02,         // 付费投票费用 (SOL)
  MAX_VOTES_PER_DAY: 50,        // 每日最大投票次数
  HEATMAP_TOP_COUNT: 100,       // 热力图显示数量
  PROJECT_WALLET: "YOUR_ADDRESS" // 项目方钱包地址
}
```

### 切换网络

在 `lib/solana.ts` 中修改连接：

```typescript
// 开发环境
return new Connection('https://api.devnet.solana.com', 'confirmed')

// 生产环境
return new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
```

## 🔧 开发指南

### 添加新组件

1. 在 `components/` 目录下创建新组件
2. 使用 TypeScript 和 Tailwind CSS
3. 添加必要的类型定义

### 修改样式

- 全局样式：`app/globals.css`
- Tailwind 配置：`tailwind.config.js`
- 组件样式：使用 Tailwind 类名

### 区块链交互

- Solana 连接：`lib/solana.ts`
- 钱包适配：`components/WalletProvider.tsx`
- 交易处理：使用 `@solana/web3.js`

## 🚀 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 其他平台

项目支持部署到任何支持 Next.js 的平台：
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🆘 支持

如有问题，请提交 Issue 或联系开发者。 