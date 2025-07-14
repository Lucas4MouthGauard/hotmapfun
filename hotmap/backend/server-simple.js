const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// 模拟数据
const mockWords = [
  // 网络热词
  { id: 1, word: "火箭", category: "网络", total_votes: 150, free_votes: 120, paid_votes: 30, current_rank: 1, percentage: 15 },
  { id: 2, word: "热词", category: "网络", total_votes: 120, free_votes: 100, paid_votes: 20, current_rank: 2, percentage: 12 },
  { id: 3, word: "钻石手", category: "网络", total_votes: 100, free_votes: 80, paid_votes: 20, current_rank: 3, percentage: 10 },
  { id: 4, word: "月亮", category: "网络", total_votes: 90, free_votes: 70, paid_votes: 20, current_rank: 4, percentage: 9 },
  { id: 5, word: "狗狗", category: "网络", total_votes: 80, free_votes: 60, paid_votes: 20, current_rank: 5, percentage: 8 },
  { id: 6, word: "猫咪", category: "网络", total_votes: 70, free_votes: 50, paid_votes: 20, current_rank: 6, percentage: 7 },
  { id: 7, word: "披萨", category: "网络", total_votes: 60, free_votes: 40, paid_votes: 20, current_rank: 7, percentage: 6 },
  { id: 8, word: "咖啡", category: "网络", total_votes: 50, free_votes: 30, paid_votes: 20, current_rank: 8, percentage: 5 },
  { id: 9, word: "音乐", category: "网络", total_votes: 40, free_votes: 20, paid_votes: 20, current_rank: 9, percentage: 4 },
  { id: 10, word: "游戏", category: "网络", total_votes: 35, free_votes: 15, paid_votes: 20, current_rank: 10, percentage: 3.5 },
  
  // 投资相关
  { id: 11, word: "牛市", category: "投资", total_votes: 95, free_votes: 75, paid_votes: 20, current_rank: 11, percentage: 9.5 },
  { id: 12, word: "熊市", category: "投资", total_votes: 85, free_votes: 65, paid_votes: 20, current_rank: 12, percentage: 8.5 },
  { id: 13, word: "财富", category: "投资", total_votes: 75, free_votes: 55, paid_votes: 20, current_rank: 13, percentage: 7.5 },
  { id: 14, word: "银行", category: "投资", total_votes: 65, free_votes: 45, paid_votes: 20, current_rank: 14, percentage: 6.5 },
  { id: 15, word: "信用卡", category: "投资", total_votes: 55, free_votes: 35, paid_votes: 20, current_rank: 15, percentage: 5.5 },
  
  // 生活日常
  { id: 16, word: "睡觉", category: "生活", total_votes: 45, free_votes: 25, paid_votes: 20, current_rank: 16, percentage: 4.5 },
  { id: 17, word: "汉堡", category: "生活", total_votes: 42, free_votes: 22, paid_votes: 20, current_rank: 17, percentage: 4.2 },
  { id: 18, word: "房子", category: "生活", total_votes: 38, free_votes: 18, paid_votes: 20, current_rank: 18, percentage: 3.8 },
  { id: 19, word: "汽车", category: "生活", total_votes: 35, free_votes: 15, paid_votes: 20, current_rank: 19, percentage: 3.5 },
  { id: 20, word: "手机", category: "生活", total_votes: 32, free_votes: 12, paid_votes: 20, current_rank: 20, percentage: 3.2 },
  
  // 娱乐休闲
  { id: 21, word: "电影", category: "娱乐", total_votes: 30, free_votes: 10, paid_votes: 20, current_rank: 21, percentage: 3 },
  { id: 22, word: "电视", category: "娱乐", total_votes: 28, free_votes: 8, paid_votes: 20, current_rank: 22, percentage: 2.8 },
  { id: 23, word: "艺术", category: "娱乐", total_votes: 25, free_votes: 5, paid_votes: 20, current_rank: 23, percentage: 2.5 },
  { id: 24, word: "书籍", category: "娱乐", total_votes: 22, free_votes: 2, paid_votes: 20, current_rank: 24, percentage: 2.2 },
  { id: 25, word: "戏剧", category: "娱乐", total_votes: 20, free_votes: 0, paid_votes: 20, current_rank: 25, percentage: 2 },
  
  // 科技数码
  { id: 26, word: "电脑", category: "科技", total_votes: 18, free_votes: 0, paid_votes: 18, current_rank: 26, percentage: 1.8 },
  { id: 27, word: "机器人", category: "科技", total_votes: 16, free_votes: 0, paid_votes: 16, current_rank: 27, percentage: 1.6 },
  { id: 28, word: "无人机", category: "科技", total_votes: 14, free_votes: 0, paid_votes: 14, current_rank: 28, percentage: 1.4 },
  { id: 29, word: "电池", category: "科技", total_votes: 12, free_votes: 0, paid_votes: 12, current_rank: 29, percentage: 1.2 },
  { id: 30, word: "卫星", category: "科技", total_votes: 10, free_votes: 0, paid_votes: 10, current_rank: 30, percentage: 1 }
];

const mockUsers = new Map();

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0-simple'
  });
});

// 用户认证API
app.post('/api/auth/login', (req, res) => {
  const { wallet_address } = req.body;
  
  if (!wallet_address) {
    return res.status(400).json({ success: false, error: '钱包地址不能为空' });
  }

  // 模拟用户数据
  const user = {
    id: Date.now(),
    wallet_address,
    total_votes: mockUsers.get(wallet_address)?.total_votes || 0,
    total_paid_votes: mockUsers.get(wallet_address)?.total_paid_votes || 0,
    total_spent_sol: mockUsers.get(wallet_address)?.total_spent_sol || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  mockUsers.set(wallet_address, user);

  res.json({
    success: true,
    data: { user }
  });
});

app.get('/api/auth/user/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  const user = mockUsers.get(walletAddress);
  
  if (!user) {
    return res.status(404).json({ success: false, error: '用户不存在' });
  }

  res.json({
    success: true,
    data: { user }
  });
});

