#!/bin/bash

echo "🛑 停止 Meme 热词排行项目..."

# 停止前端服务器
echo "🛑 停止前端服务器..."
pkill -f "next dev"
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    kill $FRONTEND_PID 2>/dev/null
    rm .frontend.pid
fi

# 停止后端服务器
echo "🛑 停止后端服务器..."
pkill -f "server-simple.js"
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    kill $BACKEND_PID 2>/dev/null
    rm .backend.pid
fi

# 等待进程完全停止
sleep 2

# 检查端口是否已释放
echo "🔍 检查端口状态..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 3000 仍被占用，强制停止..."
    lsof -ti:3000 | xargs kill -9
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 3001 仍被占用，强制停止..."
    lsof -ti:3001 | xargs kill -9
fi

echo "✅ 所有服务已停止"
echo ""
echo "📋 清理完成："
echo "   🗑️  前端服务器: 已停止"
echo "   🗑️  后端服务器: 已停止"
echo "   🔓 端口 3000: 已释放"
echo "   🔓 端口 3001: 已释放"
echo ""
echo "💡 提示：运行 ./start.sh 重新启动项目" 