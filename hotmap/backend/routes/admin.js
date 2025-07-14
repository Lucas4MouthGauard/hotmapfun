const express = require('express')
const router = express.Router()
const pool = require('../config/database')
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const { validateQuery, validateParams, commonSchemas } = require('../middleware/inputValidation')
const Joi = require('joi')
const { validateInput } = require('../middleware/inputValidation')

// 所有管理员路由都需要身份验证和授权
router.use(authenticateToken);
router.use(requireAdmin);

// 获取所有用户
router.get('/users', validateQuery(commonSchemas.pagination), async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.validatedQuery;
    const offset = (page - 1) * limit;
    
    const result = await pool.query(`
      SELECT 
        id, 
        wallet_address, 
        nickname,
        total_votes, 
        total_paid_votes, 
        total_spent_sol, 
        first_vote_at,
        last_vote_at,
        created_at, 
        updated_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])
    
    // 获取总数
    const countResult = await pool.query('SELECT COUNT(*) as total FROM users')
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({
      success: false,
      error: '获取用户列表失败'
    })
  }
})

// 删除用户
router.delete('/users/:id', validateParams(Joi.object({
  id: Joi.number().integer().positive().required()
})), async (req, res) => {
  const { id } = req.validatedParams
  
  try {
    // 检查用户是否存在
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id])
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      })
    }
    
    // 使用事务确保数据一致性
    await pool.transaction(async (client) => {
      // 先删除用户的投票记录
      await client.query('DELETE FROM votes WHERE user_id = $1', [id])
      
      // 删除用户的交易记录
      await client.query('DELETE FROM transactions WHERE user_id = $1', [id])
      
      // 删除用户
      const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id])
      
      return result.rows[0]
    })
    
    res.json({
      success: true,
      message: '用户删除成功'
    })
  } catch (error) {
    console.error('删除用户失败:', error)
    res.status(500).json({
      success: false,
      error: '删除用户失败'
    })
  }
})

// 获取所有投票记录
router.get('/votes', validateQuery(commonSchemas.pagination), async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.validatedQuery;
    const offset = (page - 1) * limit;
    
    const result = await pool.query(`
      SELECT 
        v.id,
        v.user_id,
        v.word_id,
        v.is_paid,
        v.amount_sol,
        v.tx_signature,
        v.tx_status,
        v.vote_date,
        v.created_at,
        u.wallet_address,
        w.word
      FROM votes v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN meme_words w ON v.word_id = w.id
      ORDER BY v.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])
    
    // 获取总数
    const countResult = await pool.query('SELECT COUNT(*) as total FROM votes')
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    })
  } catch (error) {
    console.error('获取投票记录失败:', error)
    res.status(500).json({
      success: false,
      error: '获取投票记录失败'
    })
  }
})

// 获取系统配置
router.get('/configs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        config_key,
        config_value,
        description,
        updated_at
      FROM system_config 
      ORDER BY config_key
    `)
    
    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('获取系统配置失败:', error)
    res.status(500).json({
      success: false,
      error: '获取系统配置失败'
    })
  }
})

// 更新系统配置
router.patch('/configs/:id', validateParams(Joi.object({
  id: Joi.number().integer().positive().required()
})), validateInput(Joi.object({
  config_value: Joi.string().max(1000).required()
})), async (req, res) => {
  const { id } = req.validatedParams
  const { config_value } = req.validatedBody
  
  try {
    const result = await pool.query(`
      UPDATE system_config 
      SET config_value = $1, updated_at = NOW()
      WHERE id = $2 
      RETURNING *
    `, [config_value, id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '配置不存在'
      })
    }
    
    res.json({
      success: true,
      message: '配置更新成功',
      data: result.rows[0]
    })
  } catch (error) {
    console.error('更新配置失败:', error)
    res.status(500).json({
      success: false,
      error: '更新配置失败'
    })
  }
})

// 更新词汇状态
router.patch('/words/:id', validateParams(Joi.object({
  id: Joi.number().integer().positive().required()
})), validateInput(Joi.object({
  is_active: Joi.boolean().required()
})), async (req, res) => {
  const { id } = req.validatedParams
  const { is_active } = req.validatedBody
  
  try {
    const result = await pool.query(`
      UPDATE meme_words 
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2 
      RETURNING *
    `, [is_active, id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '词汇不存在'
      })
    }
    
    res.json({
      success: true,
      message: '词汇状态更新成功',
      data: result.rows[0]
    })
  } catch (error) {
    console.error('更新词汇状态失败:', error)
    res.status(500).json({
      success: false,
      error: '更新词汇状态失败'
    })
  }
})

// 编辑词汇
router.put('/words/:id', validateParams(Joi.object({
  id: Joi.number().integer().positive().required()
})), validateInput(Joi.object({
  word: Joi.string().min(1).max(100).required(),
  category: Joi.string().min(1).max(50).required(),
  description: Joi.string().max(500).optional()
})), async (req, res) => {
  const { id } = req.validatedParams
  const { word, category, description } = req.validatedBody
  
  try {
    // 检查词条是否已存在（排除当前词条）
    const existingWord = await pool.query(
      'SELECT id FROM meme_words WHERE word = $1 AND id != $2',
      [word, id]
    )

    if (existingWord.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: '词条已存在',
        message: '该词条名称已存在，请使用其他名称'
      })
    }
    
    const result = await pool.query(`
      UPDATE meme_words 
      SET word = $1, category = $2, description = $3, updated_at = NOW()
      WHERE id = $4 
      RETURNING *
    `, [word, category, description || '', id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '词汇不存在'
      })
    }
    
    res.json({
      success: true,
      message: '词汇更新成功',
      data: result.rows[0]
    })
  } catch (error) {
    console.error('更新词汇失败:', error)
    res.status(500).json({
      success: false,
      error: '更新词汇失败'
    })
  }
})

// 删除词汇
router.delete('/words/:id', validateParams(Joi.object({
  id: Joi.number().integer().positive().required()
})), async (req, res) => {
  const { id } = req.validatedParams
  
  try {
    // 检查词汇是否存在
    const wordCheck = await pool.query('SELECT id FROM meme_words WHERE id = $1', [id])
    if (wordCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '词汇不存在'
      })
    }
    
    // 使用事务确保数据一致性
    await pool.transaction(async (client) => {
      // 先删除相关的投票记录
      await client.query('DELETE FROM votes WHERE word_id = $1', [id])
      
      // 删除词汇
      const result = await client.query('DELETE FROM meme_words WHERE id = $1 RETURNING *', [id])
      
      return result.rows[0]
    })
    
    res.json({
      success: true,
      message: '词汇删除成功'
    })
  } catch (error) {
    console.error('删除词汇失败:', error)
    res.status(500).json({
      success: false,
      error: '删除词汇失败'
    })
  }
})

// 获取所有词汇
router.get('/words', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        word,
        category,
        description,
        total_votes,
        free_votes,
        paid_votes,
        current_rank,
        is_active,
        created_at,
        updated_at
      FROM meme_words 
      ORDER BY created_at DESC
    `)
    
    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('获取词汇列表失败:', error)
    res.status(500).json({
      success: false,
      error: '获取词汇列表失败'
    })
  }
})

