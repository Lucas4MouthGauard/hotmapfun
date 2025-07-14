-- Meme热词排行系统数据库设计
-- PostgreSQL Schema

-- 1. 用户表 - 存储钱包用户信息
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(64) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    avatar_url TEXT,
    total_votes INTEGER DEFAULT 0,
    total_paid_votes INTEGER DEFAULT 0,
    total_spent_sol NUMERIC(10, 6) DEFAULT 0,
    first_vote_at TIMESTAMP,
    last_vote_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 词条表 - 存储meme词条信息
CREATE TABLE meme_words (
    id SERIAL PRIMARY KEY,
    word VARCHAR(100) UNIQUE NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    total_votes INTEGER DEFAULT 0,
    free_votes INTEGER DEFAULT 0,
    paid_votes INTEGER DEFAULT 0,
    current_rank INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 投票记录表 - 存储每次投票详情
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id INTEGER NOT NULL REFERENCES meme_words(id) ON DELETE CASCADE,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    amount_sol NUMERIC(10, 6) DEFAULT 0,
    tx_signature VARCHAR(128),
    tx_status VARCHAR(20) DEFAULT 'pending',
    vote_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 确保每个用户每天对同一词条只能投票一次
    UNIQUE(user_id, word_id, vote_date)
);

-- 4. 交易记录表 - 存储链上交易详情
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_id INTEGER REFERENCES votes(id) ON DELETE SET NULL,
    tx_signature VARCHAR(128) UNIQUE NOT NULL,
    from_address VARCHAR(64) NOT NULL,
    to_address VARCHAR(64) NOT NULL,
    amount_sol NUMERIC(10, 6) NOT NULL,
    fee_sol NUMERIC(10, 6) DEFAULT 0,
    block_number BIGINT,
    tx_status VARCHAR(20) DEFAULT 'pending',
    tx_type VARCHAR(20) DEFAULT 'vote_payment',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

-- 5. 每日统计表 - 存储每日统计数据
CREATE TABLE daily_stats (
    id SERIAL PRIMARY KEY,
    stat_date DATE UNIQUE NOT NULL,
    total_votes INTEGER DEFAULT 0,
    free_votes INTEGER DEFAULT 0,
    paid_votes INTEGER DEFAULT 0,
    total_revenue_sol NUMERIC(10, 6) DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 词条热度历史表 - 存储词条每日热度变化
CREATE TABLE word_rank_history (
    id SERIAL PRIMARY KEY,
    word_id INTEGER NOT NULL REFERENCES meme_words(id) ON DELETE CASCADE,
    rank_date DATE NOT NULL,
    rank_position INTEGER NOT NULL,
    total_votes INTEGER DEFAULT 0,
    daily_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(word_id, rank_date)
);

-- 7. 系统配置表 - 存储系统配置参数
CREATE TABLE system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_votes_user_date ON votes(user_id, vote_date);
CREATE INDEX idx_votes_word_date ON votes(word_id, vote_date);
CREATE INDEX idx_transactions_signature ON transactions(tx_signature);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_word_rank_history_date ON word_rank_history(rank_date);
CREATE INDEX idx_word_rank_history_word_date ON word_rank_history(word_id, rank_date);

-- 创建触发器函数 - 自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meme_words_updated_at BEFORE UPDATE ON meme_words FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入初始系统配置
INSERT INTO system_config (config_key, config_value, description) VALUES
('free_votes_per_day', '3', '每日免费投票次数'),
('paid_vote_cost_sol', '0.02', '付费投票费用(SOL)'),
('max_votes_per_day', '50', '每日最大投票次数'),
('heatmap_top_count', '100', '热力图显示数量'),
('project_wallet', '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', '项目方收款钱包地址'),
('solana_network', 'devnet', 'Solana网络环境');

-- 插入示例词条数据
INSERT INTO meme_words (word, emoji, category, description) VALUES
('示例词条1', '🔥', '网络', '这是一个示例词条'),
('示例词条2', '🎮', '游戏', '游戏相关词条'),
('示例词条3', '��', '生活', '生活相关词条'); 