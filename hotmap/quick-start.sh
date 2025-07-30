#!/bin/bash

# 快速启动脚本 - 适用于开发和生产环境
set -e

echo "🚀 Meme 热词排行项目快速启动..."

# 检查参数
ENV=${1:-dev}
echo "环境: $ENV"

case $ENV in
  "dev"|"development")
    echo "🔧 启动开发环境..."
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo "📦 安装前端依赖..."
        npm install
    fi
    
    if [ ! -d "backend/node_modules" ]; then
        echo "📦 安装后端依赖..."
        cd backend && npm install && cd ..
    fi
    
    # 启动开发服务器
    echo "🚀 启动开发服务器..."
    npm run dev
    ;;
    
  "prod"|"production")
    echo "🏭 启动生产环境..."
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    # 使用生产配置
    if [ -f "docker-compose.prod.yml" ]; then
        echo "🐳 使用生产 Docker Compose 配置..."
        docker-compose -f docker-compose.prod.yml up -d
    else
        echo "🐳 使用默认 Docker Compose 配置..."
        docker-compose up -d
    fi
    
    echo "✅ 生产环境启动完成"
    echo "📱 访问地址："
    echo "   🌐 HTTP: http://localhost"
    echo "   🔒 HTTPS: https://localhost"
    echo "   🔧 前端: http://localhost:3000"
    echo "   📊 后端: http://localhost:3001"
    ;;
    
  "docker")
    echo "🐳 启动 Docker 环境..."
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    # 启动 Docker 服务
    docker-compose up -d
    
    echo "✅ Docker 环境启动完成"
    echo "📱 访问地址："
    echo "   🌐 HTTP: http://localhost"
    echo "   🔒 HTTPS: https://localhost"
    echo "   🔧 前端: http://localhost:3000"
    echo "   📊 后端: http://localhost:3001"
    ;;
    
  "setup")
    echo "⚙️ 运行项目设置..."
    ./setup.sh
    ;;
    
  "deploy")
    echo "🚀 运行部署脚本..."
    ./deploy.sh
    ;;
    
  *)
    echo "❌ 未知环境: $ENV"
    echo ""
    echo "用法: ./quick-start.sh [环境]"
    echo ""
    echo "可用环境:"
    echo "  dev, development  - 开发环境"
    echo "  prod, production  - 生产环境"
    echo "  docker           - Docker 环境"
    echo "  setup            - 项目设置"
    echo "  deploy           - 部署到服务器"
    echo ""
    echo "示例:"
    echo "  ./quick-start.sh dev      # 启动开发环境"
    echo "  ./quick-start.sh prod     # 启动生产环境"
    echo "  ./quick-start.sh docker   # 启动 Docker 环境"
    exit 1
    ;;
esac 