// 添加新词汇
router.post('/words', async (req, res) => {
  const { word, category, description } = req.body
  
  try {
    // 首先检查词汇是否已存在
    const existingWord = await pool.query('SELECT * FROM meme_words WHERE word = $1', [word])
    
    if (existingWord.rows.length > 0) {
      // 如果词汇已存在，返回错误提示
      return res.status(409).json({
        success: false,
        error: `词汇"${word}"已存在，请使用其他词汇名称`
      })
    }
    
    // 如果词汇不存在，添加新词汇
    const result = await pool.query(`
      INSERT INTO meme_words (word, category, description, is_active)
      VALUES ($1, $2, $3, true)
      RETURNING *
    `, [word, category, description])
    
    res.status(201).json({
      success: true,
      message: '词汇添加成功',
      data: result.rows[0]
    })
  } catch (error) {
    console.error('添加词汇失败:', error)
    res.status(500).json({
      success: false,
      error: '添加词汇失败'
    })
  }
})

// 获取用户详细统计
router.get('/users/:id/stats', validateParams(Joi.object({
  id: Joi.number().integer().positive().required()
})), async (req, res) => {
  const { id } = req.validatedParams
  
  try {
    // 获取用户基本信息
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      })
    }
    
    // 获取用户投票历史
    const votesResult = await pool.query(`
      SELECT 
        v.*,
        w.word
      FROM votes v
      LEFT JOIN meme_words w ON v.word_id = w.id
      WHERE v.user_id = $1
      ORDER BY v.created_at DESC
      LIMIT 100
    `, [id])
    
    // 获取用户每日投票统计
    const dailyStatsResult = await pool.query(`
      SELECT 
        vote_date,
        COUNT(*) as vote_count,
        SUM(CASE WHEN is_paid THEN 1 ELSE 0 END) as paid_votes,
        SUM(CASE WHEN is_paid THEN amount_sol ELSE 0 END) as spent_sol
      FROM votes 
      WHERE user_id = $1
      GROUP BY vote_date
      ORDER BY vote_date DESC
      LIMIT 30
    `, [id])
    
    res.json({
      success: true,
      data: {
        user: userResult.rows[0],
        votes: votesResult.rows,
        dailyStats: dailyStatsResult.rows
      }
    })
  } catch (error) {
    console.error('获取用户统计失败:', error)
    res.status(500).json({
      success: false,
      error: '获取用户统计失败'
    })
  }
})

// 获取词汇详细统计
router.get('/words/:id/stats', validateParams(Joi.object({
  id: Joi.number().integer().positive().required()
})), async (req, res) => {
  const { id } = req.validatedParams
  
  try {
    // 获取词汇基本信息
    const wordResult = await pool.query('SELECT * FROM meme_words WHERE id = $1', [id])
    if (wordResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '词汇不存在'
      })
    }
    
    // 获取词汇投票历史
    const votesResult = await pool.query(`
      SELECT 
        v.*,
        u.wallet_address
      FROM votes v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.word_id = $1
      ORDER BY v.created_at DESC
      LIMIT 100
    `, [id])
    
    // 获取词汇每日投票统计
    const dailyStatsResult = await pool.query(`
      SELECT 
        vote_date,
        COUNT(*) as vote_count,
        SUM(CASE WHEN is_paid THEN 1 ELSE 0 END) as paid_votes,
        SUM(CASE WHEN is_paid THEN amount_sol ELSE 0 END) as revenue
      FROM votes 
      WHERE word_id = $1
      GROUP BY vote_date
      ORDER BY vote_date DESC
      LIMIT 30
    `, [id])
    
    res.json({
      success: true,
      data: {
        word: wordResult.rows[0],
        votes: votesResult.rows,
        dailyStats: dailyStatsResult.rows
      }
    })
  } catch (error) {
    console.error('获取词汇统计失败:', error)
    res.status(500).json({
      success: false,
      error: '获取词汇统计失败'
    })
  }
})

module.exports = router 