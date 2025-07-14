const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../data/meme_hotmap.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite数据库连接失败:', err.message);
  } else {
    console.log('SQLite数据库连接成功');
    initDatabase();
  }
});

// 初始化数据库表
function initDatabase() {
  // 启用外键约束
  db.run('PRAGMA foreign_keys = ON');
  
  // 创建用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet_address TEXT UNIQUE NOT NULL,
      nickname TEXT,
      avatar_url TEXT,
      total_votes INTEGER DEFAULT 0,
      total_paid_votes INTEGER DEFAULT 0,
      total_spent_sol REAL DEFAULT 0,
      first_vote_at DATETIME,
      last_vote_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建词条表
  db.run(`
    CREATE TABLE IF NOT EXISTS meme_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT UNIQUE NOT NULL,
      emoji TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      total_votes INTEGER DEFAULT 0,
      free_votes INTEGER DEFAULT 0,
      paid_votes INTEGER DEFAULT 0,
      current_rank INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建投票记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      word_id INTEGER NOT NULL,
      is_paid BOOLEAN NOT NULL DEFAULT 0,
      amount_sol REAL DEFAULT 0,
      tx_signature TEXT,
      tx_status TEXT DEFAULT 'pending',
      vote_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (word_id) REFERENCES meme_words (id) ON DELETE CASCADE,
      UNIQUE(user_id, word_id, vote_date)
    )
  `);

  // 创建交易记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      vote_id INTEGER,
      tx_signature TEXT UNIQUE NOT NULL,
      from_address TEXT NOT NULL,
      to_address TEXT NOT NULL,
      amount_sol REAL NOT NULL,
      fee_sol REAL DEFAULT 0,
      block_number INTEGER,
      tx_status TEXT DEFAULT 'pending',
      tx_type TEXT DEFAULT 'vote_payment',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      confirmed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (vote_id) REFERENCES votes (id) ON DELETE SET NULL
    )
  `);

  // 创建每日统计表
  db.run(`
    CREATE TABLE IF NOT EXISTS daily_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stat_date DATE UNIQUE NOT NULL,
      total_votes INTEGER DEFAULT 0,
      free_votes INTEGER DEFAULT 0,
      paid_votes INTEGER DEFAULT 0,
      total_revenue_sol REAL DEFAULT 0,
      active_users INTEGER DEFAULT 0,
      new_users INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建系统配置表
  db.run(`
    CREATE TABLE IF NOT EXISTS system_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_key TEXT UNIQUE NOT NULL,
      config_value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 插入初始配置
  db.run(`
    INSERT OR IGNORE INTO system_config (config_key, config_value, description) VALUES
    ('free_votes_per_day', '3', '每日免费投票次数'),
    ('paid_vote_cost_sol', '0.02', '付费投票费用(SOL)'),
    ('max_votes_per_day', '50', '每日最大投票次数'),
    ('heatmap_top_count', '100', '热力图显示数量'),
    ('project_wallet', '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', '项目方收款钱包地址'),
    ('solana_network', 'devnet', 'Solana网络环境')
  `);

  // 插入示例词条数据
  const sampleWords = [
    ['火箭', '火箭', '网络', '火箭发射，一飞冲天', 150, 120, 30, 1],
    ['热词', '热词', '网络', '热门词汇，火爆全网', 120, 100, 20, 2],
    ['钻石手', '钻石手', '网络', '钻石般坚定的持有者', 100, 80, 20, 3],
    ['月亮', '月亮', '网络', '奔向月球，梦想成真', 90, 70, 20, 4],
    ['狗狗', '狗狗', '网络', '忠诚的狗狗币', 80, 60, 20, 5],
    ['猫咪', '猫咪', '网络', '可爱的猫咪币', 70, 50, 20, 6],
    ['披萨', '披萨', '网络', '披萨日纪念', 60, 40, 20, 7],
    ['咖啡', '咖啡', '网络', '咖啡时间', 50, 30, 20, 8],
    ['音乐', '音乐', '网络', '音乐的力量', 40, 20, 20, 9],
    ['游戏', '游戏', '网络', '游戏人生', 35, 15, 20, 10],
    ['牛市', '牛市', '投资', '市场上涨趋势', 95, 75, 20, 11],
    ['熊市', '熊市', '投资', '市场下跌趋势', 85, 65, 20, 12],
    ['财富', '财富', '投资', '财富自由', 75, 55, 20, 13],
    ['银行', '银行', '投资', '传统金融机构', 65, 45, 20, 14],
    ['信用卡', '信用卡', '投资', '信用消费', 55, 35, 20, 15],
    ['睡觉', '睡觉', '生活', '休息时间', 45, 25, 20, 16],
    ['汉堡', '汉堡', '生活', '快餐文化', 42, 22, 20, 17],
    ['房子', '房子', '生活', '家的温暖', 38, 18, 20, 18],
    ['汽车', '汽车', '生活', '出行工具', 35, 15, 20, 19],
    ['手机', '手机', '生活', '智能设备', 32, 12, 20, 20],
    ['电影', '电影', '娱乐', '影视娱乐', 30, 10, 20, 21],
    ['电视', '电视', '娱乐', '家庭娱乐', 28, 8, 20, 22],
    ['艺术', '艺术', '娱乐', '艺术创作', 25, 5, 20, 23],
    ['书籍', '书籍', '娱乐', '知识宝库', 22, 2, 20, 24],
    ['戏剧', '戏剧', '娱乐', '舞台表演', 20, 0, 20, 25],
    ['电脑', '电脑', '科技', '计算设备', 18, 0, 18, 26],
    ['机器人', '机器人', '科技', '人工智能', 16, 0, 16, 27],
    ['无人机', '无人机', '科技', '飞行器', 14, 0, 14, 28],
    ['电池', '电池', '科技', '能源存储', 12, 0, 12, 29],
    ['卫星', '卫星', '科技', '通信设备', 10, 0, 10, 30]
  ];

  const insertWord = db.prepare(`
    INSERT OR IGNORE INTO meme_words (word, emoji, category, description, total_votes, free_votes, paid_votes, current_rank)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleWords.forEach(word => {
    insertWord.run(word);
  });

  insertWord.finalize();

  console.log('数据库表初始化完成');
}

// 封装数据库操作
const dbWrapper = {
  // 执行查询
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // 执行单行查询
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // 执行插入/更新/删除
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  },

  // 关闭数据库连接
  close: () => {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
};

module.exports = dbWrapper; 