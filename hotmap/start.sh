#!/bin/bash

echo "🚀 启动 Meme 热词排行项目..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node_version=$(node -v)
echo "当前 Node.js 版本: $node_version"

# 检查端口占用
echo "🔍 检查端口占用..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 3000 已被占用，正在停止..."
    pkill -f "next dev"
    sleep 2
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 3001 已被占用，正在停止..."
    pkill -f "server-simple.js"
    sleep 2
fi

# 启动后端服务器
echo "🔧 启动后端服务器..."
cd backend
if [ ! -f "node_modules/.bin/nodemon" ]; then
    echo "📦 安装后端依赖..."
    npm install
fi

# 启动后端服务器（后台运行）
node server-simple.js &
BACKEND_PID=$!
echo "✅ 后端服务器已启动 (PID: $BACKEND_PID)"

# 等待后端启动
echo "⏳ 等待后端服务器启动..."
sleep 3

# 测试后端连接
echo "🔍 测试后端连接..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 后端服务器连接成功"
else
    echo "❌ 后端服务器连接失败"
    exit 1
fi

# 返回根目录
cd ..

# 启动前端服务器
echo "🎨 启动前端服务器..."
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

# 启动前端服务器（后台运行）
npm run dev &
FRONTEND_PID=$!
echo "✅ 前端服务器已启动 (PID: $FRONTEND_PID)"

# 等待前端启动
echo "⏳ 等待前端服务器启动..."
sleep 5

# 测试前端连接
echo "🔍 测试前端连接..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服务器连接成功"
else
    echo "❌ 前端服务器连接失败"
    exit 1
fi

echo ""
echo "🎉 项目启动成功！"
echo ""
echo "📱 访问地址："
echo "   🌐 主页面: http://localhost:3000"
echo "   🔧 API测试: http://localhost:3000/test"
echo "   📊 后端健康检查: http://localhost:3001/health"
echo ""
echo "🔧 开发工具："
echo "   📝 前端日志: 查看终端输出"
echo "   🔧 后端日志: 查看终端输出"
echo "   🗑️  停止服务: 按 Ctrl+C 或运行 ./stop.sh"
echo ""
echo "📋 项目状态："
echo "   ✅ 前端服务器: 运行中 (端口 3000)"
echo "   ✅ 后端服务器: 运行中 (端口 3001)"
echo "   ⏳ 数据库: 使用模拟数据"
echo ""
echo "🔗 相关文档："
echo "   📖 README.md - 项目说明"
echo "   📊 PROJECT_STATUS.md - 项目状态"
echo "   🗄️  database/schema.sql - 数据库架构"
echo ""

# 保存进程ID到文件
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# 等待用户中断
echo "按 Ctrl+C 停止所有服务..."
wait 