// 内存数据库实现
class MemoryDatabase {
  constructor() {
    this.data = {
      users: new Map(),
      words: new Map(),
      votes: new Map(),
      config: new Map()
    };
    
    this.initDatabase();
  }

  initDatabase() {
    // 初始化系统配置
    this.data.config.set('free_votes_per_day', '3');
    this.data.config.set('paid_vote_cost_sol', '0.02');
    this.data.config.set('max_votes_per_day', '50');
    this.data.config.set('heatmap_top_count', '100');

    // 模拟词条数据
    const mockWords = [
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
      { id: 11, word: "牛市", category: "投资", total_votes: 95, free_votes: 75, paid_votes: 20, current_rank: 11, percentage: 9.5 },
      { id: 12, word: "熊市", category: "投资", total_votes: 85, free_votes: 65, paid_votes: 20, current_rank: 12, percentage: 8.5 },
      { id: 13, word: "财富", category: "投资", total_votes: 75, free_votes: 55, paid_votes: 20, current_rank: 13, percentage: 7.5 },
      { id: 14, word: "银行", category: "投资", total_votes: 65, free_votes: 45, paid_votes: 20, current_rank: 14, percentage: 6.5 },
      { id: 15, word: "信用卡", category: "投资", total_votes: 55, free_votes: 35, paid_votes: 20, current_rank: 15, percentage: 5.5 },
      { id: 16, word: "睡觉", category: "生活", total_votes: 45, free_votes: 25, paid_votes: 20, current_rank: 16, percentage: 4.5 },
      { id: 17, word: "汉堡", category: "生活", total_votes: 42, free_votes: 22, paid_votes: 20, current_rank: 17, percentage: 4.2 },
      { id: 18, word: "房子", category: "生活", total_votes: 38, free_votes: 18, paid_votes: 20, current_rank: 18, percentage: 3.8 },
      { id: 19, word: "汽车", category: "生活", total_votes: 35, free_votes: 15, paid_votes: 20, current_rank: 19, percentage: 3.5 },
      { id: 20, word: "手机", category: "生活", total_votes: 32, free_votes: 12, paid_votes: 20, current_rank: 20, percentage: 3.2 }
    ];

    mockWords.forEach(word => {
      this.data.words.set(word.id, word);
    });

    console.log('内存数据库初始化完成');
  }

  async getUser(walletAddress) {
    return this.data.users.get(walletAddress) || null;
  }

  async createUser(walletAddress) {
    const user = {
      id: Date.now(),
      wallet_address: walletAddress,
      total_votes: 0,
      total_paid_votes: 0,
      total_spent_sol: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.data.users.set(walletAddress, user);
    return user;
  }

  async getWords() {
    return Array.from(this.data.words.values());
  }

  async updateWord(id, updates) {
    const word = this.data.words.get(parseInt(id));
    if (word) {
      Object.assign(word, updates);
      this.data.words.set(parseInt(id), word);
    }
    return word;
  }

  async close() {
    return Promise.resolve();
  }
}

const db = new MemoryDatabase();
module.exports = db; 