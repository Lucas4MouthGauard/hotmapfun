const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/database-memory');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0-with-db'
  });
});

// 用户认证API
app.post('/api/auth/login', async (req, res) => {
  const { wallet_address } = req.body;
  
  if (!wallet_address) {
    return res.status(400).json({ success: false, error: '钱包地址不能为空' });
  }

  try {
    let user = await db.getUser(wallet_address);
    
    if (!user) {
      user = await db.createUser(wallet_address);
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

app.get('/api/auth/user/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;
  
  try {
    const user = await db.getUser(walletAddress);
    
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('获取用户错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 词条API
app.get('/api/words', async (req, res) => {
  const { page = 1, limit = 300, search, category, sort = 'total_votes', order = 'desc' } = req.query;
  
  try {
    let words = await db.getWords();
    
    // 搜索过滤
    if (search) {
      words = words.filter(word => 
        word.word.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // 分类过滤
    if (category) {
      words = words.filter(word => 
        word.category === category
      );
    }
    
    // 排序
    words.sort((a, b) => {
      const aValue = a[sort] || 0;
      const bValue = b[sort] || 0;
      return order === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedWords = words.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        data: paginatedWords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: words.length,
          totalPages: Math.ceil(words.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取词条错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

app.get('/api/words/heatmap/top', async (req, res) => {
  const { limit = 100 } = req.query;
  
  try {
    const words = await db.getWords();
    const topWords = words
      .sort((a, b) => b.total_votes - a.total_votes)
      .slice(0, parseInt(limit));
    
    const totalVotes = words.reduce((sum, word) => sum + word.total_votes, 0);
    
    res.json({
      success: true,
      data: {
        data: topWords,
        totalVotes,
        totalWords: words.length
      }
    });
  } catch (error) {
    console.error('获取热力图数据错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

app.get('/api/words/categories/list', async (req, res) => {
  try {
    const words = await db.getWords();
    const categories = {};
    
    words.forEach(word => {
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
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 投票API
app.get('/api/votes/user/:walletAddress/today', async (req, res) => {
  const { walletAddress } = req.params;
  
  try {
    const user = await db.getUser(walletAddress);
    const totalVotes = user ? user.total_votes : 0;
    
    // 模拟今日投票状态
    const todayStats = {
      totalVotes: totalVotes,
      freeVotes: Math.min(totalVotes, 3),
      paidVotes: Math.max(0, totalVotes - 3),
      remainingFreeVotes: Math.max(0, 3 - totalVotes),
      remainingTotalVotes: Math.max(0, 50 - totalVotes)
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
  } catch (error) {
    console.error('获取投票状态错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

app.post('/api/votes', async (req, res) => {
  const { wallet_address, word_id, is_paid, tx_signature } = req.body;
  
  if (!wallet_address || !word_id) {
    return res.status(400).json({ success: false, error: '参数不完整' });
  }
  
  try {
    // 获取或创建用户
    let user = await db.getUser(wallet_address);
    if (!user) {
      user = await db.createUser(wallet_address);
    }
    
    // 获取词条
    const words = await db.getWords();
    const word = words.find(w => w.id === parseInt(word_id));
    
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
    
    await db.updateWord(word.id, word);
    
    // 更新用户数据
    user.total_votes++;
    if (is_paid) {
      user.total_paid_votes++;
      user.total_spent_sol += 0.02;
    }
    user.updated_at = new Date().toISOString();
    
    // 重新排序
    const allWords = await db.getWords();
    allWords.sort((a, b) => b.total_votes - a.total_votes);
    allWords.forEach((w, index) => {
      w.current_rank = index + 1;
      w.percentage = Math.round((w.total_votes / allWords.reduce((sum, word) => sum + word.total_votes, 0)) * 100);
      db.updateWord(w.id, w);
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
  } catch (error) {
    console.error('投票错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 统计API
app.get('/api/stats/overview', async (req, res) => {
  try {
    const words = await db.getWords();
    const totalVotes = words.reduce((sum, word) => sum + word.total_votes, 0);
    const totalPaidVotes = words.reduce((sum, word) => sum + word.paid_votes, 0);
    const totalRevenue = totalPaidVotes * 0.02;
    
    res.json({
      success: true,
      data: {
        users: {
          total: 1, // 简化统计
          active: 1
        },
        words: {
          total: words.length,
          active: words.length
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
  } catch (error) {
    console.error('获取统计错误:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`数据库服务器启动成功，端口: ${PORT}`);
console.log(`健康检查: http://localhost:${PORT}/health`);
console.log(`API基础路径: http://localhost:${PORT}/api`);
  console.log(`使用内存数据库，数据持久化到内存中`);
}); 