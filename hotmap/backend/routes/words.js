const express = require('express');
const Joi = require('joi');
const router = express.Router();
const db = require('../config/database');

// 获取所有词条（支持分页和搜索）
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      search, 
      category, 
      sort = 'total_votes', 
      order = 'desc' 
    } = req.query;

    const offset = (page - 1) * limit;
    const validSortFields = ['total_votes', 'current_rank', 'created_at', 'word'];
    const validOrders = ['asc', 'desc'];

    if (!validSortFields.includes(sort)) {
      return res.status(400).json({
        error: '排序字段无效',
        message: `排序字段必须是: ${validSortFields.join(', ')}`
      });
    }

    if (!validOrders.includes(order)) {
      return res.status(400).json({
        error: '排序方向无效',
        message: '排序方向必须是: asc 或 desc'
      });
    }

    // 构建查询条件
    let whereClause = 'WHERE is_active = true';
    const queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (word ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    // 获取总数
    const countQuery = `SELECT COUNT(*) FROM meme_words ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // 获取词条列表
    const wordsQuery = `
      SELECT 
        id, word, category, description,
        total_votes, free_votes, paid_votes, current_rank,
        created_at, updated_at
      FROM meme_words 
      ${whereClause}
      ORDER BY ${sort} ${order.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(parseInt(limit), offset);
    const wordsResult = await db.query(wordsQuery, queryParams);

    // 计算百分比
    const totalVotes = wordsResult.rows.reduce((sum, word) => sum + parseInt(word.total_votes), 0);
    const wordsWithPercentage = wordsResult.rows.map(word => ({
      ...word,
      percentage: totalVotes > 0 ? (parseInt(word.total_votes) / totalVotes * 100).toFixed(2) : 0
    }));

    res.json({
      success: true,
      data: wordsWithPercentage,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

// 获取单个词条详情
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const word = await db.query(
      `SELECT 
        id, word, category, description,
        total_votes, free_votes, paid_votes, current_rank,
        created_at, updated_at
       FROM meme_words 
       WHERE id = $1 AND is_active = true`,
      [id]
    );

    if (word.rows.length === 0) {
      return res.status(404).json({
        error: '词条不存在',
        message: '该词条不存在或已被删除'
      });
    }

    // 获取该词条的投票历史
    const voteHistory = await db.query(
      `SELECT 
        v.vote_date,
        COUNT(*) as daily_votes,
        COUNT(CASE WHEN v.is_paid = true THEN 1 END) as daily_paid_votes,
        COUNT(CASE WHEN v.is_paid = false THEN 1 END) as daily_free_votes
       FROM votes v
       WHERE v.word_id = $1
       GROUP BY v.vote_date
       ORDER BY v.vote_date DESC
       LIMIT 30`,
      [id]
    );

    res.json({
      success: true,
      word: word.rows[0],
      voteHistory: voteHistory.rows
    });

  } catch (error) {
    next(error);
  }
});

// 获取热力图数据（前N个词条）
router.get('/heatmap/top', async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;

    const words = await db.query(
      `SELECT 
        id, word, category,
        total_votes, free_votes, paid_votes, current_rank
       FROM meme_words 
       WHERE is_active = true
       ORDER BY total_votes DESC, current_rank ASC
       LIMIT $1`,
      [parseInt(limit)]
    );

    // 计算百分比和热度值
    const totalVotes = words.rows.reduce((sum, word) => sum + parseInt(word.total_votes), 0);
    const wordsWithHeat = words.rows.map((word, index) => {
      const percentage = totalVotes > 0 ? (parseInt(word.total_votes) / totalVotes * 100).toFixed(2) : 0;
      const heatValue = Math.max(0.1, percentage / 10); // 热度值 0.1-10
      
      return {
        ...word,
        percentage: parseFloat(percentage),
        heatValue: parseFloat(heatValue.toFixed(2)),
        rank: index + 1
      };
    });

    res.json({
      success: true,
      data: wordsWithHeat,
      totalVotes,
      totalWords: words.rows.length
    });

  } catch (error) {
    next(error);
  }
});

// 获取词条分类列表
router.get('/categories/list', async (req, res, next) => {
  try {
    const categories = await db.query(
      `SELECT 
        category,
        COUNT(*) as word_count,
        SUM(total_votes) as total_votes
       FROM meme_words 
       WHERE is_active = true
       GROUP BY category
       ORDER BY total_votes DESC`
    );

    res.json({
      success: true,
      categories: categories.rows
    });

  } catch (error) {
    next(error);
  }
});

// 新增词条（管理员功能）
const wordSchema = Joi.object({
  word: Joi.string().min(1).max(100).required(),
  category: Joi.string().min(1).max(50).required(),
  description: Joi.string().max(500).optional()
});

router.post('/', async (req, res, next) => {
  try {
    const { error, value } = wordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: '参数验证失败',
        message: error.details[0].message
      });
    }

    const { word, category, description } = value;

    // 检查词条是否已存在
    const existingWord = await db.query(
      'SELECT id FROM meme_words WHERE word = $1',
      [word]
    );

    if (existingWord.rows.length > 0) {
      return res.status(409).json({
        error: '词条已存在',
        message: '该词条已存在，请勿重复添加'
      });
    }

    // 新增词条
    const newWord = await db.query(
      `INSERT INTO meme_words (word, category, description) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [word, category, description || '']
    );

    res.status(201).json({
      success: true,
      message: '词条添加成功',
      word: newWord.rows[0]
    });

  } catch (error) {
    next(error);
  }
});

// 更新词条排名（定时任务调用）
router.post('/update-ranks', async (req, res, next) => {
  try {
    // 使用窗口函数更新排名
    await db.query(`
      UPDATE meme_words 
      SET current_rank = rank_result.new_rank
      FROM (
        SELECT 
          id,
          ROW_NUMBER() OVER (ORDER BY total_votes DESC, created_at ASC) as new_rank
        FROM meme_words 
        WHERE is_active = true
      ) rank_result
      WHERE meme_words.id = rank_result.id
    `);

    res.json({
      success: true,
      message: '词条排名更新成功'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router; 