// 词条API
app.get('/api/words', (req, res) => {
  const { page = 1, limit = 300, search, category, sort = 'total_votes', order = 'desc' } = req.query;
  
  let filteredWords = [...mockWords];
  
  // 搜索过滤
  if (search) {
    filteredWords = filteredWords.filter(word => 
      word.word.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // 分类过滤
  if (category) {
    filteredWords = filteredWords.filter(word => 
      word.category === category
    );
  }
  
  // 排序
  filteredWords.sort((a, b) => {
    const aValue = a[sort] || 0;
    const bValue = b[sort] || 0;
    return order === 'desc' ? bValue - aValue : aValue - bValue;
  });
  
  // 分页
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedWords = filteredWords.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      data: paginatedWords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredWords.length,
        totalPages: Math.ceil(filteredWords.length / limit)
      }
    }
  });
});

app.get('/api/words/heatmap/top', (req, res) => {
  const { limit = 100 } = req.query;
  
  const topWords = mockWords
    .sort((a, b) => b.total_votes - a.total_votes)
    .slice(0, parseInt(limit));
  
  const totalVotes = mockWords.reduce((sum, word) => sum + word.total_votes, 0);
  
  res.json({
    success: true,
    data: {
      data: topWords,
      totalVotes,
      totalWords: mockWords.length
    }
  });
});

app.get('/api/words/categories/list', (req, res) => {
  const categories = {};
  
  mockWords.forEach(word => {
    if (!categories[word.category]) {
      categories[word.category] = {
        category: word.category,
        word_count: 0,
        total_votes: 0
      };
    }
    categories[word.category].word_count++;
    categories[word.category].total_votes += word.total_votes;
  });
  
  res.json({
    success: true,
    data: {
      categories: Object.values(categories)
    }
  });
});

// 投票API
app.get('/api/votes/user/:walletAddress/today', (req, res) => {
  const { walletAddress } = req.params;
  
  // 模拟今日投票状态
  const todayStats = {
    totalVotes: mockUsers.get(walletAddress)?.total_votes || 0,
    freeVotes: Math.min(mockUsers.get(walletAddress)?.total_votes || 0, 3),
    paidVotes: Math.max(0, (mockUsers.get(walletAddress)?.total_votes || 0) - 3),
    remainingFreeVotes: Math.max(0, 3 - (mockUsers.get(walletAddress)?.total_votes || 0)),
    remainingTotalVotes: Math.max(0, 50 - (mockUsers.get(walletAddress)?.total_votes || 0))
  };
  
  res.json({
    success: true,
    data: {
      todayStats,
      todayVotes: [],
      config: {
        freeVotesPerDay: 3,
        maxVotesPerDay: 50,
        paidVoteCost: 0.02
      }
    }
  });
});

app.post('/api/votes', (req, res) => {
  const { wallet_address, word_id, is_paid, tx_signature } = req.body;
  
  if (!wallet_address || !word_id) {
    return res.status(400).json({ success: false, error: '参数不完整' });
  }
  
  // 找到词条
  const word = mockWords.find(w => w.id === parseInt(word_id));
  if (!word) {
    return res.status(404).json({ success: false, error: '词条不存在' });
  }
  
  // 更新词条投票数
  word.total_votes++;
  if (is_paid) {
    word.paid_votes++;
  } else {
    word.free_votes++;
  }
  
  // 更新用户数据
  const user = mockUsers.get(wallet_address) || {
    id: Date.now(),
    wallet_address,
    total_votes: 0,
    total_paid_votes: 0,
    total_spent_sol: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  user.total_votes++;
  if (is_paid) {
    user.total_paid_votes++;
    user.total_spent_sol += 0.02;
  }
  user.updated_at = new Date().toISOString();
  
  mockUsers.set(wallet_address, user);
  
  // 重新排序
  mockWords.sort((a, b) => b.total_votes - a.total_votes);
  mockWords.forEach((word, index) => {
    word.current_rank = index + 1;
    word.percentage = Math.round((word.total_votes / mockWords.reduce((sum, w) => sum + w.total_votes, 0)) * 100);
  });
  
  res.json({
    success: true,
    data: {
      vote: {
        id: Date.now(),
        user_id: user.id,
        word_id: word.id,
        is_paid,
        created_at: new Date().toISOString()
      },
      user,
      word,
      todayStats: {
        totalVotes: user.total_votes,
        freeVotes: Math.min(user.total_votes, 3),
        paidVotes: Math.max(0, user.total_votes - 3)
      }
    }
  });
});

// 统计API
app.get('/api/stats/overview', (req, res) => {
  const totalVotes = mockWords.reduce((sum, word) => sum + word.total_votes, 0);
  const totalPaidVotes = mockWords.reduce((sum, word) => sum + word.paid_votes, 0);
  const totalRevenue = totalPaidVotes * 0.02;
  
  res.json({
    success: true,
    data: {
      users: {
        total: mockUsers.size,
        active: mockUsers.size
      },
      words: {
        total: mockWords.length,
        active: mockWords.length
      },
      today: {
        votes: totalVotes,
        revenue: totalRevenue
      },
      revenue: {
        total: totalRevenue,
        today: totalRevenue
      }
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`简化服务器启动成功，端口: ${PORT}`);
console.log(`健康检查: http://localhost:${PORT}/health`);
console.log(`API基础路径: http://localhost:${PORT}/api`);
}); 