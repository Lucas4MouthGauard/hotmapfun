#!/bin/sh

# 设置环境变量
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3000}
export BACKEND_PORT=${BACKEND_PORT:-3001}

echo "🚀 启动 Meme 热词排行项目..."
echo "环境: $NODE_ENV"
echo "前端端口: $PORT"
echo "后端端口: $BACKEND_PORT"

# 启动后端服务器
echo "🔧 启动后端服务器..."
cd backend
node server-simple.js &
BACKEND_PID=$!
echo "✅ 后端服务器已启动 (PID: $BACKEND_PID)"

# 等待后端启动
echo "⏳ 等待后端服务器启动..."
sleep 3

# 测试后端连接
echo "🔍 测试后端连接..."
if curl -s http://localhost:$BACKEND_PORT/health > /dev/null; then
    echo "✅ 后端服务器连接成功"
else
    echo "❌ 后端服务器连接失败"
    exit 1
fi

# 返回根目录
cd ..

# 启动前端服务器
echo "🎨 启动前端服务器..."
npm start &
FRONTEND_PID=$!
echo "✅ 前端服务器已启动 (PID: $FRONTEND_PID)"

# 等待前端启动
echo "⏳ 等待前端服务器启动..."
sleep 5

# 测试前端连接
echo "🔍 测试前端连接..."
if curl -s http://localhost:$PORT > /dev/null; then
    echo "✅ 前端服务器连接成功"
else
    echo "❌ 前端服务器连接失败"
    exit 1
fi

echo ""
echo "🎉 项目启动成功！"
echo ""
echo "📱 访问地址："
echo "   🌐 主页面: http://localhost:$PORT"
echo "   🔧 API测试: http://localhost:$PORT/test"
echo "   📊 后端健康检查: http://localhost:$BACKEND_PORT/health"
echo ""

# 等待进程
wait 