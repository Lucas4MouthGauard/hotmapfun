const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取总体统计
router.get('/overview', async (req, res, next) => {
  try {
    // 用户统计
    const userStats = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_7d,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_30d
      FROM users
    `);

    // 词条统计
    const wordStats = await db.query(`
      SELECT 
        COUNT(*) as total_words,
        SUM(total_votes) as total_votes,
        SUM(free_votes) as total_free_votes,
        SUM(paid_votes) as total_paid_votes
      FROM meme_words
      WHERE is_active = true
    `);

    // 今日统计
    const todayStats = await db.query(`
      SELECT 
        COUNT(*) as today_votes,
        COUNT(CASE WHEN is_paid = true THEN 1 END) as today_paid_votes,
        COUNT(CASE WHEN is_paid = false THEN 1 END) as today_free_votes,
        COUNT(DISTINCT user_id) as today_active_users,
        COALESCE(SUM(CASE WHEN is_paid = true THEN amount_sol ELSE 0 END), 0) as today_revenue
      FROM votes
      WHERE vote_date = CURRENT_DATE
    `);

    // 收入统计
    const revenueStats = await db.query(`
      SELECT 
        COALESCE(SUM(amount_sol), 0) as total_revenue,
        COUNT(*) as total_transactions
      FROM transactions
      WHERE tx_status = 'confirmed'
    `);

    res.json({
      success: true,
      data: {
        users: userStats.rows[0],
        words: wordStats.rows[0],
        today: todayStats.rows[0],
        revenue: revenueStats.rows[0]
      }
    });

  } catch (error) {
    next(error);
  }
});

// 获取每日统计
router.get('/daily', async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const dailyStats = await db.query(`
      SELECT 
        vote_date,
        COUNT(*) as total_votes,
        COUNT(CASE WHEN is_paid = true THEN 1 END) as paid_votes,
        COUNT(CASE WHEN is_paid = false THEN 1 END) as free_votes,
        COUNT(DISTINCT user_id) as active_users,
        COALESCE(SUM(CASE WHEN is_paid = true THEN amount_sol ELSE 0 END), 0) as revenue
      FROM votes
      WHERE vote_date >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY vote_date
      ORDER BY vote_date DESC
    `);

    res.json({
      success: true,
      data: dailyStats.rows
    });

  } catch (error) {
    next(error);
  }
});

// 获取热门词条排行
router.get('/top-words', async (req, res, next) => {
  try {
    const { limit = 20, days = 7 } = req.query;

    const topWords = await db.query(`
      SELECT 
        w.id, w.word, w.category,
        w.total_votes, w.current_rank,
        COUNT(v.id) as vote_count
      FROM meme_words w
      LEFT JOIN votes v ON w.id = v.word_id 
        AND v.vote_date >= CURRENT_DATE - INTERVAL '${days} days'
      WHERE w.is_active = true
      GROUP BY w.id, w.word, w.category, w.total_votes, w.current_rank
      ORDER BY vote_count DESC, w.total_votes DESC
      LIMIT $1
    `, [parseInt(limit)]);

    res.json({
      success: true,
      data: topWords.rows
    });

  } catch (error) {
    next(error);
  }
});

// 获取用户活跃度排行
router.get('/top-users', async (req, res, next) => {
  try {
    const { limit = 20, days = 30 } = req.query;

    const topUsers = await db.query(`
      SELECT 
        u.wallet_address,
        u.total_votes,
        u.total_paid_votes,
        u.total_spent_sol,
        COUNT(v.id) as recent_votes,
        COUNT(CASE WHEN v.is_paid = true THEN 1 END) as recent_paid_votes
      FROM users u
      LEFT JOIN votes v ON u.id = v.user_id 
        AND v.vote_date >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY u.id, u.wallet_address, u.total_votes, u.total_paid_votes, u.total_spent_sol
      ORDER BY recent_votes DESC, u.total_votes DESC
      LIMIT $1
    `, [parseInt(limit)]);

    res.json({
      success: true,
      data: topUsers.rows
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router; 