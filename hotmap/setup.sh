#!/bin/bash

echo "🚀 开始设置 Meme 热词排行网站..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node_version=$(node -v)
echo "当前 Node.js 版本: $node_version"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 创建环境变量文件
echo "⚙️ 创建环境变量文件..."
if [ ! -f .env.local ]; then
    cp env.example .env.local
    echo "✅ 已创建 .env.local 文件"
    echo "⚠️  请编辑 .env.local 文件，设置你的项目方钱包地址"
else
    echo "✅ .env.local 文件已存在"
fi

# 检查 TypeScript 配置
echo "🔧 检查 TypeScript 配置..."
if [ ! -f next-env.d.ts ]; then
    echo "✅ TypeScript 配置正常"
fi

echo ""
echo "🎉 项目设置完成！"
echo ""
echo "📝 下一步："
echo "1. 编辑 .env.local 文件，设置你的项目方钱包地址"
echo "2. 编辑 lib/data.ts 文件，添加你的词条数据"
echo "3. 运行 'npm run dev' 启动开发服务器"
echo "4. 访问 http://localhost:3000 查看应用"
echo ""
echo "🔗 相关文档："
echo "- README.md - 项目说明文档"
echo "- lib/data.ts - 词库配置"
echo "- lib/solana.ts - 区块链配置"
echo "" 