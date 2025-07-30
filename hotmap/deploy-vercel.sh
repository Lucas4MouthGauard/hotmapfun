#!/bin/bash

# Vercel 快速部署脚本
set -e

echo "🚀 开始部署到 Vercel..."

# 检查 Vercel CLI
check_vercel_cli() {
    echo "📋 检查 Vercel CLI..."
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI 未安装，正在安装..."
        npm install -g vercel
    fi
    echo "✅ Vercel CLI 已安装"
}

# 检查登录状态
check_login() {
    echo "🔐 检查登录状态..."
    if ! vercel whoami &> /dev/null; then
        echo "⚠️  未登录 Vercel，请登录..."
        vercel login
    fi
    echo "✅ 已登录 Vercel"
}

# 配置环境变量
setup_env() {
    echo "🔧 配置环境变量..."
    
    # 检查是否已设置环境变量
    if ! vercel env ls &> /dev/null; then
        echo "📝 设置环境变量..."
        
        # 设置 Solana 网络
        echo "请输入 Solana 网络 (devnet/mainnet-beta):"
        read -r solana_network
        solana_network=${solana_network:-mainnet-beta}
        
        # 设置项目钱包地址
        echo "请输入项目钱包地址:"
        read -r project_wallet
        project_wallet=${project_wallet:-5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1}
        
        # 设置后端域名
        echo "请输入后端域名 (可选):"
        read -r backend_domain
        backend_domain=${backend_domain:-your-backend-domain.com}
        
        # 添加环境变量
        echo "$solana_network" | vercel env add NEXT_PUBLIC_SOLANA_NETWORK
        echo "$project_wallet" | vercel env add NEXT_PUBLIC_PROJECT_WALLET
        echo "$backend_domain" | vercel env add NEXT_PUBLIC_BACKEND_DOMAIN
        
        echo "✅ 环境变量设置完成"
    else
        echo "✅ 环境变量已存在"
    fi
}

# 构建项目
build_project() {
    echo "🔨 构建项目..."
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo "📦 安装依赖..."
        npm install
    fi
    
    # 构建项目
    echo "🏗️  构建 Next.js 项目..."
    npm run build
    
    echo "✅ 项目构建完成"
}

# 部署到 Vercel
deploy_to_vercel() {
    echo "🚀 部署到 Vercel..."
    
    # 检查是否已有项目
    if [ -f ".vercel/project.json" ]; then
        echo "📦 更新现有项目..."
        vercel --prod
    else
        echo "🆕 创建新项目..."
        vercel --prod
    fi
    
    echo "✅ 部署完成"
}

# 验证部署
verify_deployment() {
    echo "🔍 验证部署..."
    
    # 获取部署 URL
    deployment_url=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "")
    
    if [ -n "$deployment_url" ]; then
        echo "✅ 部署成功！"
        echo "🌐 访问地址: https://$deployment_url"
        echo "🏥 健康检查: https://$deployment_url/api/health"
        
        # 测试健康检查
        echo "🔍 测试健康检查..."
        if curl -f "https://$deployment_url/api/health" &> /dev/null; then
            echo "✅ 健康检查通过"
        else
            echo "⚠️  健康检查失败，请手动检查"
        fi
    else
        echo "❌ 无法获取部署 URL"
    fi
}

# 显示部署信息
show_info() {
    echo ""
    echo "🎉 Vercel 部署完成！"
    echo ""
    echo "📋 部署信息："
    echo "   🌐 项目地址: https://$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo 'unknown')"
    echo "   📊 项目状态: 运行中"
    echo "   🔧 环境: 生产环境"
    echo ""
    echo "🔧 管理命令："
    echo "   📊 查看项目: vercel ls"
    echo "   📝 查看日志: vercel logs"
    echo "   🔄 重新部署: vercel --prod"
    echo "   🛑 删除项目: vercel remove"
    echo ""
    echo "📖 相关文档："
    echo "   📄 VERCEL_DEPLOYMENT.md - Vercel 部署指南"
    echo "   📄 README.md - 项目说明"
    echo "   📄 DEPLOYMENT.md - 完整部署指南"
    echo ""
}

# 主函数
main() {
    check_vercel_cli
    check_login
    setup_env
    build_project
    deploy_to_vercel
    verify_deployment
    show_info
}

# 执行主函数
main "$@" 