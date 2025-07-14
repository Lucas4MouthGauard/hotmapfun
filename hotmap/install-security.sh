#!/bin/bash

# 🔒 Meme热词排行系统安全安装脚本
# 此脚本将安装所有安全相关的依赖和配置

set -e  # 遇到错误立即退出

echo "🔒 开始安全安装..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Node.js版本
check_node_version() {
    print_status "检查Node.js版本..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js未安装，请先安装Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        print_error "Node.js版本过低，需要18.0.0或更高版本"
        exit 1
    fi
    
    print_success "Node.js版本检查通过: $NODE_VERSION"
}

# 检查npm版本
check_npm_version() {
    print_status "检查npm版本..."
    
    NPM_VERSION=$(npm -v)
    REQUIRED_VERSION="8.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NPM_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        print_error "npm版本过低，需要8.0.0或更高版本"
        exit 1
    fi
    
    print_success "npm版本检查通过: $NPM_VERSION"
}

# 安装后端安全依赖
install_backend_security() {
    print_status "安装后端安全依赖..."
    
    cd backend
    
    # 安装新的安全依赖
    npm install --save \
        jsonwebtoken@^9.0.2 \
        xss@^1.0.14 \
        bcryptjs@^2.4.3 \
        express-validator@^7.0.1 \
        compression@^1.7.4 \
        express-mongo-sanitize@^2.2.0 \
        hpp@^0.2.3 \
        express-brute@^1.0.1 \
        express-brute-redis@^0.0.1 \
        redis@^4.6.10 \
        winston@^3.11.0 \
        winston-daily-rotate-file@^4.7.1 \
        express-slow-down@^2.0.1
    
    # 安装开发依赖
    npm install --save-dev \
        eslint@^8.55.0 \
        eslint-config-standard@^17.1.0 \
        eslint-plugin-import@^2.29.0 \
        eslint-plugin-n@^16.3.1 \
        eslint-plugin-promise@^6.1.1 \
        supertest@^6.3.3
    
    print_success "后端安全依赖安装完成"
    cd ..
}

# 创建环境配置文件
create_env_file() {
    print_status "创建环境配置文件..."
    
    if [ ! -f "backend/.env" ]; then
        cp backend/env.example backend/.env
        print_warning "已创建 backend/.env 文件，请修改其中的配置"
    else
        print_warning "backend/.env 文件已存在，请检查配置"
    fi
    
    if [ ! -f ".env.local" ]; then
        cp env.example .env.local
        print_warning "已创建 .env.local 文件，请修改其中的配置"
    else
        print_warning ".env.local 文件已存在，请检查配置"
    fi
}

# 创建日志目录
create_log_directories() {
    print_status "创建日志目录..."
    
    mkdir -p backend/logs
    mkdir -p logs
    
    # 设置权限
    chmod 755 backend/logs
    chmod 755 logs
    
    print_success "日志目录创建完成"
}

# 创建ESLint配置
create_eslint_config() {
    print_status "创建ESLint配置..."
    
    cd backend
    
    if [ ! -f ".eslintrc.js" ]; then
        cat > .eslintrc.js << 'EOF'
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  }
}
EOF
        print_success "ESLint配置创建完成"
    else
        print_warning "ESLint配置已存在"
    fi
    
    cd ..
}

# 运行安全检查
run_security_checks() {
    print_status "运行安全检查..."
    
    cd backend
    
    # 检查依赖漏洞
    print_status "检查npm依赖漏洞..."
    if npm audit --audit-level=moderate; then
        print_success "依赖安全检查通过"
    else
        print_warning "发现依赖安全漏洞，建议运行: npm audit fix"
    fi
    
    # 运行ESLint
    print_status "运行代码质量检查..."
    if npm run lint; then
        print_success "代码质量检查通过"
    else
        print_warning "发现代码质量问题，建议运行: npm run lint:fix"
    fi
    
    cd ..
}

# 创建安全测试脚本
create_security_tests() {
    print_status "创建安全测试脚本..."
    
    cat > test-security.sh << 'EOF'
#!/bin/bash

echo "🔒 运行安全测试..."

# 测试速率限制
echo "测试速率限制..."
for i in {1..150}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/words)
    if [ "$response" = "429" ]; then
        echo "✅ 速率限制正常工作 (第$i次请求被限制)"
        break
    fi
done

# 测试输入验证
echo "测试输入验证..."
response=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"wallet_address": "<script>alert(1)</script>"}')
if echo "$response" | grep -q "参数验证失败"; then
    echo "✅ XSS防护正常工作"
else
    echo "❌ XSS防护可能存在问题"
fi

# 测试管理员权限
echo "测试管理员权限..."
response=$(curl -s -X GET http://localhost:3002/api/admin/users)
if echo "$response" | grep -q "访问被拒绝"; then
    echo "✅ 管理员权限保护正常工作"
else
    echo "❌ 管理员权限保护可能存在问题"
fi

echo "安全测试完成"
EOF
    
    chmod +x test-security.sh
    print_success "安全测试脚本创建完成"
}

# 显示安全配置说明
show_security_notes() {
    echo ""
    echo "🔒 安全安装完成！"
    echo ""
    echo "📋 重要安全配置说明："
    echo ""
    echo "1. 环境变量配置："
    echo "   - 修改 backend/.env 文件"
    echo "   - 设置强密码的 JWT_SECRET (至少32字符)"
    echo "   - 配置安全的数据库密码"
    echo "   - 设置正确的 ALLOWED_ORIGINS"
    echo ""
    echo "2. 生产环境部署："
    echo "   - 启用HTTPS"
    echo "   - 配置防火墙"
    echo "   - 设置日志监控"
    echo "   - 定期备份数据库"
    echo ""
    echo "3. 安全维护："
    echo "   - 定期运行: npm audit"
    echo "   - 定期运行: npm run lint"
    echo "   - 定期更新依赖包"
    echo ""
    echo "4. 测试安全功能："
    echo "   - 运行: ./test-security.sh"
    echo ""
    echo "📖 详细安全指南请查看: SECURITY_GUIDE.md"
    echo ""
}

# 主函数
main() {
    echo "🚀 Meme热词排行系统安全安装脚本"
    echo "=================================="
    echo ""
    
    # 检查系统要求
    check_node_version
    check_npm_version
    
    # 安装安全依赖
    install_backend_security
    
    # 创建配置文件
    create_env_file
    create_log_directories
    create_eslint_config
    
    # 运行安全检查
    run_security_checks
    
    # 创建测试脚本
    create_security_tests
    
    # 显示说明
    show_security_notes
    
    print_success "安全安装完成！"
}

# 运行主函数
main "$@" 