#!/bin/bash

echo "🎬 Meme 热词排行项目演示"
echo "================================"
echo ""

# 检查服务状态
echo "🔍 检查服务状态..."

# 检查前端
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服务器: 运行中 (http://localhost:3000)"
else
    echo "❌ 前端服务器: 未运行"
    echo "💡 请先运行 ./start.sh 启动项目"
    exit 1
fi

# 检查后端
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 后端服务器: 运行中 (http://localhost:3001)"
else
    echo "❌ 后端服务器: 未运行"
    echo "💡 请先运行 ./start.sh 启动项目"
    exit 1
fi

echo ""
echo "📊 项目功能演示"
echo "================================"
echo ""

# 演示API功能
echo "🔧 API 功能演示："
echo ""

# 获取词条数据
echo "📝 获取词条列表 (前5个)："
WORDS_RESPONSE=$(curl -s "http://localhost:3001/api/words?limit=5")
echo "$WORDS_RESPONSE" | jq -r '.data.data[] | "  \(.emoji) \(.word) - \(.total_votes)票 (\(.percentage)%)"' 2>/dev/null || echo "  无法解析响应"

echo ""

# 获取热力图数据
echo "🔥 获取热力图数据："
HEATMAP_RESPONSE=$(curl -s "http://localhost:3001/api/words/heatmap/top?limit=3")
echo "$HEATMAP_RESPONSE" | jq -r '.data.data[] | "  \(.emoji) \(.word) - 排名#\(.current_rank)"' 2>/dev/null || echo "  无法解析响应"

echo ""

# 获取分类数据
echo "📂 获取分类统计："
CATEGORIES_RESPONSE=$(curl -s "http://localhost:3001/api/words/categories/list")
echo "$CATEGORIES_RESPONSE" | jq -r '.data.categories[] | "  \(.category): \(.word_count)个词条, \(.total_votes)票"' 2>/dev/null || echo "  无法解析响应"

echo ""

# 获取统计概览
echo "📈 获取统计概览："
STATS_RESPONSE=$(curl -s "http://localhost:3001/api/stats/overview")
TOTAL_WORDS=$(echo "$STATS_RESPONSE" | jq -r '.data.words.total' 2>/dev/null || echo "未知")
TOTAL_VOTES=$(echo "$STATS_RESPONSE" | jq -r '.data.today.votes' 2>/dev/null || echo "未知")
echo "  总词条数: $TOTAL_WORDS"
echo "  总投票数: $TOTAL_VOTES"

echo ""
echo "🎯 演示投票功能："
echo ""

# 模拟用户登录
echo "👤 模拟用户登录："
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"wallet_address": "demo_wallet_123"}')
echo "$LOGIN_RESPONSE" | jq -r '.data.user | "  钱包地址: \(.wallet_address)"' 2>/dev/null || echo "  登录失败"

echo ""

# 获取投票状态
echo "🗳️ 获取投票状态："
VOTE_STATUS_RESPONSE=$(curl -s "http://localhost:3001/api/votes/user/demo_wallet_123/today")
FREE_VOTES=$(echo "$VOTE_STATUS_RESPONSE" | jq -r '.data.todayStats.remainingFreeVotes' 2>/dev/null || echo "未知")
TOTAL_REMAINING=$(echo "$VOTE_STATUS_RESPONSE" | jq -r '.data.todayStats.remainingTotalVotes' 2>/dev/null || echo "未知")
echo "  剩余免费投票: $FREE_VOTES"
echo "  剩余总投票: $TOTAL_REMAINING"

echo ""
echo "🎮 交互功能："
echo ""

echo "🌐 访问主页面体验完整功能："
echo "  http://localhost:3000"
echo ""

echo "🔧 访问API测试页面："
echo "  http://localhost:3000/test"
echo ""

echo "📊 访问后端健康检查："
echo "  http://localhost:3001/health"
echo ""

echo "🎯 核心功能说明："
echo "  ✅ 连接 Solana 钱包"
echo "  ✅ 浏览热力图和列表视图"
echo "  ✅ 搜索和筛选词条"
echo "  ✅ 免费投票 (每日3次)"
echo "  ✅ 付费投票 (0.02 SOL)"
echo "  ✅ 实时排行榜更新"
echo "  ✅ 响应式设计"
echo ""

echo "💡 使用提示："
echo "  🔗 需要安装 Solana 钱包扩展 (Phantom/OKX)"
echo "  🎯 切换到 Devnet 网络进行测试"
echo "  💰 付费投票需要真实的 SOL 余额"
echo "  📱 支持移动端和桌面端"
echo ""

echo "🚀 项目特色："
echo "  🎨 现代化 UI 设计"
echo "  ⚡ 实时数据更新"
echo "  🔒 安全的投票机制"
echo "  📊 丰富的统计信息"
echo "  🌐 完整的 API 接口"
echo ""

echo "📈 下一步计划："
echo "  🗄️ 集成 PostgreSQL 数据库"
echo "  💎 实现真实 Solana 交易"
echo "  🔄 添加实时数据同步"
echo "  👥 用户个人资料系统"
echo "  📱 移动端优化"
echo ""

echo "🎉 演示完成！"
echo "================================"
echo "感谢使用 Meme 热词排行项目！" 