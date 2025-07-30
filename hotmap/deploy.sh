#!/bin/bash

# 服务器部署脚本
set -e

echo "🚀 开始部署 Meme 热词排行项目..."

# 检查必要的工具
check_requirements() {
    echo "📋 检查部署要求..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    echo "✅ 所有要求已满足"
}

# 创建环境变量文件
setup_env() {
    echo "🔧 设置环境变量..."
    
    if [ ! -f .env ]; then
        echo "📝 创建 .env 文件..."
        cat > .env << EOF
# 项目配置
PROJECT_WALLET=5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1
JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 16)

# 网络配置
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
SOLANA_NETWORK=mainnet-beta

# 服务器配置
NODE_ENV=production
PORT=3000
BACKEND_PORT=3001
EOF
        echo "✅ .env 文件已创建"
    else
        echo "✅ .env 文件已存在"
    fi
}

# 创建 SSL 证书（自签名，生产环境应使用真实证书）
setup_ssl() {
    echo "🔒 设置 SSL 证书..."
    
    if [ ! -d ssl ]; then
        mkdir -p ssl
    fi
    
    if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
        echo "📝 生成自签名 SSL 证书..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=CN/ST=State/L=City/O=Organization/CN=localhost"
        echo "✅ SSL 证书已生成"
    else
        echo "✅ SSL 证书已存在"
    fi
}

# 停止现有服务
stop_services() {
    echo "🛑 停止现有服务..."
    docker-compose down --remove-orphans || true
    echo "✅ 现有服务已停止"
}

# 构建和启动服务
build_and_start() {
    echo "🔨 构建 Docker 镜像..."
    docker-compose build --no-cache
    
    echo "🚀 启动服务..."
    docker-compose up -d
    
    echo "⏳ 等待服务启动..."
    sleep 10
}

# 健康检查
health_check() {
    echo "🔍 执行健康检查..."
    
    # 检查前端
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ 前端服务正常"
    else
        echo "❌ 前端服务异常"
        return 1
    fi
    
    # 检查后端
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ 后端服务正常"
    else
        echo "❌ 后端服务异常"
        return 1
    fi
    
    # 检查 Nginx
    if curl -f http://localhost > /dev/null 2>&1; then
        echo "✅ Nginx 服务正常"
    else
        echo "❌ Nginx 服务异常"
        return 1
    fi
    
    echo "✅ 所有服务健康检查通过"
}

# 显示部署信息
show_info() {
    echo ""
    echo "🎉 部署完成！"
    echo ""
    echo "📱 访问地址："
    echo "   🌐 HTTP: http://localhost"
    echo "   🔒 HTTPS: https://localhost"
    echo "   🔧 前端: http://localhost:3000"
    echo "   📊 后端: http://localhost:3001"
    echo "   🏥 健康检查: http://localhost/health"
    echo ""
    echo "🔧 管理命令："
    echo "   📊 查看日志: docker-compose logs -f"
    echo "   🛑 停止服务: docker-compose down"
    echo "   🔄 重启服务: docker-compose restart"
    echo "   📦 更新服务: ./deploy.sh"
    echo ""
    echo "📋 服务状态："
    docker-compose ps
    echo ""
}

# 主函数
main() {
    check_requirements
    setup_env
    setup_ssl
    stop_services
    build_and_start
    health_check
    show_info
}

# 执行主函数
main "$@" 