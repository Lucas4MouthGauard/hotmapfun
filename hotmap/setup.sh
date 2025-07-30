#!/bin/bash

# 项目初始化设置脚本
set -e

echo "🚀 初始化 Meme 热词排行项目..."

# 检查 Node.js 版本
check_node_version() {
    echo "📋 检查 Node.js 版本..."
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "❌ Node.js 版本过低，需要 18+ 版本"
        exit 1
    fi
    
    echo "✅ Node.js 版本检查通过: $(node -v)"
}

# 安装依赖
install_dependencies() {
    echo "📦 安装前端依赖..."
    npm install
    
    echo "📦 安装后端依赖..."
    cd backend
    npm install
    cd ..
    
    echo "✅ 依赖安装完成"
}

# 设置环境变量
setup_environment() {
    echo "🔧 设置环境变量..."
    
    if [ ! -f .env.local ]; then
        echo "📝 创建前端环境变量文件..."
        cat > .env.local << EOF
# Solana 网络配置
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# 项目方钱包地址（用于接收付费投票）
NEXT_PUBLIC_PROJECT_WALLET=5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1

# 可选：自定义 RPC 端点
# NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
EOF
        echo "✅ 前端环境变量文件已创建"
    else
        echo "✅ 前端环境变量文件已存在"
    fi
    
    if [ ! -f backend/.env ]; then
        echo "📝 创建后端环境变量文件..."
        cat > backend/.env << EOF
# 服务器配置
PORT=3001
NODE_ENV=development
APP_VERSION=1.0.0

# Solana配置
SOLANA_NETWORK=devnet
PROJECT_WALLET=5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1

# 安全配置
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here_minimum_32_characters

# CORS配置
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# 日志配置
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
EOF
        echo "✅ 后端环境变量文件已创建"
    else
        echo "✅ 后端环境变量文件已存在"
    fi
}

# 创建必要的目录
create_directories() {
    echo "📁 创建必要的目录..."
    
    mkdir -p backend/logs
    mkdir -p public
    mkdir -p ssl
    
    echo "✅ 目录创建完成"
}

# 设置 Git hooks
setup_git_hooks() {
    echo "🔗 设置 Git hooks..."
    
    if [ -d .git ]; then
        mkdir -p .git/hooks
        
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 运行代码检查..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ 代码检查失败，请修复后重新提交"
    exit 1
fi
echo "✅ 代码检查通过"
EOF
        
        chmod +x .git/hooks/pre-commit
        echo "✅ Git hooks 设置完成"
    else
        echo "⚠️  不是 Git 仓库，跳过 Git hooks 设置"
    fi
}

# 显示设置信息
show_setup_info() {
    echo ""
    echo "🎉 项目初始化完成！"
    echo ""
    echo "📋 下一步操作："
    echo "   1. 启动开发服务器: npm run dev"
    echo "   2. 或者使用 Docker: npm run docker:compose"
    echo "   3. 或者部署到服务器: npm run deploy"
    echo ""
    echo "📱 开发环境访问地址："
    echo "   🌐 前端: http://localhost:3000"
    echo "   🔧 后端: http://localhost:3001"
    echo "   📊 健康检查: http://localhost:3001/health"
    echo ""
    echo "🔧 常用命令："
    echo "   📦 安装依赖: npm install"
    echo "   🚀 开发模式: npm run dev"
    echo "   🔨 构建项目: npm run build"
    echo "   🐳 Docker 部署: npm run docker:compose"
    echo "   🖥️  服务器部署: npm run deploy"
    echo ""
    echo "📖 相关文档："
    echo "   📄 README.md - 项目说明"
    echo "   📊 PROJECT_STATUS.md - 项目状态"
    echo "   🗄️  database/schema.sql - 数据库架构"
    echo ""
}

# 主函数
main() {
    check_node_version
    install_dependencies
    setup_environment
    create_directories
    setup_git_hooks
    show_setup_info
}

# 执行主函数
main "$@" 